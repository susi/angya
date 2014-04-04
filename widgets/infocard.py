"""This module defines the Infocard. It can display arbitrary information."""

import flask

class Infocard(object):
  """The Infocard is a container for arbitrary information. It is primarily a JS API."""
  def __init__(self, app):
    self.app = app

  def render(self):
    """Loads the inforcard JS API and CSS"""
    widget = {
      'name': 'infocard',
      'js': flask.url_for('static', filename='js/widgets/infocard.js'),
      'css': flask.url_for('static', filename='css/widgets/infocard.css')    
    }
    return flask.jsonify(**widget)
