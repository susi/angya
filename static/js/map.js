var map;
var geoclocation = new google.maps.LatLng(0, 0);
var placesSrv; // Places service used by the search box.
var infoWindowContent; // The element which holds the current info window content
var infoWindow; // The InfoWindow object.

// Initializes the map app.
function initialize() {
    geolocate();
    var mapOptions = {
        center: geoclocation,
        zoom: 5
    };
    infoWindowContent = document.getElementById('info-content');
    map = new google.maps.Map(document.getElementById("map-canvas"),
                              mapOptions);
    infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    // Create the search box and link it to the UI element.
    var searchBoxInput = document.getElementById("search-box");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchBoxInput);
    var searchBox = new google.maps.places.SearchBox(searchBoxInput);
    placesSrv = new google.maps.places.PlacesService(map);

    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    var markers = [];
    google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();

        for (var i = 0, marker; marker = markers[i]; i++) {
            marker.setMap(null);
        }

        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
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

            markers.push(marker);
            bounds.extend(place.geometry.location);
            map.fitBounds(bounds);
        }
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
    });

}

// Bias the initial map position to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
            geolocation = new google.maps.LatLng(
                position.coords.latitude, position.coords.longitude);
            if (map) {
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
}

// Wait for the whole page to load before showin the map.
google.maps.event.addDomListener(window, 'load', initialize);

