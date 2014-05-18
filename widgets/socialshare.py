"""This module defines the social sharing buttons."""

import flask

class SocialShare(object):
  """The SocialShare class is a simple widget which shares the current map url.
  
  Supported social networks:
  - Google+
  - facebook
  - twitter"""
  def __init__(self, app):
    self.app = app

  def render(self):
    """Loads the SocialButtons JS API and CSS"""
    widget = {
      'name': 'socialshare',
      'position': 'TOP_RIGHT',
      'js': flask.url_for('static', filename='js/widgets/socialshare.js'),
      'css': flask.url_for('static', filename='css/widgets/socialshare.css'),
      'html': flask.render_template('widgets/socialshare.html')
    }
    return flask.jsonify(**widget)
