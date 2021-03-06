"""This module defines the Timeline.

he timeline is a trip that a user takes."""

import json
import datetime
import logging

import flask
from google.appengine.api import users
from google.appengine.ext import ndb

class Location(ndb.Model):
    name = ndb.StringProperty()
    date = ndb.DateProperty()
    location = ndb.GeoPtProperty()
    duration = ndb.IntegerProperty()
    description = ndb.TextProperty()

class Travel(ndb.Model):
    mode = ndb.StringProperty(
        choices=["car", "boat", "plane", "train", "other"])
    origin = ndb.GeoPtProperty()
    destination = ndb.GeoPtProperty()
    time = ndb.FloatProperty()

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
            trip = ndb.Key(urlsafe=trip_id).get()
            if trip:
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

    def render_trip_form(self):
        return flask.render_template(
            'widgets/timeline.html',
            user=self.user, new_trip_form=True)

    def render_place_form(self):
        return flask.render_template(
            'widgets/timeline.html',
            user=self.user, new_place_form=True,
            today=datetime.date.today().isoformat())

    def render_travel_form(self):
        return flask.render_template(
            'widgets/timeline.html',
            user=self.user, travel_form=True)

    def create(self, trip_data):
        if not self.user:
            logging.error('Login required')
            return "LOGIN"
        logging.debug('create with data:')
        logging.debug(trip_data)
        json_trip = json.loads(trip_data)
        trip = JsonObject(**json_trip)
        # create a Trip object and put it in the ndb
        travel = []
        for journey_dict in trip.travel:
            journey = JsonObject(**journey_dict)
            travel.append(Travel(
                    mode=journey.mode, time=float(journey.time),
                    origin=ndb.GeoPt(journey.origin['lat'],
                                     journey.origin['lon']),
                    destination=ndb.GeoPt(journey.destination['lat'],
                                          journey.destination['lon'])))
        locations = []
        for place_dict in trip.locations:
            place = JsonObject(**place_dict)
            locations.append(Location(
                    name=place.name, duration=int(place.duration),
                    date=datetime.datetime.strptime(
                        place.date, '%Y-%m-%d').date(),
                    description=place.description,
                    location=ndb.GeoPt(place.location['lat'],
                                       place.location['lon'])))
        ndb_trip = Trip(name=trip.name, locations=locations, travel=travel,
                        owner=self.user.email())
        key = ndb_trip.put()
        logging.debug('Pushed trip to ndb!')
        return key.urlsafe()

    def delete(self, trip_id):
        if not self.user:
            logging.error('Login required')
            return "LOGIN"
        key = ndb.Key(urlsafe=trip_id);
        trip = key.get()
        if trip.owner == self.user.email():
            key.delete();
            return 'OK'
        return 'NOTOWNER'

class JsonObject(object):
    def __init__(self, **entries):
        self.__dict__.update(entries)


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
