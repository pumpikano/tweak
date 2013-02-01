import os
import tornado.ioloop
import tornado.web
import tornado.websocket as websocket

client = None

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write(open('./static/index.html', 'r').read())

class ClientWebSocket(websocket.WebSocketHandler):
    def open(self):
        global client
        client = self
        print "Client websocket opened"

    def on_message(self, message):
        self.write_message(message)

    def on_close(self):
        client = None
        print "Client websocket closed"

class ControlWebSocket(websocket.WebSocketHandler):
    def open(self):
        print "Control websocket opened"

    def on_message(self, message):
        print message
        if client:
            client.write_message(message)
        # self.write_message(message)

    def on_close(self):
        print "Control websocket closed"

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