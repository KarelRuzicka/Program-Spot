from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import queue
import threading
import concurrent.futures


PORT = 8000

USER_TIME = 300
active_user = ""
user_queue = queue.Queue()
timer = None


class SpotControl(WebSocket):
    
    def handleMessage(self):     
        # Check for emergency stop
        if self.data == "ESTOP":
            print('==EMERGENCY STOP==', '{', self.address[0], '}')
            spot.estop_activate()
            self.close()
            active_user.close()
            return
        
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
        
        print("activeuser:", active_user)
        
        if active_user == "":
            self.activateUser(self)
            active_user = self
            
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
        
        if user_queue.empty():
            active_user = ""
        else:
            active_user = user_queue.get()
            self.activateUser(active_user)

            timer = threading.Timer(USER_TIME, self.timeout)
            timer.start()
            
        self.deactivateUser(self)
        
        
            
        
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


# Websocket server
def start(spot_class):
    global spot
    spot = spot_class()
    
    server = SimpleWebSocketServer('', PORT, SpotControl)
    print('Starting websocket server on port', PORT)
    server.serveforever()





