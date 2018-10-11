/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-canvas';
  var POSTERIZE_LEVEL = 4;
  var canvas = document.querySelector('#display');

  // originally written by Nick Stark
  // https://codepen.io/nickstark/pen/OVmoxN
  function posterize(imgData, levels) {
    var numLevels = parseInt(levels,10)||1;
    var data = imgData.data;

    numLevels = Math.max(2,Math.min(256,numLevels));

    var numAreas = 256 / numLevels;
    var numValues = 255 / (numLevels-1);

    var w = imgData.width;
    var h = imgData.height;
    var w4 = w*4;
    var y = h;

    do {
      var offsetY = (y-1)*w4;
      var x = w;
      do {
        var offset = offsetY + (x-1)*4;

        var r = numValues * ((data[offset] / numAreas)>>0);
        var g = numValues * ((data[offset+1] / numAreas)>>0);
        var b = numValues * ((data[offset+2] / numAreas)>>0);

        if (r > 255) r = 255;
        if (g > 255) g = 255;
        if (b > 255) b = 255;

        data[offset] = r;
        data[offset+1] = g;
        data[offset+2] = b;

      } while (--x);
    } while (--y);

    return imgData;
  }

  function hexToken(c) {
    return ('0' + c.toString(16)).slice(-2);
  }

  function hexColor(r, g, b) {
    return '#' + hexToken(r) + hexToken(g) + hexToken(b);
  }

  function countColors(imgData) {
    var values = imgData.data;
    var colors = [];
    var rgb;

    for (var i = 0, l = values.length; i < l; i += 4) {
      colors.push(hexColor(values[i], values[i+1], values[i+2]));
    }

    return colors.reduce(function (memo, color) {
      if (memo[color]) {
        memo[color] += 1;
      } else {
        memo[color] = 1;
      }

      return memo;
    }, {});
  }

  register(NAME, function () {
    var context = this;
    var ctx = canvas.getContext('2d');

    function onImage(ev) {
      var img = new Image();
      img.src = ev.dataUrl;

      img.onload = function () {
        var w = img.naturalWidth;
        var h = img.naturalHeight;

        canvas.width = w;
        canvas.height = h;

        ctx.filter = 'blur(30px)';
        ctx.drawImage(img, 0, 0);

        var imgData = ctx.getImageData(0, 0, w, h);
        var posterizedData = posterize(imgData, POSTERIZE_LEVEL);
        var colors = countColors(posterizedData);
        ctx.putImageData(posterizedData, 0, 0);

        console.log(colors);
      };
    }

    context.events.on('new-image', onImage);

    return function destroy() {
      context.events.off('new-image', onImage);
    };
  });
}(window.registerModule));
