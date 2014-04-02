"""This module defines the left navigation and its buttons."""

import flask

from google.appengine.api import users

class Navigation(object):
  """The Navigation returns information to render the navigation menu with buttons."""
  def __init__(self, app):
      self.app = app

  def render(self):
    """Returns a json map of the buttons for the navigation bar."""

    buttons = [
      {'name': 'close', 'url': 'javascript:closeNavigation()', 'hint': 'close'},
      {'name': 'camera', 'url': 'javascript:alert("Add photo!")', 'hint': 'add photo'},
      {'name': 'write', 'url': 'javascript:alert("Write review...")', 'hint': 'add impression'},
      {'name': 'text', 'url': 'javascript:alert("Add a review")', 'hint': 'add review'},
      {'name': 'marker', 'url': 'javascript:alert("Add a place")', 'hint': 'add place'},
      {'name': 'map-type', 'url': 'javascript:swapMapType()', 'hint': 'map type'},
    ]

    widget = {
      'name': 'left-nav',
      'buttons': buttons,
      'js': flask.url_for('static', filename='js/widgets/nav.js'),
      'css': flask.url_for('static', filename='css/widgets/nav.css')
    }
    return flask.jsonify(**widget)
