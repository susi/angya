var timeline_uid = 1;


function TripManager(parent, infocard, trips)
{
    this.trips = trips;
    this.selected_trip = null;
    this.timeline = new Timeline(parent);
    this.origin_marker = {};
    this.destination_markers = [];
    if(window.location.hash) {
        var hash = window.location.hash.substring(1);
        this.showTrip(hash);
    }
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
    $.getJSON( "/widgets/timeline/" + trip_id, function( trip_data ) {
        if(trip_data) {
            infocard.close();
            var trip = new Trip(trip_data);
            tripmanager.selected_trip = trip;
            tripmanager.timeline.editable = false;
            tripmanager.timeline.setTrip(trip);
            window.location.hash = trip_id;
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
    tripmanager.selected_trip = new Trip({name:'unnamed trip'});
    $.get( "/widgets/timeline/new", function( form ) {
        infocard.close();
        infocard.setHeader('Create Trip');
        infocard.setContents(form);
        infocard.open();
        tripmanager.selected_trip.form = form;
        tripmanager.timeline.setTrip(tripmanager.selected_trip);
        tripmanager.timeline.editable = true;
        tripmanager.timeline.popup();
        $('#new-trip form input[name=name]')
            .keyup(function() {
                var trip_name = $('#new-trip form input[name=name]').val();
                tripmanager.selected_trip.setName(trip_name)
                tripmanager.timeline.setHeader(trip_name);
            })
            .focus();
        $('#new-trip form').submit(function(event) {
            event.preventDefault();
            tripmanager.timeline.popdown();
            tripmanager.saveTrip();
        });
        $('#new-trip form input[name=cancel]').click(function(event) {
            event.preventDefault();
            tripmanager.timeline.popdown();
            tripmanager.cancelTrip();
        });
    });
};

TripManager.prototype.cancelTrip = function() {
    this.timeline.popdown();
    this.selected_trip.cancel();
    this.listTrips();
};

TripManager.prototype.addPlace = function()
{
    var place = new Location({
        name:'',
        date: dateToday(),
        duration: 1,
        description: ''});
    this.selected_trip.addPlace(place);
    this.timeline.draw(true);
}

TripManager.prototype.saveTrip = function()
{
    var tripmanager = this;
    var trip = {
        name:this.selected_trip.name,
        locations: [],
        travel: []
    };
    for(var i in this.selected_trip.locations) {
        var place = this.selected_trip.locations[i];
        var json_place = {
            name: place.name,
            date: place.date,
            location: {
                lat: place.latLng.lat(),
                lon: place.latLng.lng()
            },
            duration: place.duration,
            description: place.description
        };
        trip.locations.push(json_place);
        place.marker.setMap(null);
        place.placeinfo.close();
    }
    for(var i in this.selected_trip.travel) {
        var travel = this.selected_trip.travel[i];
        var json_travel = {
            mode: travel.mode,
            origin: {
                lat: travel.origin.latLng.lat(),
                lon: travel.origin.latLng.lng()
            },
            destination: {
                lat: travel.destination.latLng.lat(),
                lon: travel.destination.latLng.lng()
            },
            time: travel.time
        };
        trip.travel.push(json_travel);
        travel.polyline.setMap(null);
        if(travel.infowindow)
            travel.infowindow.close();
    }
    tripmanager.trips.push(trip);
    var json_trip = JSON.stringify(trip);
    console.log('Saving trip!');
    console.log(json_trip);
    $.ajax({
        type: 'POST',
        url: '/widgets/timeline/create',
        data: json_trip,
        dataType: 'json',
        contentType: 'application/json; charset=utf-8"',
        complete: function(jqxhr) {
            if(jqxhr.status == 200) {
                var key = jqxhr.responseText;
                console.log('TODO: delete selected_trip');
                tripmanager.timeline.editable=false;
                tripmanager.showTrip(key);
                json_trip.key = key;
                tripmanager.listTrips();
            }
            else {
                tripmanager.timeline.popup();
                alert('Saving trip failed. Try again.');
            }
        }
    });
};

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
    this.editable = false;
}

Timeline.prototype.popup = function()
{
    if(this.trip.key)
        window.location.href = this.trip.key;
    this.draw(this.editable);
    $(this.div).css('bottom','22px');
    // draw lines to the map
};

Timeline.prototype.popdown = function()
{
    window.location.hash = '';
    $(this.div).css('bottom','-80px');
    this.timeline.empty();
    for (i in this.trip.locations) {
        this.trip.locations[i].hide();
    }
    for (i in this.trip.travel) {
        this.trip.travel[i].hide();
    }
};

Timeline.prototype.setTrip = function(trip)
{
    if(this.trip)
        this.popdown();
    this.trip = trip;

   this.popup();
};

Timeline.prototype.setHeader = function(newHeader)
{
    this.title.html(newHeader);
};

Timeline.prototype.draw = function(editable)
{
    var trip_duration = 0;
    for(var i in this.trip.locations) {
        var place = this.trip.locations[i];
        console.log("adding location " + place.name);
        trip_duration += parseInt(place.duration); /* trip duration in hours */
        console.log('trip_duration: ' + trip_duration);
    }
    this.timeline.empty();
    this.title.html(this.trip.name);
    var timeline_width = this.div.width() - this.title.outerWidth();
    var left_space = this.title.outerWidth();
    var bounds = new google.maps.LatLngBounds();
    console.log('left_space is ' + left_space + 'px');
    for(var i in this.trip.locations) {
        console.log(left_space);
        var place = this.trip.locations[i];
        if((i > 0) && (trip_duration != 0)) { // space comes after
            // calculate the space before based on the duration of the
            // stay in the previous place
            var left = Math.floor(parseInt(
                place.inbound_travel.origin.duration) *
                                  (timeline_width/trip_duration));
            console.log('increasing left space with ' + left + 'px');
            if(left < 80)
                left_space += 80;
            else
                left_space += left;
        }
        console.log('left space is now:' + left_space + 'px');
        var div = $('<div>').css('left',left_space + 'px');
        var i = $('<i>').appendTo(div);
        var strong = $('<strong>')
            .html(place.name)
            .appendTo(div);
        var small = $('<small>')
            .html(place.date + ' ' + place.duration + '&nbsp;days')
            .appendTo(div);
        $(div).appendTo(this.timeline);
        bounds.extend(place.latLng);
        place.draw(editable);
        if(!editable)
            map.fitBounds(bounds);
    }
    for(var i in this.trip.travel) {
        this.trip.travel[i].draw(editable);
    }
};


function Location(location_data)
{
    this.id = 'location-' + timeline_uid++;
    if('name' in location_data)
        this.name = location_data.name;
    else
        this.name = null;
    if('date' in location_data)
        this.date = location_data.date;
    else
        thid.date = null;
    if('location' in location_data)
        this.latLng = new google.maps.LatLng(location_data.location.lat,
                                             location_data.location.lng);
    else
        this.latLng = map.getCenter();
    if('duration' in location_data)
        this.duration = location_data.duration;
    else
        this.duration = 0;
    if('description' in location_data)
        this.description = location_data.description;
    else
        this.description = null;
    this.marker = null;
    this.placeinfo = null;
    this.inbound_travel = null;
    this.outbound_travel = null;
}

Location.prototype.unlink = function()
{
    this.latLng = null;
    if(this.marker) {
        this.marker.setMap(null);
        this.marker = null;
    }
    if(this.placeinfo) {
        this.placeinfo.close();
        this.placeinfo = null;
    }
    this.inbound_travel = null;
    this.outbound_travel = null;
}

Location.prototype.draw = function(editable)
{
    if(this.marker) {
        console.log('I have a marker, putting it on the map.');
        this.marker.setClickable(editable);
        this.marker.setDraggable(editable);
        this.marker.setMap(map);
    }
    else {
        var image = {
            url: '/static/img/icons/16.png',
            scaledSize: new google.maps.Size(24, 32),
        };
        var marker = new google.maps.Marker({
            map: map,
            clickable: editable,
            draggable: editable,
            position: this.latLng,
            raiseOnDrag: true,
            title: location.name,
            visible: true,
            icon: image,
        });
        this.marker = marker;
    }

    if(editable) {
       if(!this.placeinfo) {
            var place = this;
            var placeinfo = new PlaceInfo(this);
            this.placeinfo = placeinfo;
            google.maps.event.addListener(marker, 'dragend', function(event) {
                place.latLng = event.latLng;
            });
            google.maps.event.addListener(marker, 'drag', function(event) {
                placeinfo.move(event.latLng);
            });
            google.maps.event.addListener(marker, 'click', function(event) {
                placeinfo.open();
            });
        }
    }
    return marker;
}

Location.prototype.hide = function()
{
    if(this.marker)
        this.marker.setMap(null);
    if(this.placeinfo)
        this.placeinfo.close();
}

Location.prototype.setInboundTravel = function(travel)
{
    if(this.inbound_travel) {
        console.log('location '+this.name+' has inbound travel');
        this.inbound_travel.unlink();
    }
    this.inbound_travel = travel;
};

Location.prototype.setOutboundTravel = function(travel)
{
    if(this.outbound_travel) {
        console.log('location '+this.name+' has outbound travel');
        this.outbound_travel.unlink();
    }
    this.outbound_travel = travel;
};


function Travel(travel_data)
{
    this.id = 'travel-' + timeline_uid++;
    console.log(travel_data);
    if('mode' in travel_data)
        this.mode = travel_data.mode;
    else
        this.mode = 'plane';

    if(('origin' in travel_data) &&
       (travel_data.origin instanceof Location))
        this.origin = travel_data.origin;
    else
        this.origin = null;

    if(('destination' in travel_data) &&
       (travel_data.destination instanceof Location))
        this.destination = travel_data.destination;
    else
        this.destination = null;

    if('time' in travel_data) {
        this.time = travel_data.time;
    }
    else {
        this.time = 0;
    }
    this.infowindow = null;
    this.has_listeners = false;
    this.event_handlers = [];
}

Travel.prototype.draw = function(editable)
{
    if(this.polyline) {
        this.setMode(this.mode);
        this.polyline.setOptions({clickable: editable, map:map});
    }
    else {
       var polyline = new google.maps.Polyline({
            draggable: false,
            clickable: editable,
            map: map,
            path: [this.origin.latLng, this.destination.latLng],
        });
        this.polyline = polyline;
        this.setMode(this.mode);
    }
    if(editable && !this.has_listeners) {
        var travel = this;
        var eh1 = google.maps.event.addListener(
            travel.origin.marker, 'drag', function(event) {
                polyline.setPath([event.latLng, travel.destination.latLng]);
                travel.moveInfoWindow(event.latLng, travel.destination.latLng);
            });
        var eh2 = google.maps.event.addListener(
            travel.destination.marker, 'drag', function(event) {
                polyline.setPath([travel.origin.latLng, event.latLng]);
                travel.moveInfoWindow(travel.origin.latLng, event.latLng);
            });
        var eh3 = google.maps.event.addListener(
            polyline, 'click', function(event) {
                if (travel.infowindow) {
                    travel.moveInfoWindow(travel.origin.latLng,
                                          travel.destination.latLng);
                    travel.infowindow.open(map);
                }
                else {
                    $.get( "/widgets/timeline/travel", function( form ) {
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
                        });
                        travel.moveInfoWindow(travel.origin,
                                              travel.destination);
                        infowindow.open(map);
                        travel.infowindow=infowindow;
                        console.log(travel);
                        $(div).change(function() {
                            var newMode =$(
                                'div#'+div.id+' form select[name=travel-mode]')
                                .val();
                            travel.setMode(newMode);
                            travel.time = $(
                                'div#'+div.id+' form input[name=travel-hours]')
                                .val();
                        });
                    });
                }
            })
        this.event_handlers.push(eh1);
        this.event_handlers.push(eh2);
        this.event_handlers.push(eh3);
        this.has_listeners = true;
    }
};

