import http.server
import socketserver
import functools

PORT = 8080

def start(root_dir):
    
    Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root_dir)

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("Starting http server on port", PORT)
        httpd.serve_forever()
        
        