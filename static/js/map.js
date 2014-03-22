var map;
var geoclocation = new google.maps.LatLng(0, 0);
var placesSrv; // Places service used by the search box.
var infoWindowContent; // The element which holds the current info window content
var infoWindow; // The InfoWindow object.
var filmstrip;
var markers = [];
var lastUpdate;
var loginButton;

$(document).ready(function(){
  geolocate();

	// =========== variables ===============
  var mapOptions = {
    center: geoclocation,
    zoom: 5
  };

  // Search box
  var searchBoxInput = document.getElementById("search-box");
  var searchBox = new google.maps.places.SearchBox(searchBoxInput);

  // Infowindow
  infoWindowContent = document.getElementById('info-content');
  infoWindow = new google.maps.InfoWindow({
    content: infoWindowContent
  });

  // Film strip
  filmstrip = new Filmstrip(document.getElementById('filmstrip'),
                            photoClicked);

  lastUpdate = new Date().getTime();

  // The map
  map = new google.maps.Map(document.getElementById("map-canvas"),
                            mapOptions);
  // places service is bound to the search box and the map.
  placesSrv = new google.maps.places.PlacesService(map);

	// =========== functions ===============
  // get the user's location

  // Place the search box in the top left corner.
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBoxInput);

  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
      infoWindow.close();
      var places = searchBox.getPlaces();
      placeMarkersOnMap(places);
  });

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
    now = new Date().getTime();
    // limit refreshes to happen at most every 5 seconds.
    if(now - lastUpdate > 5000) {
      lastUpdate=now;
      filmstrip.update(bounds);
    }
  });

  widgetLoader = new XMLHttpRequest();
  widgetLoader.onreadystatechange = function() {
    if ((widgetLoader.readyState==4) && (widgetLoader.status==200)) {
      var widget = JSON.parse(widgetLoader.responseText);
      var div = document.createElement('div');
      div.innerHTML = widget.html;
      console.log('fetching ' + widget.js)
      $.getScript(widget.js)
        .done(function(script, textStatus) {
          console.log(script);
          console.log(textStatus);
          loginButton = new LoginButton(div, widget.position);
        })
        .fail(function(jqxhr, settings, exception) {
          console.log("Triggered ajaxError handler.");
          console.log(exception.stack);
          console.log(exception.message);
        });
    }
  };
  widgetLoader.open("GET", "/widgets/login", true);
  widgetLoader.send(null);

});

function widgetHover() {
    widgetDiv = document.getElementById('login');
    if (widgetDiv.className.indexOf('inactive') != -1) {
        widgetDiv.className = 'widget active';
    }
    else {
        widgetDiv.className = 'widget inactive';
    }
}

function photoClicked(photoLocation) {
    placesSrv.nearbySearch(
        {location: photoLocation,
         radius: 5000,
         types: [
             "amusement_park",
             "aquarium",
             "art_gallery",
             "bar",
             "cafe",
             "campground",
             "casino",
             "cemetery",
             "church",
             "city_hall",
             "embassy",
             "establishment",
             "hindu_temple",
             "library",
             "lodging",
             "mosque",
             "movie_theater",
             "museum",
             "night_club",
             "park",
             "restaurant",
             "rv_park",
             "spa",
             "stadium",
             "synagogue",
             "zoo"]
        },
        function(places, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                placeMarkersOnMap(places);
            }
        });
}

function placeMarkersOnMap(places) {
    // fake the last update to be -10 ago, to force the filmstrip update
    lastUpdate = new Date().getTime() - 10000;
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

// Adds photos from the region to the filmstrip
function setFilmstripPhotos(results, status) {
    filmstrip.clearImages();
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            var place = results[i];
            placesSrv.getDetails(
                {reference: place.reference},
                function(place, status) {
                    if (status != google.maps.places.PlacesServiceStatus.OK) {
                        console.log("nophoto :(");
                        return;
                    }
                    if (place.photos) {
                        filmstrip.addImage(
                            place.photos[0].getUrl(
                                {maxHeight: 80, maxWidth:
                                 (window.innerWith / 10) - 10}
                            ), function() {
                                console.log("photoclick!!");
                            });
                    }
                }
            );
        }
    }
}

// Bias the initial map position to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
            geolocation = new google.maps.LatLng(
                position.coords.latitude, position.coords.longitude);
            if (map) {
                // fake the last update to be -10 ago, to force the
                // filmstrip update
                lastUpdate = new Date().getTime() - 10000;
                map.setCenter(geolocation);
                map.setZoom(8);
            }
        });
    }
}

// Get the detailed information of a place and show it in the infoWindow
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
            console.log(marker.getPosition().toString());
            infoWindow.open(map);
            infoWindow.setPosition(marker.getPosition());
            console.log(infoWindow.getPosition().toString());
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
