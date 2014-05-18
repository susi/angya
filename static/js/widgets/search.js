// Search box
var searchBox;
var searchBoxInput;
var goButton;
// places service is bound to the search box and the map.
var placesSrv;
var searchResults;

function Search(map, div, position, resultsdiv) {
  this.map = map;
  this.div = div;
  this.position = position;
  searchResults = resultsdiv;

  // Search box
  searchBoxInput = div.children[0];
  goButton = div.children[1];
  $(goButton).on('click', function() {
    placesSrv.textSearch({
        query: searchBoxInput.value,
        bounds: map.getBounds()
      }, function(places, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          placeMarkersOnMap(places);
        }
    });
  });
  
  searchBox = new google.maps.places.SearchBox(searchBoxInput);
  // places service is bound to the search box and the map.
  placesSrv = new google.maps.places.PlacesService(map);
  // Place the search box in the top left corner.
  map.controls[google.maps.ControlPosition[this.position]].push(div);
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    infocard.close();
    var places = searchBox.getPlaces();
    if (places) {
      placeMarkersOnMap(places);
    }
  });

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
}

function placeMarkersOnMap(places) {
    // Remove previous markers from the map and clear the markers array
    for (var i = 0, marker; marker = markers[i]; i++) {
        marker.setMap(null);
    }
    markers.length = 0;
    var bounds = new google.maps.LatLngBounds();

    // For each place, get the icon, place name, and location.
    for (var i = 0, place; place = places[i]; i++) {
        // Marker icon
        var image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(9, 9),
            scaledSize: new google.maps.Size(18, 18)
        };
        // Create a marker for each place.
        var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
        });
        marker.place = place;
        // Get the detailed place info and show it when a user clicks on a marker.
        google.maps.event.addListener(marker, 'click', getPlaceDetails);
        placesSrv.getDetails(
            {reference: marker.place.reference},
            function(place, status)
            {
                if (status != google.maps.places.PlacesServiceStatus.OK) {
                    console.log("no photo :(");
                }
            }
        );
        markers.push(marker);
        bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
}

// Get the detailed information of a place and show it in the infocard
function getPlaceDetails() {
    marker = this;
    placesSrv.getDetails(
        {reference: marker.place.reference},
        function(place, status) {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
                console.log("blääh");
                return;
            }
            buildPlaceInfo(place);
            infocard.setHeader(place.name);
            infocard.replaceContents(searchResults);
            infocard.resize(300, 350)
            infocard.open();
        });
}

function buildPlaceInfo(place)
{
    var icon = $('<img>')
        .attr('src', place.icon)
        .addClass('hotelIcon')
    $('#iw-icon', searchResults).empty().append(icon);
    var link = $('<a>')
        .attr('href', place.url)
        .addClass('search-strong')
        .html(place.name);
    $('#iw-url', searchResults).empty().append(link);
    $('#iw-address', searchResults).html(place.vicinity);

    if(place.formatted_phone_number) {
        $('#iw-phone-row', searchResults).show();
        $('#iw-phone', searchResults).html(place.formatted_phone_number);
    }
    else {
        $('#iw-phone-row', searchResults).hide();
    }

    // assign a star rating
    if (place.rating) {
        var ratingHtml = '';
        for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
        }
        $('iw-rating-row', searchResults).hide();
        $('iw-rating', searchResults).html(ratingHtml);
    } else {
        $('iw-rating-row', searchResults).hide();
    }

    if (place.website) {
        var link = $('<a>')
            .attr('href', place.website)
            .addClass('search-strong')
            .html(place.website);
        $('#iw-website-row', searchResults).show();
        $('#iw-website', searchResults).empty().append(link);
    } else {
        $('#iw-website-row', searchResults).hide();
    }

    if (place.photos) {
        var imgUrl = place.photos[0].getUrl({maxHeight: 200, maxWidth: 200});
        $('#iw-photo', searchResults).attr('src', imgUrl).show();
    }
    else {
        $('#iw-photo', searchResults).hide();
    }
    var place_json = {
        name: place.name,
        description: place.website,
        location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        }
    };
    var addToTripButton = $('<a>')
        .attr('href',
              'javascript:tripmanager.addPlace('+
              JSON.stringify(place_json)+');')
        .attr('id', 'iw-add-place')
        .addClass('search-strong')
        .html('add to trip');
    $('#iw-button-bar', searchResults)
        .empty()
        .append(addToTripButton);
}
