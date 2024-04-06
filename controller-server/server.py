from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from spot_mock import SpotMock 
import queue
import threading
import concurrent.futures


USER_TIME = 300
active_user = ""
user_queue = queue.Queue()
timer = None

class SpotControl(WebSocket):
    
    def handleMessage(self):     
        # Check if the command is from the active user
        if self != active_user:
            self.sendMessage(str(False))
            return
            
        recv = self.data.split("|")
        
        self.runCommand(recv)
        

    def runCommand(self, command):
        global spot
        try:
            # Call the method and arguments passed in the command
            method = getattr(spot, command[0])
            #return_val = method(*command[1:])
            
            def try_parse(s):
                try:
                    return float(s)
                except ValueError:
                    return s

            attributes = [try_parse(s) for s in command[1:]]
            
            print('{', self.address[0], '} -', command[0], attributes, end="")
            
            
            # Run function in a seperate thread so we dont block the websocket
            with concurrent.futures.ThreadPoolExecutor() as executor:
                
                future = executor.submit(method, *attributes)
                future.add_done_callback(self.commandResult)
            
        except (AttributeError, TypeError, ValueError): # Invalid method or arguments
            print('==INVALID PARAMS==', '{', self.address[0], '}')
            active_user.close()
            
    
    def commandResult(self, future):
        
        return_val = future.result()
        active_user.sendMessage(str(return_val))
        
        print('->', return_val)
        
        if return_val == False:
            print('==ERROR==', '{', self.address[0], '}')
            self.close()


    def handleConnected(self):
        global active_user
        global user_queue
        global timer
        
        if active_user == "":
            active_user = self
            self.activateUser(self)
            
            timer = threading.Timer(USER_TIME, self.timeout)
            timer.start()
            
        else:
            user_queue.put(self)
            self.userWaiting(self)


    def handleClose(self):
        global active_user
        global user_queue
        global timer
        
        timer.cancel()
        if self != active_user:
            return
            
        self.deactivateUser(self)
        
        if user_queue.empty():
            active_user = ""
        else:
            active_user = user_queue.get()
            self.activateUser(active_user)

            timer = threading.Timer(USER_TIME, self.timeout)
            timer.start()
            
        
    def activateUser(self, user):
        global spot
        
        spot.activate()
        user.sendMessage('READY')
        print('==ACTIVE==', '{', user.address[0], '}')
        
        
    def deactivateUser(self, user):
        global spot
        
        spot.deactivate()
        print('==DEACTIVATED==', '{', user.address[0], '}')
    
    
    def userWaiting(self, user):
        
        user.sendMessage('WAITING')
        print('==WAITING==', '{', user.address[0], '}')


    def timeout(self):
        global active_user
        global user_queue
        global timer
        
        if not user_queue.empty():
            active_user.close()

        timer = threading.Timer(USER_TIME, self.timeout)
        timer.start()

# # importing from another directory in python
# import os   
# import sys  
# original_sys_path = sys.path.copy()
# parent_dir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
# sister_dir = os.path.join(parent_dir, 'spot-api')

# sys.path.insert(0, sister_dir)
# from spot import Spot
# sys.path = original_sys_path

# spot = Spot()

# Mock object when robot is not present
from spot_mock import SpotMock
spot = SpotMock()

# Websocket server
server = SimpleWebSocketServer('', 8000, SpotControl)
server.serveforever()