Travel.prototype.hide = function() {
    if(this.polyline)
        this.polyline.setMap(null);
    if(this.infowindow)
        this.infowindow.close();
}

Travel.prototype.unlink = function()
{
    if(this.polyline) {
        this.polyline.setMap(null);
        this.polyline = null;
    }
    if(this.infowindow) {
        this.infowindow.close();
        this.infowindow = null;
    }
    for(var i in this.event_handlers) {
        google.maps.event.removeListener(this.event_handlers[i]);
    }
    this.origin = null
    this.destination = null;
    console.log(this);
};

Travel.prototype.setMode = function(newMode)
{
    this.mode = newMode;
    if (this.mode == 'plane') {
        this.mode='plane';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: 'red'
        });
    }
    else if (this.mode == 'boat') {
        color='blue';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: 'blue'
        });
    }
    else if (this.mode == 'train') {
        color='green';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: 'green'
        });
    }
    else if (this.mode == 'car') {
        color='orange';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: 'orange'
        });
    }
    else {
        color='black';
        this.polyline.setOptions({
            geodesic: this.mode=='plane',
            strokeColor: 'black'
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
            var lng = (dest.lng() + orig.lng()) / 2.0;
            var lat = (dest.lat() + orig.lat()) / 2.0;
            position = new google.maps.LatLng(lat, lng);
        }
        this.infowindow.setPosition(position);
    }
}


