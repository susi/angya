"""This module defines the Timeline.

he timeline is a trip that a user takes."""

import flask
from google.appengine.api import users
from google.appengine.ext import ndb

class Location(ndb.Model):
    name = ndb.StringProperty()
    date = ndb.DateProperty()
    location = ndb.GeoPtProperty()
    duration = ndb.IntegerProperty()

class Travel(ndb.Model):
    mode = ndb.StringProperty(choices=["car", "boat", "plane", "other"])
    origin = ndb.GeoPtProperty()
    destination = ndb.GeoPtProperty()
    travel_time = ndb.FloatProperty()

class Trip(ndb.Model):
    name = ndb.StringProperty()
    owner = ndb.UserProperty()
    locations = ndb.StructuredProperty(Location, repeated=True)
    travel = ndb.StructuredProperty(Travel, repeated=True)

class Timeline(object):
    def __init__(self, app):
        self.user = users.get_current_user()
        self.app = app
        if self.user:
            self.trips = Trip.query(Trip.owner == user)
        else:
            self.trips = []

    def render(self, trip_id=None):
        if trip_id:
            # require the user to own the trip
            trip = Trip.get_by_id(trip_id)
            if trip and self.user and self.user.email == trip.owner:
                trip = trip.to_dict()
            else:
                trip = {}
            return flask.jsonify(**trip)
        else:
            trips = []
            for trip in self.trips:
                trips.append(trip.to_dict())
            widget = {
                'name': 'timeline',
                'js': flask.url_for('static', filename='js/widgets/timeline.js'),
                'css': flask.url_for('static', filename='css/widgets/timeline.css'),
                'trips': trips,
            }
            return flask.jsonify(**widget)

