# Copyright (c) 2023 Boston Dynamics, Inc.  All rights reserved.
#
# Downloading, reproducing, distributing or otherwise using the SDK Software
# is subject to the terms and conditions of the Boston Dynamics Software
# Development Kit License (20191101-BDSDK-SL).

"""Tutorial to show how to use the Boston Dynamics API"""

import argparse
import math
import os
import sys
import time

import bosdyn.client
import bosdyn.client.lease
import bosdyn.client.util
import bosdyn.geometry
from bosdyn.api import trajectory_pb2
from bosdyn.api.spot import robot_command_pb2 as spot_command_pb2
from bosdyn.client import math_helpers
from bosdyn.client.frame_helpers import GRAV_ALIGNED_BODY_FRAME_NAME, ODOM_FRAME_NAME, get_a_tform_b, get_se2_a_tform_b,BODY_FRAME_NAME
from bosdyn.client.image import ImageClient
from bosdyn.client.robot_command import RobotCommandBuilder, RobotCommandClient, blocking_stand
from bosdyn.client.robot_state import RobotStateClient
from bosdyn.util import seconds_to_duration
import time

def relative_move(dx, dy, dyaw, frame_name, robot_command_client, robot_state_client, stairs=False):
    transforms = robot_state_client.get_robot_state().kinematic_state.transforms_snapshot
    body_tform_goal = math_helpers.SE2Pose(x=dx, y=dy, angle=dyaw)
    out_tform_body = get_se2_a_tform_b(transforms, frame_name, BODY_FRAME_NAME)
    out_tform_goal = out_tform_body * body_tform_goal

    robot_cmd = RobotCommandBuilder.synchro_se2_trajectory_point_command(
        goal_x=out_tform_goal.x, 
        goal_y=out_tform_goal.y, 
        goal_heading=out_tform_goal.angle, 
        frame_name=frame_name, 
        params=RobotCommandBuilder.mobility_params(stair_hint=stairs)
    )

    end_time = 10.0 #TODO
    cmd_id = robot_command_client.robot_command(lease=None, command=robot_cmd, end_time_secs = time.time() + end_time)

    while True:
        feedback = robot_command_client.robot_command_feedback(cmd_id)
        mobility_feedback = feedback.feedback.synchronized_feedback.mobility_command_feedback

        if mobility_feedback.status != RobotCommandFeedbackStatus.STATUS_PROCESSING:
            print("Failed to reach the goal")
            return False

        traj_feedback = mobility_feedback.traj_feedback

        if (traj_feedback.STATUS_AT_GOAL and traj_feedback.body_movement_status == traj_feedback.BODY_STATUS_SETTLED):
            print("Arrived at the goal.")
            return True

        time.sleep(1)

    return True

