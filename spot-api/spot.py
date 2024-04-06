import bosdyn.client
import bosdyn.client.lease
import bosdyn.client.util
import bosdyn.geometry
from bosdyn.api import trajectory_pb2
from bosdyn.api.spot import robot_command_pb2
from bosdyn.api import world_object_pb2
from bosdyn.client import math_helpers
from bosdyn.client import create_standard_sdk
from bosdyn.client.frame_helpers import GRAV_ALIGNED_BODY_FRAME_NAME, ODOM_FRAME_NAME, get_a_tform_b, get_se2_a_tform_b,BODY_FRAME_NAME
from bosdyn.client.lease import LeaseClient, LeaseKeepAlive
from bosdyn.client.estop import EstopClient, EstopEndpoint, EstopKeepAlive
from bosdyn.client.robot_command import RobotCommandBuilder, RobotCommandClient, blocking_stand, blocking_sit
from bosdyn.client.robot_state import RobotStateClient
from bosdyn.client.world_object import WorldObjectClient
from bosdyn.client.local_grid import LocalGridClient
from bosdyn.client.image import ImageClient
from bosdyn.api.basic_command_pb2 import RobotCommandFeedbackStatus
from bosdyn.client import math_helpers
from bosdyn.client.frame_helpers import (BODY_FRAME_NAME, ODOM_FRAME_NAME, VISION_FRAME_NAME, get_se2_a_tform_b)
import time
import numpy as np
from scipy.spatial.transform import Rotation as R
import math
import play_sound
import record_sound


IP = "192.168.80.3"  # for wifi
#IP = "10.0.0.3"  # for ethernet
#IP = "192.168.50.3"  # for payload port
USERNAME = "admin"
PASSWORD = "6k1ad7psb2a5"

IDENTIFIER = "SpotPayload"


