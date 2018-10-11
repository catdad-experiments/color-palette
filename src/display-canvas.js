/* jshint browser: true */
/* global Promise, StackBlur */

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
    var s = c.toString(16);
    return s.length === 2 ? s : '0' + s;
  }

  function hexColor(r, g, b) {
    return '#' + hexToken(r) + hexToken(g) + hexToken(b);
  }

  function countColors(imgData) {
    var values = imgData.data;
    var colors = [];
    var rgb;

    console.time('compute');
    for (var i = 0, l = values.length; i < l; i += 4) {
      colors.push(hexColor(values[i], values[i+1], values[i+2]));
    }
    console.timeEnd('compute');

    return colors.reduce(function (memo, color) {
      if (memo[color]) {
        memo[color] += 1;
      } else {
        memo[color] = 1;
      }

      return memo;
    }, {});
  }

  function topColors(obj) {
    obj['#ffffff'] = 0;
    obj['#000000'] = 0;

    return Object.keys(obj).sort(function (a, b) {
      return obj[b] - obj[a];
    }).slice(0, 4);
  }

  register(NAME, function () {
    var context = this;
    var ctx = canvas.getContext('2d');

    function blurReduce(elem, sx, sy, sw, sh, dx, dy, dw, dh) {
      ctx.filter = 'blur(20px)';
      ctx.drawImage(elem, sx, sy, sw, sh, dx, dy, dw, dh);

      console.time('read data');
      var imgData = ctx.getImageData(0, 0, dw, dh);
      console.timeEnd('read data');

      console.time('reduce colors');
      var posterizedData = posterize(imgData, POSTERIZE_LEVEL);
      console.timeEnd('reduce colors');

      console.time('final draw');
      ctx.putImageData(posterizedData, 0, 0);
      console.timeEnd('final draw');
    }

    function stackBlurReduce(img, width, height, w, h) {
      // draw resized image, for speed... we don't need high-res
      ctx.drawImage(img, 0, 0, width, height, 0, 0, w, h);

      StackBlur.canvasRGB(canvas, 0, 0, w, h, 100);

      console.time('read data');
      var imgData = ctx.getImageData(0, 0, w, h);
      console.timeEnd('read data');

      console.time('reduce colors');
      var posterizedData = posterize(imgData, POSTERIZE_LEVEL);
      console.timeEnd('reduce colors');

      console.time('final draw');
      ctx.putImageData(posterizedData, 0, 0);
      console.timeEnd('final draw');
    }

    function onImage(ev) {
      var img = new Image();
      img.src = ev.dataUrl;

      img.onload = function () {
        var width = img.naturalWidth;
        var height = img.naturalHeight;

        var w = 600;
        var h = height * 600 / width;

        canvas.width = w;
        canvas.height = h;

        stackBlurReduce(img, width, height, w, h);
//        blurReduce(img, 0, 0, width, height, 0, 0, w, h);
//        blurReduce(canvas, 0, 0, w, h, 0, 0, w, h);

        var o = 50;
        var imgData = ctx.getImageData(o, o, w - o, h - o);
        var colors = countColors(imgData);

        console.log(colors);
        console.log(Object.keys(colors).length, 'colors found');
        console.log(topColors(colors));

        var top = topColors(colors);

        console.log(
          '%c   %c   %c   %c   ',
          'font-size: 40px; background:' + top[0],
          'font-size: 40px; background:' + top[1],
          'font-size: 40px; background:' + top[2],
          'font-size: 40px; background:' + top[3]
        );
      };
    }

    context.events.on('new-image', onImage);

    return function destroy() {
      context.events.off('new-image', onImage);
    };
  });
}(window.registerModule));
