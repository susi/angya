"""This module defines the login widgets."""

import flask

class LoginButton(object):
    """The LoginButton returns a login button widget.
    It can also render a signup button."""

    def __init__(self, app):
        self._app = app
    def render(self, is_login=True):
        button = {}
        if is_login:
            button['name'] = 'login'
            button['html'] = flask.render_template('widgets/login.html')
            button['position'] = 'TOP_RIGHT'
            button['js'] = flask.url_for('static', filename='js/widgets/login.js')
        return flask.jsonify(**button)
