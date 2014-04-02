#!/bin/python
"""Angya main application.

This module contains the URL routing logic, and defines the URL handlers.
"""
import flask

#local URL handlers
import map #handles the /map url
import widgets.login
import widgets.nav

# Create a fals application.
app = flask.Flask(__name__)

@app.route('/')
def index():
    """Redirects / to /map."""
    return flask.redirect(flask.url_for('map_handler'))

@app.route('/map')
def map_handler():
    """Creates a Map object and renders it."""
    map_app = map.Map(app);
    return map_app.render()

@app.route('/widgets/login')
def login_handler():
    login = widgets.login.LoginButton(app)
    return login.render(True)

@app.route('/widgets/nav')
def nav_handler():
    nav = widgets.nav.Navigation(app)
    return nav.render()


if __name__ == '__main__':
    app.run(debug=True)

