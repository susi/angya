/**
  * This fie loads the widgets and contains some helper functions common to
  * all widgets.
  */
// The loginButton
var loginButton;
// The left navigation bar
var nav;
// The search form
var search;
var infocard;
var tripmanager;
var socialshare;

function loadWidgets() {
    $.getJSON( "/widgets/socialshare", function( widget ) {
        var div = document.createElement('div');
        div.innerHTML = widget.html;
        loadCSSFile(widget.css);
        $.getScript(widget.js)
            .done(function(script, textStatus) {
                socialshare = new SocialShare(div, widget.position);
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("socialshare.js failed to load.");
                console.log(exception.stack);
                console.log(exception.message);
            });
    });

    $.getJSON( "/widgets/nav", function( widget ) {
        loadCSSFile(widget.css);
        $.getScript(widget.js)
            .done(function(script, textStatus) {
                nav = new Navigation($(document.body), widget.buttons);
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("Navigation triggered ajaxError handler.");
                console.log(exception.stack);
                console.log(exception.message);
            });
    });

    $.getJSON( "/widgets/infocard", function( widget ) {
        loadCSSFile(widget.css);
        $.getScript(widget.js)
            .done(function(script, textStatus) {
                infocard = new Infocard($(document.body));
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("infocard triggered ajaxError handler.");
                console.log(exception.stack);
                console.log(exception.message);
            });
    });

    $.getJSON( "/widgets/login", function( widget ) {
        var div = document.createElement('div');
        div.innerHTML = widget.html;
        loadCSSFile(widget.css);
        $.getScript(widget.js)
            .done(function(script, textStatus) {
                loginButton = new LoginButton(div, widget.position);
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("Login triggered ajaxError handler.");
                console.log(exception.stack);
                console.log(exception.message);
            });
    });

    $.getJSON( "/widgets/search", function( widget ) {
        var div = document.createElement('div');
        div.innerHTML = widget.html;
        div.className = 'search';
        loadCSSFile(widget.css);
        $.getScript(widget.js)
            .done(function(script, textStatus) {
                search = new Search(map, div, widget.position);
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("Search triggered ajaxError handler.");
                console.log(exception.stack);
                console.log(exception.message);
            });
    });

    $.getJSON( "/widgets/timeline", function( widget ) {
        loadCSSFile(widget.css);
        $.getScript(widget.js)
            .done(function(script, textStatus) {
                tripmanager = new TripManager(
                    $(document.body), infocard, widget.trips);
            })
            .fail(function(jqxhr, settings, exception) {
                console.log("Timeline triggered ajaxError handler.");
                console.log(exception.stack);
                console.log(exception.message);
            });
    });
}


function loadCSSFile(url) {
    $("<link>", {
        rel:  "stylesheet",
        type: "text/css",
        href: url
    }).appendTo("head");
}
