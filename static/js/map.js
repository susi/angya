var map;
var geoclocation = new google.maps.LatLng(0, 0);

function initialize() {
    geolocate();
    var mapOptions = {
        center: geoclocation,
        zoom: 5
    };
    map = new google.maps.Map(document.getElementById("map-canvas"),
                              mapOptions);
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

google.maps.event.addDomListener(window, 'load', initialize);
