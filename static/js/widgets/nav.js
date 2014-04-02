function LeftNavigation(parent, buttons) {
  var items = [];
  $.each(buttons, function( id, button ) {
      console.log('Adding button ' + button.name + ': ' + button.hint);
      items.push('<a href=\'' + button.url + '\' id="' + button.name +
                 '"><i></i><strong></strong><span>' + button.hint + '</span></a>' );
    });
  var nav = $("<nav>", {
    id: "map-nav",
    class: "gradual visible-nav",
    html: items.join('\n\t')
  });
  $(nav).appendTo(parent);

  $(nav).mouseenter(function() {
    if($(this).hasClass("hidden-nav")) {
      $(this).removeClass("hidden-nav").addClass("visible-nav");
      updateNotifications();
    }
  });
  closeNavigation();
}

// map navigation number notification content test
function updateNotifications(event){
    notiContent = $('#map-nav a strong');
    notiContent.each(function(){
	innerInfo = $(this).text();
	if (innerInfo===''){
	    $(this).css('display','none');
	}else{
	    $(this).css('display','block');
	}
    });
}

function hideNotifications(event){
    notiContent = $('#map-nav a strong');
    notiContent.each(function(){
	    innerInfo = $(this).text();
	    $(this).css('display','none');
    });
}

function closeNavigation() {
  $("#map-nav").removeClass("visible-nav").addClass("hidden-nav");
  hideNotifications();
  
}

function swapMapType() {
  currentType = map.getMapTypeId();
  if (currentType == google.maps.MapTypeId.ROADMAP) {
    map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    $('#map-nav #map-type strong').html('s');
  }
  else {
    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    $('#map-nav #map-type strong').html('m');
  }
}

function widgetHover() {
    widgetDiv = document.getElementById('login');
    if (widgetDiv.className.indexOf('inactive') != -1) {
        widgetDiv.className = 'widget active';
    }
    else {
        widgetDiv.className = 'widget inactive';
    }
}
