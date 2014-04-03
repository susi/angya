var map;
var geoclocation = new google.maps.LatLng(0, 0);
var infoWindowContent; // The element which holds the current info window content
var infoWindow; // The InfoWindow object.
var markers = [];
var lastUpdate;

$(document).ready(function(){
  geolocate();

	// =========== variables ===============
  var mapOptions = {
    center: geoclocation,
    mapTypeControl:false,
    zoom: 5
  };

  // The map
  map = new google.maps.Map(document.getElementById("map-canvas"),
                            mapOptions);

  // Infowindow
  infoWindowContent = document.getElementById('info-content');
  infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      map: map
  });
  infoWindow.close();

	// =========== functions ===============
  // get the user's location

  loadWidgets();
});


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

