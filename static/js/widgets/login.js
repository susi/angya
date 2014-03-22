// login variables
function LoginButton(div, position) {
  this.div = div;
  this.position = position;
  map.controls[google.maps.ControlPosition[this.position]].push(div);
}
