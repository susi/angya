"""This module defines the Map class.
The Map class is responsible for rendering a map and pulling in all JS
dependencies to run the Map UI."""

import flask

class Map(object):
    def __init__(self, app):
        self.app = app
    def render(self):
        return flask.render_template('map.html')

