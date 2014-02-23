/** Binds a scope to a callback.
 *  In javascript the value of this is determined on call time. This function
 *  binds this at create time. See http://stackoverflow.com/questions/15356936
 */
function bind(scope, fn) {
   return function() {
      return fn.apply(scope, arguments);
   }
}

/**
 * This is the constructor for the Filmstrip class.
 * @class
 * @classdesc Uses panoramio to implement the film strip.
 * @param div - The container where to put the filmstrip.
 * @param photoSelectedCB - Called when a user click on a photo.
 */
function Filmstrip(div, photoSelectedCB) {
    this.div = div;
    this.className = "gradual;"
    // by default the filmstrip is hidden to a semitransparent triangle.
    this.div.style.position = "absolute";
    this.div.style.left = "0";
    this.div.style.bottom = "30px";
    this.div.style.overflow = "hidden";
    this.div.style.backgroundColor = "rgba(0, 0, 0, 0)";
    this.div.style.border = "50px solid transparent";
    this.div.style.borderLeft = "10px solid rgba(0, 0, 0, 0.5)";    
    this.div.style.height = "0px";
    this.div.style.width = "0px";

    // mousing over it will open the film strip.
    this.div.addEventListener("mouseover", bind(this, this.show), false);
    this.div.addEventListener("mouseout", bind(this, this.hide), false);

    // save the photoSelectedCB
    this.photoSelectedCB = photoSelectedCB;
    console.log(this);
}

/**
 * Updates the bounds of the filmstrip image source locations.
 * @param bounds - A google.maps.Bounds object of the bounds.
 */
Filmstrip.prototype.update = function(bounds) {
    console.log("Fetch panoimages");
    var sw = bounds.getSouthWest();
    var ne = bounds.getNorthEast();
    var panoRequestParams = {
        'rect': {'sw': {'lat': sw.lat(), 'lng': sw.lng()},
                 'ne': {'lat': ne.lat(), 'lng': ne.lng()}}
    };
    var panoRequest = new panoramio.PhotoRequest(panoRequestParams);
    var columns = Math.floor(window.innerWidth / 80);
    var panoOptions = {
        'width': window.innerWidth,
        'height': 100,
        'columns': columns,
        'rows': 1,
        'orientation': panoramio.PhotoListWidgetOptions.Orientation.HORIZONTAL,
        'disableDefaultEvents': [panoramio.events.EventType.PHOTO_CLICKED],
        'croppedPhotos': true};
    this.panoWidget =
        new panoramio.PhotoListWidget(this.div, panoRequest, panoOptions);
    this.panoWidget.enableNextArrow(true);
    this.panoWidget.enablePreviousArrow(true);
    panoramio.events.listen(this.panoWidget,
                            panoramio.events.EventType.PHOTO_CLICKED,
                            bind(this, this.photoClicked));
    this.panoWidget.setPosition(0);
};

/**
 * The click event handler. This captures the clickEvent and calls the
 * photoSelectedCB.
 */
Filmstrip.prototype.photoClicked = function(event) {
    var coordinates = event.getPhoto().getPosition();
    var loc = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    this.photoSelectedCB(loc);
    console.log('Photo "' + loc.toString() + '" was clicked');
};

/**
 * Hides the photostrip.
 */
Filmstrip.prototype.hide = function() {
    this.className = "gradual;"
    this.div.style.width = "0px";
    this.div.style.height = "0px";
    this.div.style.backgroundColor = "rgba(0, 0, 0, 0)";
    this.div.style.border = "50px solid transparent";
    this.div.style.borderLeft = "10px solid rgba(0, 0, 0, 0.5)";
};

/**
 * shows the photostrip.
 */
Filmstrip.prototype.show = function() {
    this.className = "gradual;"
    this.div.style.width = window.innerWidth + "px";
    this.div.style.height = "100px";
    this.div.style.backgroundColor = "black";
    this.div.style.borderWidth = "0px";
};

