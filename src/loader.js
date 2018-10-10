/* jshint browser: true, -W069 */
/* global Promise */

window.addEventListener('load', function () {
  var header = document.querySelector('header');
  var headerContainer = header.querySelector('.header-container');
  var prompt = document.querySelector('#prompt');

  function clearPrompt() {
    prompt.classList.add('hide');
    headerContainer.classList.remove('error');
  }

  function showPrompt(message, type) {
    if (typeof message === 'string') {
      message = [message];
    }

    // clean the prompt
    prompt.innerHTML = '';

    message.forEach(function (text) {
      var paragraph = document.createElement('p');
      paragraph.appendChild(document.createTextNode(text.toString()));

      prompt.appendChild(paragraph);
    });

    prompt.classList.remove('hide');

    if (type === 'error') {
      headerContainer.classList.add('error');
    } else {
      headerContainer.classList.remove('error');
    }
  }

  function onMissingFeatures(missing) {
    showPrompt([
      'It seems your browser is not supported. The following features are missing:',
      missing
    ], 'error');
  }

  function onError(err) {
    /* jshint -W117 */
    console.error(err);
    /* jshint +W117 */

    showPrompt([
      'An error occured:',
      err.message || err
    ], 'error');
  }

  // detect missing features in the browser
  var missingFeatures = [
    'navigator.mediaDevices', 'Promise'
  ].filter(function (name) {
    return !name.split('.').reduce(function (obj, path) {
      return (obj || {})[path];
    }, window);
  });

  if (missingFeatures.length) {
    return onMissingFeatures(missingFeatures.join(', '));
  }

  // ------------------------------------------------
  // we've validated modules... we can use fancy
  // things now
  // ------------------------------------------------

  // super simple module loader, because I don't want to
  // deal with build for this demo
  function loadScript(name) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');

      script.onload = function () {
        resolve();
      };

      script.onerror = function (err) {
        reject(new Error(name + ' failed to load'));
      };

      script.src = name;

      document.head.appendChild(script);
    });
  }

  var context = {
    onError: onError
  };

  var modules = {};

  window.registerModule = function (name, module) {
    // this module loader is stupid, it can only work with
    // functions... and just for fun, we'll say that all
    // the functions return promises
    modules[name] = module.bind(context);
  };

  // load all the modules from the server directly
  Promise.all([
    loadScript('src/event-emitter.js'),
    loadScript('src/read-image.js')
  ]).then(function () {
    // set up a global event emitter
    context.events = modules['event-emitter']();

    var readImageDestroy = modules['read-image']();

    context.events.on('error', function (err) {
      onError(err);

      readImageDestroy();
    });

    context.events.on('warn', function (err) {
      onError(err);

      setTimeout(function () {
        clearPrompt();
      }, 8 * 1000);
    });
  }).catch(function catchErr(err) {
    if (context.events) {
      context.events.emit('error', err);
      return onError(err);
    }

    if (modules['event-emitter']) {
      context.events = modules['event-emitter']();
      return catchErr(err);
    }

    onError(err);
  });
});
