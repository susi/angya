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

Infocard.prototype.resize = function(width, height)
{
  this.div.width(width).height(height);
}
