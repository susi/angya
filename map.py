import flask

class Map(object):
    def __init__(self, app):
        self._app = app
    def render(self):
        return flask.render_template('map.html')
