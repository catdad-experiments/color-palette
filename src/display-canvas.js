/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-canvas';

  register(NAME, function () {
    var context = this;

    function onImage(ev) {
      console.log('display image', ev);
    }

    context.events.on('new-image', onImage);

    return function destroy() {
      context.events.off('new-image', onImage);
    };
  });
}(window.registerModule));
