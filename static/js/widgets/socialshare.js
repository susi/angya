// login variables
function SocialShare(div, position) {
  this.div = div;
  this.position = position;
  map.controls[google.maps.ControlPosition[this.position]].push(div);
}

$(window).on('hashchange', function() {
    toggleSacialLinks();
});

function toggleSacialLinks()
{
    console.log(window.location);
    if(window.location.hash) {
        console.log('have hash, update links to point to: '+window.location.href);
        var map_url_encoded = encodeURIComponent(window.location.href);
        $('#social #facebook').attr(
            'href', 'https://www.facebook.com/sharer/sharer.php?u=' +
            map_url_encoded);
        $('#social #twitter').attr(
            'href',
            'https://twitter.com/home?status='+
            'My%20trip%20in%20angya%20the%20travel%20planner:%20' +
            map_url_encoded);
        $('#social #googleplus').attr(
            'href', 'https://plus.google.com/share?url=' +
            map_url_encoded);
        $('#socialmask').addClass('disabled');
    }
    else {
        console.log('No hash, means no social sharing');
        $('#socialmask').removeClass('disabled');
    }
}
