var timeline_uid = 1;


function TripManager(parent, infocard, trips)
{
    this.trips = trips;
    this.selected_trip = null;
    this.timeline = new Timeline(parent);
    this.origin_marker = {};
    this.destination_markers = [];
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
    tripmanager.selected_trip = new Trip('unnamed trip');
    $.get( "/widgets/timeline/new", function( form ) {
        infocard.close();
        infocard.setHeader('Create Trip');
        infocard.setContents(form);
        infocard.open();
        tripmanager.timeline.setTrip(tripmanager.selected_trip);
        tripmanager.timeline.popup();
        $('#new-trip form input[name=name]')
            .keyup(function() {
                var trip_name = $('#new-trip form input[name=name]').val();
                tripmanager.selected_trip.setName(trip_name)
                tripmanager.timeline.setHeader(trip_name);
            })
            .focus();
    });
};

TripManager.prototype.addPlace = function()
{
    var place = new Location(null, dateToday(), map.getCenter(), 1, null);
    this.selected_trip.addPlace(place);
}


function dateToday()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    } 
    if(mm<10) {
        mm='0'+mm
    } 

    today = yyyy + '-' + mm + '-' + dd;
    return today;
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


function Location(name, date, place, duration, description)
{
    this.name = name;
    this.date = date;
    this.latLng = place;
    this.duration = duration;
    this.description = description;
    this.marker = null;
    this.placeinfo = null;
    this.inbound_travel;
    this.outbound_travel;
}

Location.prototype.createMarker = function()
{
    var marker = new google.maps.Marker({
        map: map,
        clickable: true,
        draggable: true,
        position: this.latLng,
        raiseOnDrag: true,
        title: location.name,
        visible: true,
    });
    var place = this;
    google.maps.event.addListener(marker, 'dragend', function(event) {
        place.latLng = event.latLng;
    });
    var placeinfo = new PlaceInfo(this);
    google.maps.event.addListener(marker, 'drag', function(event) {
        placeinfo.move(event.latLng);
    });
    this.marker = marker;
    this.placeinfo = placeinfo;

    return marker;
}

Location.prototype.setInboundTravel = function(travel)
{
    if(this.inbound_travel) {
        this.inbound_travel.polyline.setMap(null);
    }
    this.inbound_travel = travel;
};

Location.prototype.setOutboundTravel = function(travel)
{
    if(this.outbound_travel) {
        this.outbound_travel.polyline.setMap(null);
    }
    this.outbound_travel = travel;
};


function Travel(mode, origin, destination, travel_time)
{
    console.log('travel from ' + origin.latLng + ' to ' +
                destination.latLng + ' by ' + mode);
    this.mode = mode;
    this.origin = origin;
    this.destination = destination;
    this.time = travel_time;
    this.infowindow = null;
    var color = '';
    if (mode == 'plane')
        color='red';
    else if (mode == 'boat')
        color='blue';
    else if (mode == 'train')
        color='green';
    else if (mode == 'car')
        color='orange';
    else
        color='black';

    var polyline = new google.maps.Polyline({
        draggable: false,
        geodesic: mode=='plane',
        clickable: true,
        map: map,
        path: [origin.latLng, destination.latLng],
        strokeColor: color
    });
    this.polyline = polyline;
    var travel = this;
    google.maps.event.addListener(origin.marker, 'drag', function(event) {
        polyline.setPath([event.latLng, destination.latLng]);
        travel.moveInfoWindow(event.latLng, destination.latLng);
    });
    google.maps.event.addListener(destination.marker, 'drag', function(event) {
        polyline.setPath([origin.latLng, event.latLng]);
        travel.moveInfoWindow(origin.latLng, event.latLng);
    });
    google.maps.event.addListener(polyline, 'click', function(event) {
        if (travel.infowindow) {
            console.log(travel);
            travel.moveInfoWindow(origin.latLng, destination.latLng);
            travel.infowindow.open(map);
        }
        else {
            $.get( "/widgets/timeline/travel", function( form ) {
                var position = google.maps.geometry.spherical.interpolate(
                    origin.latLng, destination.latLng, 0.5);
                var div = document.createElement('div');
                div.className = 'travelinfo';
                div.innerHTML = form;
                div.id = 'travel-' + timeline_uid++;
                travel.div = div;
                var infowindow = new google.maps.InfoWindow({
                    content: div,
                    disableAutoPan: true,
                    maxWidth: 235,
                    pixelOffset: new google.maps.Size(0, 7),
                    position: position
                });
                infowindow.open(map);
                travel.infowindow=infowindow;
                console.log(travel);
                $(div).change(function() {
                    var newMode =
                        $('div#'+div.id+' form select[name=travel-mode]')
                        .val();
                    travel.setMode(newMode);
                    travel.time =
                        $('div#'+div.id+' form input[name=travel-hours]')
                        .val();
                    });
            });
        }
    });
}

