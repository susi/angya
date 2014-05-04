function TripManager(parent, infocard, trips)
{
    this.trips = trips;
    this.selected_trip = null;
    this.timeline = new Timeline(parent);
}

TripManager.prototype.listTrips = function()
{
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

TripManager.prototype.createTrip = function()
{
    infocard.open();
};

TripManager.prototype.showTrip = function(trip_id)
{
    var tripmanager = this;
    $.getJSON( "/widgets/timeline/" + trip_id, function( trip ) {
        if(trip) {
            tripmanager.selected_trip = trip;
            infocard.close();
            tripmanager.timeline.setHeader(trip.name);
            tripmanager.timeline.clearLocations();
            for(i in trip.locations) {
                var place = trip.locations[i];
                tripmanager.timeline.addLocation(place);
            }
            tripmanager.timeline.popup();
        }
        else {
            alert("failed to get trip details for trip " + trip_id);
        }
    });
};

function Timeline(parent)
{
    this.div = 
        $('<div>', {
            id: "timeline",
            class: "gradual"
        })
        .mouseenter(this, function(e) {
            e.data.popup();
        })
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
};

Timeline.prototype.draw = function()
{
    this.timeline.empty();
    var timeline_width = this.div.width() - this.title.outerWidth();
    
    var left_space = this.title.outerWidth();
    for(i in this.destinations) {
        if((i > 0) && (this.trip_duration != 0)) { // space comes after
            console.log("trip time: " + this.destinations[i-1].duration);
            console.log("timeline_width: " + timeline_width);
            console.log("trip duration: " + this.trip_duration);
            left_space += Math.floor((this.destinations[i-1].duration * 60) *
                         (timeline_width/this.trip_duration));
        }
        var place = this.destinations[i];
        console.log(place.name + " left_space: " + left_space + "px");
        var div = $('<div>').css('left',left_space + 'px');
        var i = $('<i>').appendTo(div);
        var strong = $('<strong>')
            .html(place.name)
            .appendTo(div);
        var small = $('<small>')
            .html(place.date + ' ' + place.duration + '&nbsp;days')
            .appendTo(div);
        $(div).appendTo(this.timeline);
    }
};