function Trip(trip_data)
{
    console.log(trip_data);
    this.id = 'trip-' + timeline_uid++;
    this.key = trip_data.key;
    this.name = trip_data.name;
    console.log('creating trip ' + this.id);
    this.locations = [];
    this.travel = [];
    if('locations' in trip_data) {
        var len = trip_data.locations.length;
        for(var i in trip_data.travel) {
            var travel = new Travel(trip_data.travel[i]);
            console.log('new travel '+travel.id);
            console.log(travel);
            this.travel.push(travel);
        }
        for(var i = 0; i < len; i++) {
            var j = (len + i - 1) % len;
            var outbound = this.travel[i];
            var inbound = this.travel[j];
            var place = new Location(trip_data.locations[i]);
            inbound.destination = place;
            outbound.origin = place;
            place.setInboundTravel(inbound);
            place.setOutboundTravel(outbound);
            console.log('new location '+place.id);
            console.log(place);
            this.locations.push(place);
        }
    }
}

Trip.prototype.setName = function(name)
{
    this.name = name;
};

Trip.prototype.addPlace = function(place)
{
    var trip = this;
    this.locations.push(place);
    console.log('added place ' + place.id + ' to trip ' + trip.id);
    // if we have more than one place create travel to and from it.
    if(this.locations.length > 1) {
        console.log("More than 1 location, adding travel!");
        var n = this.locations.length;
        var prev = this.locations[n-2];
        var curr = this.locations[n-1];
        var orig = this.locations[0];

        var inbound_travel = new Travel({origin:prev,
                                         destination:curr});
        var outbound_travel = new Travel({origin:curr,
                                          destination:orig});
        console.log('setting prev.outbound_travel');
        prev.setOutboundTravel(inbound_travel);
        console.log('setting orig.inbound_travel');
        orig.setInboundTravel(outbound_travel);
        console.log('setting curr.inbound_travel');
        curr.setInboundTravel(inbound_travel);
        console.log('setting curr.outbound_travel');
        curr.setOutboundTravel(outbound_travel);

        this.travel.pop();
        this.travel.push(inbound_travel);
        this.travel.push(outbound_travel);
    }
};