Travel.prototype.setMode = function(newMode)
{
    this.mode = newMode;
    if (this.mode == 'plane') {
        this.mode='plane';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: color
        });
    }
    else if (this.mode == 'boat') {
        color='blue';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: color
        });
    }
    else if (this.mode == 'train') {
        color='green';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: color
        });
    }
    else if (this.mode == 'car') {
        color='orange';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: color
        });
    }
    else {
        color='black';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: color
        });
    }
    this.moveInfoWindow(this.origin.latLng, this.destination.latLng);
};

Travel.prototype.moveInfoWindow = function(orig, dest)
{
    if(this.infowindow) {
        var position;
        if(this.mode == 'plane') {
            position = google.maps.geometry.spherical.interpolate(
            orig, dest, 0.5);
        }
        else {
            position = new google.maps.LatLng(
                orig.lat() - (orig.lat() - dest.lat())/2.0,
                orig.lng() - (orig.lng() - dest.lng())/2.0);
        }
        this.infowindow.setPosition(position);
    }
}


function Trip(name)
{
    this.name = name;
    this.locations = [];
    this.travel = [];
    this.return_trip = null;
}

Trip.prototype.setName = function(name)
{
    this.name = name;
};

Trip.prototype.addPlace = function(place)
{
    this.locations.push(place);
    var marker = place.createMarker();

    // if we have more than one place create travel to and from it.
    if(this.locations.length > 1) {
        console.log("More than 1 location, adding travel!");
        var n = this.locations.length;
        var prev = this.locations[n-2];
        var curr = this.locations[n-1];
        var orig = this.locations[0];

        var inbound_travel = new Travel('plane', prev, curr, 1);
        var outbound_travel = new Travel('plane', curr, orig, 1);
        prev.setOutboundTravel(inbound_travel);
        orig.setInboundTravel(outbound_travel);
        this.travel.pop();
        this.travel.push(inbound_travel);
        this.travel.push(outbound_travel);
    }
};


PlaceInfo.prototype = new google.maps.OverlayView();
function PlaceInfo(place)
{
    // Initialize all properties.
    this.map = map;
    this.place = place;
    this.anchor = place.latLng;
    // The header and contents of the infowindow

    // Define a property to hold the div containter of the Placeinfo.
    // We'll actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);
}

PlaceInfo.prototype.onAdd = function()
{
    var placeinfo = this;
    var div = document.createElement('div');
    div.className = 'placeinfo'
    div.id = 'place-' + timeline_uid++;
    this.div = div;

    $.get("/widgets/timeline/newplace", function( place_form ) {
        // Add the element to the "floatPane" pane.
        // We use the floatPane so that the Placeinfo is over the markers,
        // just like an InfoWindow
        div.innerHTML = place_form;
        var panes = placeinfo.getPanes();
        panes.floatPane.appendChild(div);
        placeinfo.div = div;
        //next set up some events so that we save the form values for easy
        // reference in the place object.
        $('div#'+div.id+' form input[name=place-name]')
            .change(function() {
                placeinfo.place.name =
                    $('div#'+div.id+' form input[name=place-name]').val();
            });
        $('div#'+div.id+' form input[name=place-date]')
            .change(function() {
                placeinfo.place.date =
                    $('div#'+div.id+' form input[name=place-date]').val();
            });
        $('div#'+div.id+' form input[name=place-days]')
            .change(function() {
                placeinfo.place.duration =
                    $('div#'+div.id+' form input[name=place-days]').val();
            });
        $('div#'+div.id+' form input[name=place-desc]')
            .change(function() {
                placeinfo.place.description =
                    $('div#'+div.id+' form input[name=place-desc]').val();
            });
    });
};

PlaceInfo.prototype.draw = function()
{
    // retrieve the projection from the overlay, so that we can
    // calculate the positioning of the upper left corner of the infowindow.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var pt = overlayProjection.fromLatLngToDivPixel(this.anchor);

    // Calculate the pixel coordinate of the upper left corner.
    this.div.style.left = pt.x + 'px';
    this.div.style.top = pt.y + 'px';
};

PlaceInfo.prototype.onRemove = function() {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
};

PlaceInfo.prototype.open = function()
{
    this.div.style.visibility = 'hidden';
};

PlaceInfo.prototype.close = function()
{
    this.div.style.visibility = 'visible';
};

PlaceInfo.prototype.move = function(newLocation)
{
    this.anchor = newLocation;
    this.draw();
};