class Spot:
    
    VELOCITY_CMD_DURATION = 0.6  # seconds
    activated = False
    
    def __init__(self):
        
        # Create an SDK object
        sdk = create_standard_sdk(IDENTIFIER)

        # Get the robot object from the SDK using the hostname
        self.robot = sdk.create_robot(IP)

        # Authenticate with the robot
        self.robot.authenticate(USERNAME, PASSWORD)
        
               
        
    def activate(self):
        # Establish time sync
        self.robot.time_sync.wait_for_sync()

        # Lease
        lease_client = self.robot.ensure_client(LeaseClient.default_service_name)
        self.lease = LeaseKeepAlive(lease_client, must_acquire=True, return_at_exit=True)
        
        # Estop
        estop_client = self.robot.ensure_client(EstopClient.default_service_name)
        estop_endpoint = EstopEndpoint(estop_client, 'EStop', 5)
        estop_endpoint.force_simple_setup()
        self.estop = EstopKeepAlive(estop_endpoint)
 
        # Clients for controlling the robot
        self.robot_state_client = self.robot.ensure_client(RobotStateClient.default_service_name)
        self.command_client = self.robot.ensure_client(RobotCommandClient.default_service_name)
        self.world_object_client = self.robot.ensure_client(WorldObjectClient.default_service_name)
        #self.local_grid_client = self.robot.ensure_client(LocalGridClient.default_service_name)
        self.image_client = self.robot.ensure_client(ImageClient.default_service_name)
        
        # Sound clients
        self.play_sound = play_sound.PlaySound()
        self.record_sound = record_sound.RecordSound()
        
        if not self.robot.is_powered_on():
            self.power_on()
            
        self.activated = True
        
    
    def deactivate(self):
        self.move_to_absolute(0,0)
        self.rotate_to_absolute(0)
        
        self.lease.shutdown()
        self.estop.shutdown()
        
        self.activated = False
        
    
    def errors(func):
        """
        Decorator for handling errors and deactivating the spot. Should be used for all functions.
        """
        def wrapper(self, *args, **kwargs):
            
            if not self.activated:
                print("Spot not actiavted.")
                return False
            
            try:
                return func(self, *args, **kwargs)
            except Exception as e:
                print(f"!!! Error occurred: {e}")
                self.deactivate()
                return False
        return wrapper

    
    #### Base operations ####
    
    def power_on(self):
        self.robot.power_on(timeout_sec=20)
        assert self.robot.is_powered_on(), 'Robot power on failed.'
        self.robot.logger.info('Robot powered on.')

    def power_off(self):
        self.robot.power_off(cut_immediately=False, timeout_sec=20)
        assert not self.robot.is_powered_on(), 'Robot power off failed.'
        self.robot.logger.info('Robot safely powered off.')
        
    def estop_activate(self):
        self.estop.settle_then_cut()
        
    def estop_activate_fullstop(self):
        self.estop.stop()
        
    def estop_release(self):
        self.estop.allow()


    #####  Robot stance  #####
    
    @errors
    def stand(self):
        blocking_stand(self.command_client, timeout_sec=10)
        return True

    @errors
    def sit(self):
        blocking_sit(self.command_client, timeout_sec=10)
        return True
    
    @errors    
    def stand_height(self, height):
        cmd = RobotCommandBuilder.synchro_stand_command(body_height=height)
        self.command_client.robot_command(cmd)
        return True
    
    @errors    
    def stand_twisted(self, yaw, roll, pitch):

        footprint_R_body = bosdyn.geometry.EulerZXY(yaw=math.radians(yaw), roll=math.radians(roll), pitch=math.radians(pitch))
        cmd = RobotCommandBuilder.synchro_stand_command(footprint_R_body=footprint_R_body)
        self.command_client.robot_command(cmd)
        return True
        
        
        
    #####  X,Y Movement  #####  
    
    @errors
    def move_to_absolute(self, x, y):
        """ Move to the specified absolute coordinates, while keeping the same orientation."""
        
        _, _, yaw = self._get_current_position()
        return self._move_to(x, y, yaw)
    
    @errors
    def move_to_relative(self, dx, dy):
        """ Move to the specified relative coordinates, while keeping the same orientation."""
        
        x, y, yaw = self._get_current_position()
        return self._move_to(x+dx, y+dy, yaw)
        
    @errors    
    def rotate_to_absolute(self, direction):
        """ Rotate in the specified direction."""
        
        x, y, _ = self._get_current_position()
        return self._move_to(x, y, math.radians(direction))
        
    @errors
    def rotate_to_relative(self, angle):
        """ Rotate by the specified angle."""
        
        x, y, yaw = self._get_current_position()
        return self._move_to(x, y, yaw+math.radians(angle))
        
 
    @errors
    def _move_to(self, x, y, yaw, frame_name=ODOM_FRAME_NAME, stairs=False, timeout = 0):
        
        if timeout == 0:
            current_x, current_y, _ = self._get_current_position()
            distance = math.sqrt((x - current_x)**2 + (y - current_y)**2)
            timeout = 10 + (distance * 2) # 10 sec for start and stop + 2 sec per every meter
            
     
        # Command the robot to go to the goal point in the specified frame. The command will stop at the
        # new position.
        robot_cmd = RobotCommandBuilder.synchro_se2_trajectory_point_command(
            goal_x=x, 
            goal_y=y, 
            goal_heading=yaw,
            frame_name=frame_name, 
            params=RobotCommandBuilder.mobility_params(stair_hint=stairs))
        end_time = timeout
        cmd_id = self.command_client.robot_command(lease=None, command=robot_cmd,
                                                   end_time_secs=time.time() + end_time)
        # Wait until the robot has reached the goal.
        while True:
            feedback = self.command_client.robot_command_feedback(cmd_id)
            mobility_feedback = feedback.feedback.synchronized_feedback.mobility_command_feedback
            if mobility_feedback.status != RobotCommandFeedbackStatus.STATUS_PROCESSING:
                raise CommandFailedError("Failed to reach the goal")

            traj_feedback = mobility_feedback.se2_trajectory_feedback
            if (traj_feedback.status == traj_feedback.STATUS_AT_GOAL and
                    traj_feedback.body_movement_status == traj_feedback.BODY_STATUS_SETTLED):
                break

        # Send a Stop at the end, regardless of what happened.
        self.command_client.robot_command(RobotCommandBuilder.stop_command())
        return True
        
        
    @errors
    def get_current_position_x(self):
        x, _, _ = self._get_current_position()
        return x
    
    @errors
    def get_current_position_y(self):
        _, y, _ = self._get_current_position()
        return y
    
    @errors
    def get_current_rotation(self):
        _, _, yaw = self._get_current_position()
        return math.degrees(yaw)
    
    @errors
    def _get_current_position(self):
        # Get the current robot state
        robot_state = self.robot_state_client.get_robot_state()

        # Get the transform snapshot from the kinematic state
        transforms_snapshot = robot_state.kinematic_state.transforms_snapshot

        # Get the transform from the snapshot
        transform = transforms_snapshot.child_to_parent_edge_map[ODOM_FRAME_NAME].parent_tform_child
        
        # Get the quaternion from the transform
        x = transform.rotation.x
        y = transform.rotation.y
        z = transform.rotation.z
        w = transform.rotation.w
        
        quaternion = [w, x, y, z]

        # Convert the quaternion to euler angles
        r = R.from_quat(quaternion)
        euler = r.as_euler('xyz', degrees=True)  

        yaw, _, _ = euler
        
        # The API is returning the position and orientation inverted
        yaw = self._invert_degree(yaw)
        return -transform.position.x, -transform.position.y, math.radians(yaw)
       
    def _invert_degree(self, degree):
        
        if degree + 180 <= 180:
            return degree + 180
        else:
            return ((degree + 180) % 180) - 180
       
        
    @errors
    def move_direction(self, direction, speed = 0.5):
        
        v_x, v_y = self._compute_velocity(math.radians(direction), speed)
        return self.move(v_x, v_y, 0)
    
    @errors
    def move_forward(self, speed = 0.5):
        return self.move(v_x=speed, v_y=0, v_rot=0)
        
    @errors
    def move_backward(self, speed = 0.5):
        return self.move(v_x=-speed, v_y=0, v_rot=0)
        
    @errors
    def move_left(self, speed = 0.5):
        return self.move(v_x=0, v_y=speed, v_rot=0)
        
    @errors
    def move_right(self, speed = 0.5):
        return self.move(v_x=0, v_y=-speed, v_rot=0)
        
    @errors
    def rotate_left(self, angular_velocity = 0.8):
        return self.move(v_x=0, v_y=0, v_rot=angular_velocity)
    
    @errors
    def rotate_right(self, angular_velocity = 0.8):
        return self.move(v_x=0, v_y=0, v_rot=-angular_velocity)
    
    
    @errors
    def move(self, v_x, v_y, v_rot):
        robot_cmd = RobotCommandBuilder.synchro_velocity_command(
                                            v_x=v_x, 
                                            v_y=v_y, 
                                            v_rot=v_rot
                                            )
        end_time=time.time() + self.VELOCITY_CMD_DURATION
        self.command_client.robot_command(command=robot_cmd,
                                                 end_time_secs=end_time)
        return True
        
        
    @errors    
    def _compute_velocity(self, direction, speed):
        v_x = speed * math.cos(direction)
        v_y = speed * math.sin(direction)

        return v_x, v_y      
        
    ####  World detection ####
    
    @errors
    def get_closest_fiducial_X(self):
        return self.get_closest_fiducial()[1]
    
    @errors
    def get_closest_fiducial_Y(self):
        return self.get_closest_fiducial()[2]
    
    @errors
    def get_closest_fiducial(self):
        fiducials = self.get_fiducials()
        
        if not fiducials:
            return None
        
        x, y, _ = self._get_current_position()
        
        closest_fiducial = min(fiducials, key=lambda f: math.sqrt((f[1]-x)**2 + (f[2]-y)**2))
        
        return closest_fiducial 
    
    
    @errors
    def get_fiducial_with_id_X(self, fiducial_id):
        return self.get_fiducial_with_id(fiducial_id)[1]
    
    @errors
    def get_fiducial_with_id_Y(self, fiducial_id):
        return self.get_fiducial_with_id(fiducial_id)[2]
    
    @errors
    def get_fiducial_with_id(self, fiducial_id):
        fiducials = self.get_fiducials()
        
        for fiducial in fiducials:
            if int(fiducial[0]) == fiducial_id:
                return fiducial
        
        return None
    
    @errors
    def get_fiducial_count(self):
        return len(self.get_fiducials())
    
    @errors
    def is_fiducial_visible(self, fiducial_id):
        if self.get_fiducial_with_id(fiducial_id) is not None:
            return '1'
        else:
            return '0'
    
    @errors
    def id_closest_fiducial(self):
        return self.get_closest_fiducial()[0]
    
    @errors
    def get_fiducials(self):
        # Request fiducials
        request_fiducials = [world_object_pb2.WORLD_OBJECT_APRILTAG]
        fiducial_objects = self.world_object_client.list_world_objects(object_type=request_fiducials).world_objects

        # Initialize an empty list to hold the fiducials
        fiducials = []

        # Loop over the fiducial objects
        for fiducial_object in fiducial_objects:
            
            vision_tform_fiducial = get_a_tform_b(
                                        fiducial_object.transforms_snapshot, 
                                        ODOM_FRAME_NAME,#VISION_FRAME_NAME
                                        fiducial_object.apriltag_properties.frame_name_fiducial
                                    ).to_proto()
            if vision_tform_fiducial is not None:
                fiducial_rt_world = vision_tform_fiducial.position
                
                id = fiducial_object.name.removeprefix("world_obj_apriltag_")
                
                fiducials.append((id, fiducial_rt_world.x, fiducial_rt_world.y))
            
        # Return the list of fiducials
        return fiducials

    @errors
    def get_obstacle_distance(self, direction="front"):
        
        match direction:
   
            case "front": 
                return min(self._get_depth_image_closest_distance('frontleft_depth'),
                           self._get_depth_image_closest_distance('frontright_depth'))
            
            case "back": 
                return self._get_depth_image_closest_distance('back_depth')
                
            case "left": 
                return self._get_depth_image_closest_distance('left_depth')

            case "right":
                return self._get_depth_image_closest_distance('right_depth')
            case _ : 
                raise ValueError("Invalid direction")
    
    @errors
    def _get_depth_image_closest_distance(self, camera):
        
        image_responses = self.image_client.get_image_from_sources(image_sources=[camera])

        if len(image_responses) < 1:
            raise CommandFailedError("No image responses received!")

        # Depth is a raw bytestream
        cv_depth = np.frombuffer(image_responses[0].shot.image.data, dtype=np.uint16)
        cv_depth = cv_depth.reshape(image_responses[0].shot.image.rows,
                                    image_responses[0].shot.image.cols)
        
        
        if camera == "frontleft_depth" or camera == "frontright_depth":
            # Remove right half
            num_cols = cv_depth.shape[1]
            cv_depth = cv_depth[:, :num_cols//2]
                
        elif camera == "left_depth" or camera == "back_depth":
            # Remove bottom half
            num_rows = cv_depth.shape[0]
            cv_depth = cv_depth[:num_rows//2, :]
                
        elif camera == "right_depth":
            # Remove top half
            num_rows = cv_depth.shape[0]
            cv_depth = cv_depth[num_rows//2:, :]
    
        # Remove zero values
        cv_depth = cv_depth[cv_depth != 0]
        
        # Get the closest distance
        closest_distance = np.min(cv_depth)
        
        return closest_distance
    
    ####  Sound ####
    
    def make_sound(self, sound:str) -> bool:
        self.play_sound.play(sound)
        return True
    
    def heard_phrase(self, phrase) -> bool:
        if self.record_sound.heard_words(phrase):
            return '1'
        else:   
            return '0'
        

class CommandFailedError(Exception):
    pass
