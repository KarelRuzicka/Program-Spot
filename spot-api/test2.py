# Import the necessary modules from the Spot SDK
from bosdyn.client import create_standard_sdk
from bosdyn.client.lease import LeaseClient, LeaseKeepAlive
from bosdyn.client.robot_command import RobotCommandClient, RobotCommandBuilder, blocking_stand
from bosdyn.client.frame_helpers import get_odom_tform_body
from bosdyn.geometry import EulerZXY
from bosdyn.util import seconds_to_duration
from bosdyn.api.spot import robot_command_pb2
import math

# Define a function that takes the x and y coordinates as arguments
def move_spot_to(x, y):
    # Create an SDK object
    sdk = create_standard_sdk("MoveSpotTo")

    # Get the robot object from the SDK using the hostname
    robot = sdk.create_robot("spot-XXXX")

    # Authenticate with the robot
    robot.authenticate("user", "password")

    # Establish time sync with the robot
    robot.time_sync.wait_for_sync()

    # Get the lease client
    lease_client = robot.ensure_client(LeaseClient.default_service_name)

    # Acquire the lease
    lease = lease_client.acquire()

    # Start the lease keep-alive
    lease_keep_alive = LeaseKeepAlive(lease_client)

    # Get the robot command client
    command_client = robot.ensure_client(RobotCommandClient.default_service_name)



    # Command the robot to stand
    blocking_stand(command_client, timeout_sec=10)

    # Get the current pose of the robot in the odom frame
    odom_tform_body = get_odom_tform_body(robot)

    # Extract the position and orientation of the robot
    position = odom_tform_body.position
    orientation = odom_tform_body.rotation.to_quaternion()

    # Convert the orientation to Euler angles
    roll, pitch, yaw = EulerZXY.from_quaternion(orientation)

    # Calculate the distance and angle to the target point
    dx = x - position.x
    dy = y - position.y
    distance = math.sqrt(dx**2 + dy**2)
    angle = math.atan2(dy, dx) - yaw

    # Normalize the angle to the range [-pi, pi]
    angle = (angle + math.pi) % (2 * math.pi) - math.pi

    # Create a mobility command to move to the target point
    mobility_command = RobotCommandBuilder.mobility_command(
        goal_x=distance, goal_y=0, goal_heading=angle,
        frame_name=robot_command_pb2.MobilityCommand.BodyFrameName.ODOM,
        params=robot_command_pb2.MobilityParams(vel_limit=1.0, acc_limit=1.0))

    # Send the command to the robot and wait for it to finish
    command_client.robot_command(mobility_command)
    command_client.wait_for_command_to_finish(mobility_command, timeout=seconds_to_duration(30))

    # Release the lease
    lease_client.return_lease(lease)

    # Stop the lease keep-alive
    lease_keep_alive.shutdown()

    # Print a message
    print("Moved Spot to ({}, {})".format(x, y))