Trip.prototype.delPlace = function(place)
{
    if(this.locations.length == 1) {
        this.travel = [];
        this.locations=[];
        place.unlink();
    }
    if(this.locations.length == 2) {
        for(i in this.locations) {
            console.log(this.locations[i].id + '=?' + place.id);
            if(this.locations[i].id == place.id) {
                console.log(this.locations[i].id + '==' + place.id);
                this.locations.splice(i, 1);
            }
        }
        place.unlink();
        var orig = this.locations[0];
        orig.setInboundTravel(null);
        orig.setOutboundTravel(null);
        this.travel = [];
    }
    else {
        console.log(place);
        var inbound = place.inbound_travel;
        var outbound = place.outbound_travel;
        if (inbound && outbound) {
            console.log('Unlinking inbound and outbound travel');
            var prev = inbound.origin;
            var next = outbound.destination;
            var new_travel = new Travel({origin: prev,
                                         destination: next});
            prev.setOutboundTravel(new_travel);
            next.setInboundTravel(new_travel);

            for(i in this.travel) {
                if(this.travel[i].id == inbound.id)
                    this.travel.splice(i, 1);
            }
            inbound.unlink();

            for(i in this.travel) {
                if(this.travel[i].id == outbound.id)
                    this.travel.splice(i, 1);
            }
            outbound.unlink();
            this.travel.push(new_travel);
        }

        for(i in this.locations) {
            console.log(this.locations[i].id + '=?' + place.id);
            if(this.locations[i].id == place.id) {
                console.log(this.locations[i].id + '==' + place.id);
                this.locations.splice(i, 1);
            }
        }
        place.unlink();
    }
    tripmanager.timeline.popdown();
    tripmanager.timeline.popup();
};

Trip.prototype.cancel = function()
{
    for(var i=this.locations.length-1; i >= 0; i--) {
        this.delPlace(this.locations[i]);
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
    div.className = 'placeinfo';
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
        console.log('setting form input handler for ' + div.id);
        //next set up some events so that we save the form values for easy
        // reference in the place object.
        $('div#'+div.id+' .remove-place')
            .click(function(event) {
                tripmanager.selected_trip.delPlace(placeinfo.place);
        })
        $('div#'+div.id+' .close-icon')
            .click(function(event) {
                placeinfo.close();
            })
        $('div#'+div.id+' form input[name=place-name]')
            .keyup(function() {
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
            })
            .keyup(function() {
                placeinfo.place.duration =
                    $('div#'+div.id+' form input[name=place-days]').val();
            });
        $('div#'+div.id+' form textarea[name=place-desc]')
            .keyup(function() {
                placeinfo.place.description =
                    $('div#'+div.id+' form textarea[name=place-desc]').val();
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
    this.div.style.visibility = 'visible';
};

PlaceInfo.prototype.close = function()
{
    this.div.style.visibility = 'hidden';
};

PlaceInfo.prototype.move = function(newLocation)
{
    this.anchor = newLocation;
    this.draw();
};