def hello_spot(config):
    """A simple example of using the Boston Dynamics API to command a Spot robot."""

    # The Boston Dynamics Python library uses Python's logging module to
    # generate output. Applications using the library can specify how
    # the logging information should be output.
    bosdyn.client.util.setup_logging(config.verbose)

    # The SDK object is the primary entry point to the Boston Dynamics API.
    # create_standard_sdk will initialize an SDK object with typical default
    # parameters. The argument passed in is a string identifying the client.
    sdk = bosdyn.client.create_standard_sdk('HelloSpotClient')

    # A Robot object represents a single robot. Clients using the Boston
    # Dynamics API can manage multiple robots, but this tutorial limits
    # access to just one. The network address of the robot needs to be
    # specified to reach it. This can be done with a DNS name
    # (e.g. spot.intranet.example.com) or an IP literal (e.g. 10.0.63.1)
    robot = sdk.create_robot("192.168.80.3")

    robot.authenticate("admin", "6k1ad7psb2a5")

    # Clients need to authenticate to a robot before being able to use it.
    #bosdyn.client.util.authenticate(robot)

    # Establish time sync with the robot. This kicks off a background thread to establish time sync.
    # Time sync is required to issue commands to the robot. After starting time sync thread, block
    # until sync is established.
    robot.time_sync.wait_for_sync()

    # Verify the robot is not estopped and that an external application has registered and holds
    # an estop endpoint.
    assert not robot.is_estopped(), 'Robot is estopped. Please use an external E-Stop client, ' \
                                    'such as the estop SDK example, to configure E-Stop.'

    # The robot state client will allow us to get the robot's state information, and construct
    # a command using frame information published by the robot.
    robot_state_client = robot.ensure_client(RobotStateClient.default_service_name)

    # Only one client at a time can operate a robot. Clients acquire a lease to
    # indicate that they want to control a robot. Acquiring may fail if another
    # client is currently controlling the robot. When the client is done
    # controlling the robot, it should return the lease so other clients can
    # control it. The LeaseKeepAlive object takes care of acquiring and returning
    # the lease for us.
    lease_client = robot.ensure_client(bosdyn.client.lease.LeaseClient.default_service_name)
    with bosdyn.client.lease.LeaseKeepAlive(lease_client, must_acquire=True, return_at_exit=True):
        # Now, we are ready to power on the robot. This call will block until the power
        # is on. Commands would fail if this did not happen. We can also check that the robot is
        # powered at any point.
        robot.logger.info('Powering on robot... This may take several seconds.')
        robot.power_on(timeout_sec=20)
        assert robot.is_powered_on(), 'Robot power on failed.'
        robot.logger.info('Robot powered on.')

        # Tell the robot to stand up. The command service is used to issue commands to a robot.
        # The set of valid commands for a robot depends on hardware configuration. See
        # RobotCommandBuilder for more detailed examples on command building. The robot
        # command service requires timesync between the robot and the client.
        robot.logger.info('Commanding robot to stand...')
        command_client = robot.ensure_client(RobotCommandClient.default_service_name)
        blocking_stand(command_client, timeout_sec=10)
        robot.logger.info('Robot standing.')
        time.sleep(3)

        # Query the robot for its current state before issuing the stand with yaw command.
        # This state provides a reference pose for issuing a frame based body offset command.
        robot_state = robot_state_client.get_robot_state()

        # Tell the robot to stand in a twisted position.
        #
        # The RobotCommandBuilder constructs command messages, which are then
        # issued to the robot using "robot_command" on the command client.
        #
        # In this example, the RobotCommandBuilder generates a stand command
        # message with a non-default rotation in the footprint frame. The footprint
        # frame is a gravity aligned frame with its origin located at the geometric
        # center of the feet. The X axis of the footprint frame points forward along
        # the robot's length, the Z axis points up aligned with gravity, and the Y
        # axis is the cross-product of the two.
        # footprint_R_body = bosdyn.geometry.EulerZXY(yaw=0.4, roll=0.0, pitch=0.0)
        # cmd = RobotCommandBuilder.synchro_stand_command(footprint_R_body=footprint_R_body)
        # command_client.robot_command(cmd)
        # robot.logger.info('Robot standing twisted.')
        # time.sleep(3)

        # Now compute an absolute desired position and orientation of the robot body origin.
        # Use the frame helper class to compute the world to gravity aligned body frame transformation.
        # Note, the robot_state used here was cached from before the above yaw stand command,
        # so it contains the nominal stand pose.
        # odom_T_flat_body = get_a_tform_b(robot_state.kinematic_state.transforms_snapshot,
        #                                  ODOM_FRAME_NAME, GRAV_ALIGNED_BODY_FRAME_NAME)

        
        relative_move(1, 0, 0, ODOM_FRAME_NAME, command_client, robot_state_client)

        # Power the robot off. By specifying "cut_immediately=False", a safe power off command
        # is issued to the robot. This will attempt to sit the robot before powering off.
        robot.power_off(cut_immediately=False, timeout_sec=20)
        assert not robot.is_powered_on(), 'Robot power off failed.'
        robot.logger.info('Robot safely powered off.')


# def _maybe_display_image(image, display_time=3.0):
#     """Try to display image, if client has correct deps."""
#     try:
#         import io

#         from PIL import Image
#     except ImportError:
#         logger = bosdyn.client.util.get_logger()
#         logger.warning('Missing dependencies. Can\'t display image.')
#         return
#     try:
#         image = Image.open(io.BytesIO(image.data))
#         image.show()
#         time.sleep(display_time)
#     except Exception as exc:
#         logger = bosdyn.client.util.get_logger()
#         logger.warning('Exception thrown displaying image. %r', exc)


# def _maybe_save_image(image, path):
#     """Try to save image, if client has correct deps."""
#     logger = bosdyn.client.util.get_logger()
#     try:
#         import io

#         from PIL import Image

#     except ImportError:
#         logger.warning('Missing dependencies. Can\'t save image.')
#         return
#     name = 'hello-spot-img.jpg'
#     if path is not None and os.path.exists(path):
#         path = os.path.join(os.getcwd(), path)
#         name = os.path.join(path, name)
#         logger.info('Saving image to: %s', name)
#     else:
#         logger.info('Saving image to working directory as %s', name)
#     try:
#         image = Image.open(io.BytesIO(image.data))
#         image.save(name)
#     except Exception as exc:
#         logger = bosdyn.client.util.get_logger()
#         logger.warning('Exception thrown saving image. %r', exc)


def main(argv):
    """Command line interface."""
    parser = argparse.ArgumentParser()
    bosdyn.client.util.add_base_arguments(parser)
    parser.add_argument(
        '-s', '--save', action='store_true', help=
        'Save the image captured by Spot to the working directory. To chose the save location, use --save_path instead.'
    )
    parser.add_argument(
        '--save-path', default=None, nargs='?', help=
        'Save the image captured by Spot to the provided directory. Invalid path saves to working directory.'
    )
    options = parser.parse_args(argv)
    try:
        hello_spot(options)
        return True
    except Exception as exc:  # pylint: disable=broad-except
        logger = bosdyn.client.util.get_logger()
        logger.error('Hello, Spot! threw an exception: %r', exc)
        return False


if __name__ == '__main__':
    if not main(["192.168.80.3"] + sys.argv[1:]):
        sys.exit(1)



