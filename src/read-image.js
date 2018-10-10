/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'read-image';
  var sourceInput = document.querySelector('#source');

  register(NAME, function () {
    var context = this;

    function onFile(ev) {
      var input = ev.target;

      var reader = new FileReader();

      reader.onload = function () {
        var dataUrl = reader.result;

        context.events.emit('new-image', { dataUrl: dataUrl });
      };

      reader.readAsDataURL(input.files[0]);
    }

    sourceInput.addEventListener('change', onFile);

    return function destroy() {
      sourceInput.addEventListener('change', onFile);
    };
  });
}(window.registerModule));
