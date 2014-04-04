// Search box
var searchBox;
var searchBoxInput;
var goButton;
// places service is bound to the search box and the map.
var placesSrv;

function Search(map, div, position) {
  this.map = map;
  this.div = div;
  this.position = position;

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
                    return;
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
            buildPlaceIW(place);
            infocard.setHeader(place.name);
            infocard.setContents(infoWindowContent.innerHTML);
            infocard.resize(250, 350)
            infocard.open();
        });
}

// Create the infoWindow contents from the place deatis json.
function buildPlaceIW(place) {
    document.body.appendChild(infoWindowContent);
    console.log("buildPlaceIW("+place.name+")");
    document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
        'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
        '">' + place.name + '</a></b>';
    document.getElementById('iw-address').textContent = place.vicinity;

    if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent =
            place.formatted_phone_number;
    } else {
        document.getElementById('iw-phone-row').style.display = 'none';
    }

    // Assign a five-star rating to the hotel, using a black star ('&#10029;')
    // to indicate the rating the hotel has earned, and a white star ('&#10025;')
    // for the rating points not achieved.
    if (place.rating) {
        var ratingHtml = '';
        for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
            document.getElementById('iw-rating-row').style.display = '';
            document.getElementById('iw-rating').innerHTML = ratingHtml;
        }
    } else {
        document.getElementById('iw-rating-row').style.display = 'none';
    }

    if (place.website) {
        var website = place.website;
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = website;
    } else {
        document.getElementById('iw-website-row').style.display = 'none';
    }

    if (place.photos) {
        imgUrl = place.photos[0].getUrl({maxHeight: 200, maxWidth: 200});
        img = document.getElementById('iw-photo');
        img.src = imgUrl;
        img.style.display = 'block';
    }
    else {
        document.getElementById('iw-photo').style.display = 'none';
    }
}
