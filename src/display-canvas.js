/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-canvas';
  var canvas = document.querySelector('#display');

  register(NAME, function () {
    var context = this;
    var ctx = canvas.getContext('2d');

    function onImage(ev) {
      var img = new Image();
      img.src = ev.dataUrl;

      img.onload = function () {
        ctx.drawImage(img, 0, 0);
      };
    }

    context.events.on('new-image', onImage);

    return function destroy() {
      context.events.off('new-image', onImage);
    };
  });
}(window.registerModule));
