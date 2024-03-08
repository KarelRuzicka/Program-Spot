from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from spot_mock import SpotMock 

class SpotControl(WebSocket):

    def handleMessage(self):
        global spot

        print(self.data)
        recv = self.data.split("|")

        try:
            method = getattr(spot, recv[0])
            return_val = method(*recv[1:])
            
        except (AttributeError, TypeError):
            return_val = False
        
        print(return_val)
        self.sendMessage(return_val)

    def handleConnected(self):
        global spot
        print(self.address, 'connected')
        spot.activate()
        

    def handleClose(self):
        global spot
        print(self.address, 'closed')
        spot.deactivate()


spot = SpotMock()

server = SimpleWebSocketServer('', 8000, SpotControl)
server.serveforever()





