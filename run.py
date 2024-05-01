import threading
import server.websocket_server as websocket_server
import server.http_server as http_server
import spot_api.spot as spot
#import spot_api.spot_mock as spot  # Mocked version of the spot API interface


websocket_thread = threading.Thread(target=websocket_server.start, args=(spot.Spot,))
websocket_thread.start()

http_thread = threading.Thread(target=http_server.start, args=("client/dist",))
http_thread.start()


websocket_thread.join()
http_thread.join()
