#!/bin/python
"""Angya main application.

This module contains the URL routing logic, and defines the URL handlers.
"""
import flask

#local URL handlers
import map #handles the /map url
import widgets.infocard
import widgets.login
import widgets.nav
import widgets.search
import widgets.socialshare
import widgets.timeline

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

@app.route('/widgets/search')
def search_handler():
    search = widgets.search.Search(app)
    return search.render()

@app.route('/widgets/login')
def login_handler():
    login = widgets.login.LoginButton(app)
    return login.render(True)

@app.route('/widgets/nav')
def nav_handler():
    nav = widgets.nav.Navigation(app)
    return nav.render()

@app.route('/widgets/infocard')
def infocard_handler():
    infocard = widgets.infocard.Infocard(app)
    return infocard.render()

@app.route('/widgets/timeline')
@app.route('/widgets/timeline/<trip_id>')
def timeline_handler(trip_id=None):
    timeline = widgets.timeline.Timeline(app)
    if trip_id == 'new':
        return timeline.render_trip_form()
    elif trip_id == 'newplace':
        return timeline.render_place_form()
    elif trip_id == 'travel':
        return timeline.render_travel_form()
    else:
        return timeline.render(trip_id)

@app.route('/widgets/timeline/<trip_id>', methods=['DELETE'])
def timeline_delete_handler(trip_id):
    timeline = widgets.timeline.Timeline(app)
    return timeline.delete(trip_id)

@app.route('/widgets/timeline/create', methods=['POST'])
def timeline_post_handler():
    timeline = widgets.timeline.Timeline(app)
    return timeline.create(flask.request.data)

@app.route('/widgets/socialshare')
def soacialshare_handler():
    social = widgets.socialshare.SocialShare(app)
    return social.render()


if __name__ == '__main__':
    app.run(debug=True)

