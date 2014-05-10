function Infocard(parent) {
  this.div = $('<div>', {
    id: "infocard",
    class: "gradual minimized"
  })
  .mouseenter(this, function(e) {
    e.data.open();
  })
  .click(this, function(e) {
    e.data.close();
  })
  .css('right', '-280px')
  .appendTo(parent);
  this.header = $('<h2>').appendTo(this.div);
  this.body = $('<p>').appendTo(this.div);
}

Infocard.prototype.open = function()
{
  $(this.div).css('right','0px');
};

Infocard.prototype.close = function()
{
  $(this.div).css('right', ((this.div.width()+30) * -1) + 'px');
};

Infocard.prototype.setHeader = function(newHeader)
{
  this.header.html(newHeader);
  return this;
}

Infocard.prototype.setContents = function(newBody)
{
  this.body.html(newBody);
  return this;
}

Infocard.prototype.addContents = function(moreContent)
{
  this.body.append(moreContent);
};

Infocard.prototype.resize = function(width, height)
{
  this.div.width(width).height(height);
}

// The infobox is a subcalss of the OverlayView
// https://developers.google.com/maps/documentation/javascript/customoverlays
Infobox.prototype = new google.maps.OverlayView();
function Infobox(map, anchor, header, body)
{
    // Initialize all properties.
    this.map = map;
    this.anchor = anchor; // google.maps.LatLng
    // The header and contents of the infowindow
    this.header = header;
    this.body = body;

    // Define a property to hold the div containter of the Infobox.
    // We'll actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);
}

Infobox.prototype.onAdd = function()
{
    var div = document.createElement('div');
    div.className = 'infobox';

    // Create the h4 element and attach it to the div.
    var h4 = document.createElement('h4');
    h4.innerHTML = this.header;
    div.appendChild(h4);

    // Create the p element and attach it to the div.
    var p = document.createElement('p');
    p.innerHTML = this.body;
    div.appendChild(p);

    this.div = div;

    // Add the element to the "flaotPane" pane.
    // We use the floatPane so that the Infobox is over the markers,
    // just like an InfoWindow
    var panes = this.getPanes();
    panes.floatPane.appendChild(div);
};

Infobox.prototype.draw = function()
{
    // retrieve the projection from the overlay, so that we can calculate the positioning
    // of the upper left corner of the infowindow
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var pt = overlayProjection.fromLatLngToDivPixel(this.anchor);

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div;
    div.style.left = pt.x + 'px';
    div.style.top = pt.y + 'px';
};

Infobox.prototype.onRemove = function() {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
};

Infobox.prototype.open = function()
{
    this.div.style.visibility = 'hidden';
};

Infobox.prototype.close = function()
{
    this.div.style.visibility = 'visible';
};

Infobox.prototype.setHeader = function(newHeader)
{
    this.header.html(newHeader);
    this.draw();
}

Infobox.prototype.setContents = function(newBody)
{
    this.body.html(newBody);
    this.draw();
}

Infobox.prototype.addContents = function(moreContent)
{
    this.body.append(moreContent);
    this.draw();
};

Infobox.prototype.move = function(newLocation)
{
    this.anchor = newLocation;
    this.draw();
};
