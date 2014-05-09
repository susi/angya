function TripManager(parent, infocard, trips)
{
    this.trips = trips;
    this.selected_trip = null;
    this.timeline = new Timeline(parent);
}

TripManager.prototype.listTrips = function()
{
    closeNavigation();
    infocard.close();
    infocard.setHeader('My trips');
    var ul = $('<ul>');
    for (i in this.trips) {
        var trip = this.trips[i];
        var a = $('<a>')
            .attr('href', 'javascript:tripmanager.showTrip("'+trip.key+'")')
            .html(trip.name);
        var li = $('<li>').append(a).appendTo(ul);
    }
    var a = $('<a>')
        .attr('href', 'javascript:tripmanager.createTrip()')
        .html('Create a new trip');
    var li = $('<li>').append(a).appendTo(ul);

    infocard.setContents(ul);
    infocard.open();
};

TripManager.prototype.showTrip = function(trip_id)
{
    var tripmanager = this;
    $.getJSON( "/widgets/timeline/" + trip_id, function( trip ) {
        if(trip) {
            tripmanager.selected_trip = trip;
            infocard.close();
            tripmanager.timeline.setTrip(trip);
            tripmanager.timeline.popup();
        }
        else {
            alert("failed to get trip details for trip " + trip_id);
        }
    });
};


TripManager.prototype.createTrip = function()
{
    var tripmanager = this;
    tripmanager.selected_trip = {name: 'unnamed trip', owner: '',
                                 locations: [], travel: []};
    $.get( "/widgets/timeline/new", function( form ) {
        infocard.close();
        infocard.setHeader('Create Trip');
        infocard.setContents(form);
        infocard.open();
        tripmanager.timeline.setTrip(tripmanager.selected_trip);
        tripmanager.timeline.popup();
        $('#new-trip form input[name=name]')
            .keyup(function() {
                tripmanager.timeline.setHeader(
                    $('#new-trip form input[name=name]').val())
            })
            .focus();
    });
};

TripManager.prototype.setOrigin = function()
{
    this.origin_marker = new google.maps.Marker({
        map: map,
        clickable: true,
        draggable: true,
        position: map.getCenter(),
        raiseOnDrag: true,
        title: 'Place me where you start your trip from',
        visible: true,
    });
}

function Timeline(parent)
{
    this.div = 
        $('<div>', {
            id: "timeline",
            class: "gradual"
        })
//        .mouseenter(this, function(e) {
//            e.data.popup();
//        })
        .click(this, function(e) {
            e.data.popdown();
        })
        .css('bottom', '-70px')
        .appendTo(parent);
    this.line = $('<hr>').appendTo(this.div);
    this.title = $('<h3>').appendTo(this.div);
    this.timeline = $('<div>', {
        id: "timeline-labels"
    }).appendTo(this.div);
    this.destinations = [];
    this.trip_duration = 0;
}

Timeline.prototype.popup = function()
{
    this.draw();
    $(this.div).css('bottom','22px');
    // draw lines to the map
};

Timeline.prototype.popdown = function()
{
    $(this.div).css('bottom','-80px');
    this.timeline.empty();
    for (i in this.markers) {
        this.markers[i].setMap(null);
    }
    for (i in this.travelpaths) {
        this.travelpaths[i].setMap(null);
    }
};

Timeline.prototype.setHeader = function(newHeader)
{
    this.title.html(newHeader);
};

Timeline.prototype.addLocation = function(place)
{
    console.log("adding location " + place.name);
    this.destinations.push(place);
    this.trip_duration += place.duration * 60; /* trip duration in minutes */
};

Timeline.prototype.clearLocations = function()
{
    this.destinations = [];
    this.timeline.empty();
    this.trip_duration = 0;
    for (i in this.markers) {
        this.markers[i].setMap(null);
    }
    for (i in this.travelpaths) {
        this.travelpaths[i].setMap(null);
    }
    this.markers = [];
    this.travelpaths = [];
};

Timeline.prototype.setTrip = function(trip)
{
    this.trip = trip;
    this.setHeader(trip.name);
    this.clearLocations();
    for(i in trip.locations) {
        var place = trip.locations[i];
        this.addLocation(place);
    }
};

Timeline.prototype.draw = function()
{
    this.timeline.empty();
    var timeline_width = this.div.width() - this.title.outerWidth();
    var left_space = this.title.outerWidth();
    var bounds = new google.maps.LatLngBounds();
    this.markers = [];
    for(i in this.destinations) {
        if((i > 0) && (this.trip_duration != 0)) { // space comes after
            // calculate the space before based on the duration of the
            // stay in the previous place
            left_space += Math.floor((this.destinations[i-1].duration * 60) *
                         (timeline_width/this.trip_duration));
        }
        var place = this.destinations[i];
        var div = $('<div>').css('left',left_space + 'px');
        var i = $('<i>').appendTo(div);
        var strong = $('<strong>')
            .html(place.name)
            .appendTo(div);
        var small = $('<small>')
            .html(place.date + ' ' + place.duration + '&nbsp;days')
            .appendTo(div);
        $(div).appendTo(this.timeline);
        var image = {
            url: '/static/img/icons/16.png',
            scaledSize: new google.maps.Size(24, 32),
        };

        var marker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            map: map,
            position: place.location,
            icon: image,
            title: place.name
        });
        this.markers.push(marker);
        bounds.extend(marker.getPosition());
        map.fitBounds(bounds);
    }
    this.travelpaths = [];
    for (i in this.trip.travel) {
        var trip = this.trip.travel[i];
        var color = '';
        if (trip.mode == 'plane')
            color='red';
        else if (trip.mode == 'boat')
            color='blue';
        else if (trip.mode == 'train')
            color='green';
        else if (trip.mode == 'car')
            color='orange';
        else
            color='black';

        var polyline = new google.maps.Polyline({
            geodesic: (trip.mode == 'plane'),
            map: map,
            path: [
                new google.maps.LatLng(trip.origin.lat, trip.origin.lng),
                new google.maps.LatLng(trip.destination.lat,
                                       trip.destination.lng)],
            strokeColor: color
        });
        this.travelpaths.push(polyline);
    }
};
