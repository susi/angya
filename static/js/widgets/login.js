// login variables
function LoginButton(div, position) {
  this.div = div;
  this.position = position;
  this.loginButton = $(div).find('#logInBut');
  console.log(this.loginButton);
  map.controls[google.maps.ControlPosition[this.position]].push(div);
  google.maps.event.addDomListener(this.loginButton[0], 'click', function(event) {
    console.log('login button pressed!');
    event.preventDefault();
    var loginBox = $('.logInBox');
    loginBox.fadeIn(600);
    // close box funcition
  });

  this.closeIcon = $(div).find('.closeIcon');
  google.maps.event.addDomListener(this.closeIcon[0], 'click', function(event) {
    console.log('login form closed');
    event.preventDefault();
    $(this).parent().fadeOut();
  });
}
