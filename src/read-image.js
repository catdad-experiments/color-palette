/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'read-image';
  var container = document.querySelector('#photos');

  register(NAME, function () {
    var context = this;

    var sourceInput = document.querySelector('#source');

    function onFile(ev) {
      var input = ev.target;

      var reader = new FileReader();

      reader.onload = function () {
        var dataUrl = reader.result;
      };

      reader.readAsDataURL(input.files[0]);
    }

    sourceInput.addEventListener('change', onFile);

    return function destroy() {
      sourceInput.addEventListener('change', onFile);
    };
  });
}(window.registerModule));
