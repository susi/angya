"""This module defines the Timeline.

he timeline is a trip that a user takes."""

import json
import datetime

import flask
from google.appengine.api import users
from google.appengine.ext import ndb

class Location(ndb.Model):
    name = ndb.StringProperty()
    date = ndb.DateProperty()
    location = ndb.GeoPtProperty()
    duration = ndb.IntegerProperty()

class Travel(ndb.Model):
    mode = ndb.StringProperty(
        choices=["car", "boat", "plane", "train", "other"])
    origin = ndb.GeoPtProperty()
    destination = ndb.GeoPtProperty()
    travel_time = ndb.FloatProperty()

class Trip(ndb.Model):
    name = ndb.StringProperty()
    owner = ndb.StringProperty()
    locations = ndb.StructuredProperty(Location, repeated=True)
    travel = ndb.StructuredProperty(Travel, repeated=True)

class Timeline(object):
    def __init__(self, app):
        self.user = users.get_current_user()
        self.app = app
        if self.user:
            self.trips = Trip.query(Trip.owner == self.user.email())
        else:
            self.trips = []

    def render(self, trip_id=None):
        if trip_id:
            # require the user to own the trip
            trip = ndb.Key(urlsafe=trip_id).get()
            if trip and self.user and self.user.email() == trip.owner:
                trip = json.loads(
                    json.dumps(trip.to_dict(), cls=NdbJSONEncoder))
            else:
                trip = {}
            return flask.jsonify(**trip)
        else:
            trips = []
            for trip in self.trips:
                trips.append({'name': trip.name, 'key': trip.key.urlsafe()})
            widget = {
                'name': 'timeline',
                'js': flask.url_for('static',
                                    filename='js/widgets/timeline.js'),
                'css': flask.url_for('static',
                                     filename='css/widgets/timeline.css'),
                'trips': trips,
            }
            return flask.jsonify(**widget)


class NdbJSONEncoder(json.JSONEncoder):
    def default(self, o):
        # If this is a key, you might want to grab the actual model.
        if isinstance(o, ndb.Model):
            return o.to_dict
        elif isinstance(o, ndb.GeoPt):
            return {'lat':o.lat, 'lng':o.lon}
        elif isinstance(o, (ndb.Key,datetime.date, datetime.datetime)):
            return str(o)  # Or whatever other date format you're OK with...
        else:
            return json.JSONEncoder.default(o)
