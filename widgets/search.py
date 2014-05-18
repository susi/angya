"""This module defines the search box widget."""

import flask

class Search(object):
  """Creates a search box widget."""

  def __init__(self, app):
      self.app = app

  def render(self):
    button = {
      'name': 'search',
      'sbhtml': flask.render_template('widgets/search-box.html'),
      'html': flask.render_template('widgets/search.html'),
      'position': 'TOP_LEFT',
      'js': flask.url_for('static', filename='js/widgets/search.js'),
      'css': flask.url_for('static', filename='css/widgets/search.css')
    }
    return flask.jsonify(**button)
