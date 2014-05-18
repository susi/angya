"""This module defines the left navigation and its buttons."""

import flask

from google.appengine.api import users

class Navigation(object):
  """The Navigation returns information to render the nav menu buttons."""
  def __init__(self, app):
      self.app = app

  def render(self):
    """Returns a json map of the buttons for the navigation bar."""

    buttons = [
      {'name': 'close',
       'url': 'javascript:closeNavigation()',
       'hint': 'close navigation'},
      {'name': 'list',
       'url': 'javascript:tripmanager.listTrips()',
       'hint': 'my trips list'},
      {'name': 'edit',
       'url': 'javascript:tripmanager.createTrip()',
       'hint': 'create trip'},
      {'name': 'marker',
       'url': 'javascript:tripmanager.addPlace()',
       'hint': 'add place to trip'},
      {'name': 'map-type',
       'url': 'javascript:swapMapType()',
       'hint': 'change map type'},
    ]

    widget = {
      'name': 'left-nav',
      'buttons': buttons,
      'js': flask.url_for('static', filename='js/widgets/nav.js'),
      'css': flask.url_for('static', filename='css/widgets/nav.css')
    }
    return flask.jsonify(**widget)
