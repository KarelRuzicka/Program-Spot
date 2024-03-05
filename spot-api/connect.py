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
import math







IP = "192.168.80.3"  # for wifi
#IP = "10.0.0.3"  # for ethernet
#IP = "192.168.50.3"  # for payload port
USERNAME = "admin"
PASSWORD = "6k1ad7psb2a5"

IDENTIFIER = "SpotPayload"


class Spot:
    
    VELOCITY_CMD_DURATION = 0.6  # seconds
    
    def __init__(self):
        
        # Create an SDK object
        sdk = create_standard_sdk(IDENTIFIER)

        # Get the robot object from the SDK using the hostname
        self.robot = sdk.create_robot(IP)

        # Authenticate with the robot
        self.robot.authenticate(USERNAME, PASSWORD)
               
        
    def __enter__(self):
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
        self.local_grid_client = self.robot.ensure_client(LocalGridClient.default_service_name) #TODO needed?
        self.image_client = self.robot.ensure_client(ImageClient.default_service_name)
        
        if not self.robot.is_powered_on():
            self.power_on()
        
    
    def __exit__(self, exc_type, exc_value, traceback):
        self.stand()
        self.move_absolute(0,0,0)
        
        self.lease.shutdown()
        self.estop.shutdown()

    
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
        self.estop.stop()
        #TODO !!! settle then cut

    def estop_release(self):
        self.estop.allow()


    #####  Robot positioning  #####

    def stand(self):
        blocking_stand(self.command_client, timeout_sec=10)
        self.robot.logger.info('Robot standing.')

    def sit(self):
        blocking_sit(self.command_client, timeout_sec=10)
        self.robot.logger.info('Robot sitting.')
        
    def stand_height(self, height):
        cmd = RobotCommandBuilder.synchro_stand_command(body_height=height)
        self.command_client.robot_command(cmd)
        self.robot.logger.info(f'Robot standing at height {height}m.')
        
    def stand_twisted(self, yaw, roll, pitch):
        footprint_R_body = bosdyn.geometry.EulerZXY(yaw=yaw, roll=roll, pitch=pitch)
        cmd = RobotCommandBuilder.synchro_stand_command(footprint_R_body=footprint_R_body)
        self.command_client.robot_command(cmd)
        self.robot.logger.info('Robot standing twisted.')
        
    
        
        
    #####  X,Y Movement  #####  
        
    def move_absolute(self, x, y, yaw):
        self.move_to(x, y, yaw)
    
    #TODO možná smazat napřed otoč, pak jdi
    def move_facing_absolute(self, x, y):
        current_x, current_y = self.__get_current_position()

        # Calculate the change in x and y
        dx = x - current_x
        dy = y - current_y

        yaw = math.atan2(dy, dx)
        
        self.move_to(x, y, yaw)
        
    def move_relative(self, dx, dy, dyaw):
        x,y,yaw = self.__relative_to_absolute_coords(dx, dy, dyaw)
        self.move_to(x, y, yaw)
        
    #napřed otoč pak jdi
    def move_facing_relative(self, dx, dy):
        yaw = math.atan2(dy, dx)
        x,y,_ = self.__relative_to_absolute_coords(dx, dy, 0)
        self.move_to(x, y, yaw)
        
        
    #Funguje, odebrat private, z nějakýho důvodu - u pozice oproti move?????
    def __get_current_position(self):
        # Get the current robot state
        robot_state = self.robot_state_client.get_robot_state()

        # Get the transform snapshot from the kinematic state
        transforms_snapshot = robot_state.kinematic_state.transforms_snapshot

        # Get the transform from the snapshot
        transform = transforms_snapshot.child_to_parent_edge_map[ODOM_FRAME_NAME].parent_tform_child

        # transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w
        # TODO velocity
        return transform.position.x, transform.position.y
    

    def __relative_to_absolute_coords(self, dx, dy, dyaw):
        
        # Get the current transforms from the robot state.
        transforms = self.robot_state_client.get_robot_state().kinematic_state.transforms_snapshot

        # Build the transform for where we want the robot to be relative to where the body currently is.
        body_tform_goal = math_helpers.SE2Pose(x=dx, y=dy, angle=dyaw)
        # We do not want to command this goal in body frame because the body will move, thus shifting
        # our goal. Instead, we transform this offset to get the goal position in the output frame
        # (which will be either odom or vision).
        out_tform_body = get_se2_a_tform_b(transforms, ODOM_FRAME_NAME, BODY_FRAME_NAME)
        out_tform_goal = out_tform_body * body_tform_goal

        return out_tform_goal.x, out_tform_goal.y, out_tform_goal.angle
        
        
    #TODO timeout
    def move_to(self, x, y, yaw, stairs=False, timeout = 10.0):
     
        # Command the robot to go to the goal point in the specified frame. The command will stop at the
        # new position.
        robot_cmd = RobotCommandBuilder.synchro_se2_trajectory_point_command(
            goal_x=x, 
            goal_y=y, 
            goal_heading=yaw, #TODO does robot keep yaw? NO!!!
            frame_name=ODOM_FRAME_NAME, 
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
                print('Arrived at the goal.')
                break

        # Send a Stop at the end, regardless of what happened.
        self.command_client.robot_command(RobotCommandBuilder.stop_command())
        
        
    def _compute_velocity(self, direction, speed):
        v_x = speed * math.cos(direction)
        v_y = speed * math.sin(direction)

        return v_x, v_y
    
    
    def move(self, direction, speed = 0.5):
        
        v_x, v_y = self._compute_velocity(direction, speed)
        
        robot_cmd = RobotCommandBuilder.synchro_velocity_command(
                                            v_x=v_x, 
                                            v_y=v_y, 
                                            v_rot=0
                                            )
        end_time=time.time() + self.VELOCITY_CMD_DURATION
        self.command_client.robot_command(command=robot_cmd,
                                                 end_time_secs=end_time)
        
        
    def move2(self, v_x, v_y, speed = 0.5):
        
        robot_cmd = RobotCommandBuilder.synchro_velocity_command(
                                            v_x=v_x, 
                                            v_y=v_y, 
                                            v_rot=0
                                            )
        end_time=time.time() + self.VELOCITY_CMD_DURATION
        self.command_client.robot_command(command=robot_cmd,
                                                 end_time_secs=end_time)
        
        
    # self._current_tag_world_pose, self._angle_desired = self.offset_tag_pose(
    #             fiducial_rt_world, self._tag_offset)

    #         #Command the robot to go to the tag in kinematic odometry frame
    #         mobility_params = self.set_mobility_params()
    #         tag_cmd = RobotCommandBuilder.synchro_se2_trajectory_point_command(
    #             goal_x=self._current_tag_world_pose[0], goal_y=self._current_tag_world_pose[1],
    #             goal_heading=self._angle_desired, frame_name=VISION_FRAME_NAME, params=mobility_params,
    #             body_height=0.0, locomotion_hint=spot_command_pb2.HINT_AUTO)
    #         end_time = 5.0
    #         if self._movement_on and self._powered_on:
    #             #Issue the command to the robot
    #             self._robot_command_client.robot_command(lease=None, command=tag_cmd,
    #                                                     end_time_secs=time.time() + end_time)
    #             # #Feedback to check and wait until the robot is in the desired position or timeout
    #             start_time = time.time()
    #             current_time = time.time()
    #             while (not self.final_state() and current_time - start_time < end_time):
    #                 time.sleep(.25)
    #                 current_time = time.time()
    #         return
        
        
        
    ####  World detection ####
    
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
                
                fiducials.append((fiducial_object.name, fiducial_rt_world.x, fiducial_rt_world.y))
                ##TODO edit name - world_obj_apriltag_4
            

        # Return the list of fiducials
        return fiducials


    def __quaternion_to_yaw(self, x, y, z, w):
        """
        Convert a quaternion into yaw angle
        yaw is rotation around z in radians (counterclockwise)
        """
        t3 = +2.0 * (w * z + x * y)
        t4 = +1.0 - 2.0 * (y * y + z * z)
        yaw_z = math.atan2(t3, t4)
        
        return yaw_z # in radians
    
    
    ##TODO lepší než depth image, stačí nám obstacle_distance do any direction
    def get_obstacles(self):
        obstacles = self.local_grid_client.get_local_grids(
            ['terrain', 'terrain_valid', 'intensity', 'no_step', 'obstacle_distance'])

        return obstacles
    
    # Asi smazat
    # def get_depth_image(self):
        
    #     image_responses = self.image_client.get_image_from_sources(['frontleft_depth'])

    #     if len(image_responses) < 1:
    #         raise CommandFailedError("No image responses received!")

    #     # Depth is a raw bytestream
    #     cv_depth = np.frombuffer(image_responses[0].shot.image.data, dtype=np.uint16)
    #     cv_depth = cv_depth.reshape(image_responses[0].shot.image.rows,
    #                                 image_responses[0].shot.image.cols)
        
        
    #     #Image working but object detection not
        
    #     # Assuming cv_depth is your depth image
    #     object_closer_than_one_meter = np.any(cv_depth < 1000)

    #     if object_closer_than_one_meter:
    #         print("There is an object closer than 1 meter.")
    #     else:
    #         print("There are no objects closer than 1 meter.")
            
    # TODO vyzkoušet, přidat výběr kamery, Jak se bude zobrazovat?
    def get_image(self):
            
        image_response = self.image_client.get_image_from_sources(['frontleft_fisheye_image'])
        
        image = image_response[0].shot.image
        

class CommandFailedError(Exception):
    pass
                    



            
# simulator??

# Distance to tag
# Get tag by id - parse name
# depth - bližší než, vzdálenost nejbližší překážky - směry

# With Spot - close after | maybe per user command - dont disconnect from spot

# Ošetřit movement?
#!! napřed otoč pak jdi směrem

# Nejbližší obstacle směrem
# Směr robota
# - čistě překážka před možná lepší


# jdi na/o(choď dokola???), zastav/přeruš/přestaň(aby bylo jasné že nebude pokračovat) pokud(nejbližší obstacle| směr robota < 1m )
#   a vykonej

# Future: Movement??

#spot je na souřadnicích (tolerance)???

#ukončovací akce (spot si sedne a vstane idk)






#jdi do cíle, když překážka, (sedni si) a počkej na odstranění, pokračuj,
# while není v cíli


