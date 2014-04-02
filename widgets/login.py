"""This module defines the login widgets."""

import flask

from google.appengine.api import users

class LoginButton(object):
    """The LoginButton returns a login/register button widget."""

    def __init__(self, app):
        self.user = users.get_current_user()
        self.app = app

    def render(self, is_login=True):
        button = {}
        if self.user:
            button['name'] = 'logout'
            button['html'] = flask.render_template('widgets/login.html',
                                                   user=self.user.email(),
                                                   button_text='logout',
                                                   url=users.create_logout_url('/map'))
        else:
            button['name'] = 'login'
            button['html'] = flask.render_template('widgets/login.html',
                                                    button_text='login',
                                                    url=users.create_login_url('/map'))
        button['position'] = 'TOP_RIGHT'
        button['js'] = flask.url_for('static', filename='js/widgets/login.js')
        button['css'] = flask.url_for('static', filename='css/widgets/login.css')

        return flask.jsonify(**button)
