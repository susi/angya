function TripManager(parent, infocard, trips)
{
    this.infocard = infocard;
    this.trips = trips;
    this.selected_trip = null;
    this.timeline = new Timeline(parent);
}

TripManager.prototype.listTrips = function()
{
    this.infocard.close();
    this.infocard.setHeader('My trips');
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

    this.infocard.setContents(ul);
    this.infocard.open();
};

TripManager.prototype.createTrip = function()
{
    this.infocard.open();
};

TripManager.prototype.showTrip = function(trip_id)
{
    $.getJSON( "/widgets/timeline/" + trip_id, function( trip ) {
        if(trip) {
            this.selected_trip = trip;
            this.infocard.close();
            this.timeline.setHeader(trip.name);
            this.timeline.clearLocations();
            for(i in trip.locations) {
                location = trip.locations[i];
                this.timeline.addLocation(location);
            }
            this.timeline.popup();
        }
        else {
            alert("failed to get trip details for trip " + trip);
        }
    });
};

function Timeline(parent)
{
    this.div = 
        $('<div>', {
            id: "timeline",
            class: "gradual popdown"
        })
        .mouseenter(this, function(e) {
            e.data.popup();
        })
        .click(this, function(e) {
            e.data.popdown();
        })
        .css('bottom', '-35px')
        .appendTo(parent);
    this.title = $('<h3>').appendTo(this.div);
    this.timeline = $('<div>').appendTo(this.div);
    this.destinations = [];
}

Timeline.prototype.popup = function()
{
    this.draw();
    $(this.div).css('bottom','0px');
    // draw lines to the map
};

Timeline.prototype.popdown = function()
{
    $(this.div).css('bottom','-35px');
    this.timeline.html='';
};

Timeline.prototype.setHeader = function(newHeader)
{
    this.header.html = newHeader;
};

Timeline.prototype.addLocation = function(location)
{
    this.destinations.append(location);
};

Timeline.prototype.clearLocations = function(location)
{
    this.destinations = [];
};

Timeline.prototype.draw = function()
{
    this.timeline.html = '';
    for(i in self.destinations) {
        var location = self.destinations[i];
        var div = $('<div>');
        $('<i>').appendTo(div);
        $('<strong>')
            .html(location.name)
            .appendTo(div);
        $('<small>')
            .html(location.date + ' - ' + location.duration + 'days')
            .appendTo(div);
        $(div).appendTo(this.timeline);
    }
};
