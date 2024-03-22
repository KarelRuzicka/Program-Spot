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
        
        print('{', self.address[0], '} -', recv[0], recv[1:], end="")
        
        self.runCommand(recv)
        

    def runCommand(self, command):
        global spot
        try:
            # Call the method and arguments passed in the command
            method = getattr(spot, command[0])
            #return_val = method(*command[1:])
            
            # Run function in a seperate thread so we dont block the websocket
            with concurrent.futures.ThreadPoolExecutor() as executor:
                
                future = executor.submit(method, *command[1:])
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
        
        print("Timecheck") #TODO remove

        

        
spot = SpotMock()

server = SimpleWebSocketServer('', 8000, SpotControl)
server.serveforever()





