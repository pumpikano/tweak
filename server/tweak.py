import os
import tornado.ioloop
import tornado.web
import tornado.websocket as websocket


class Synchronizer(object):
    def __init__(self):
        self.client_websocket = None
        self.control_websocket = None
        self.client_bound_message_buffer = []
        self.control_bound_message_buffer = []

    def set_client_websocket(self, client_ws):
        self.client_websocket = client_ws

    def set_control_websocket(self, control_ws):
        self.control_websocket = control_ws

    def client_message(self, message):
        # print 'Client Message:'
        # print message

        if self.control_websocket:
            self.control_websocket.write_message(message)
        else:
            self.control_bound_message_buffer.append(message)


    def control_message(self, message):
        # print 'Control Message:'
        # print message

        if self.client_websocket:
            self.client_websocket.write_message(message)
        else:
            self.client_bound_message_buffer.append(message)

sync = Synchronizer()

# Route Classes #

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(open('./static/index.html', 'r').read())

# WebSocket Routes #

class ClientWebSocket(websocket.WebSocketHandler):
    def open(self):
        global sync
        sync.set_client_websocket(self)

    def on_message(self, message):
        global sync
        sync.client_message(message)

    def on_close(self):
        global sync
        sync.set_client_websocket(None)

class ControlWebSocket(websocket.WebSocketHandler):
    def open(self):
        global sync
        sync.set_control_websocket(self)

    def on_message(self, message):
        global sync
        sync.control_message(message)

    def on_close(self):
        global sync
        sync.set_control_websocket(None)

static_path = os.path.join(os.getcwd(), 'static')

application = tornado.web.Application([
    (r'/', MainHandler),
    (r'/static/(.*)', tornado.web.StaticFileHandler, {'path': static_path}),
    (r'/client', ClientWebSocket),
    (r'/control', ControlWebSocket)
], debug=True)

if __name__ == "__main__":
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()