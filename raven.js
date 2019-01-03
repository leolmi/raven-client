'use strict';
/**
    RAVEN client module

    --> send or/and retrieve state message:
    raven.state([data [, options]])
      .then(
        (response) => {...},
        (err) => {...});
  

        // data (optional):
        // send data to raven container
        {
          name: 'appname',  // application name
          version: '1.0.0', // application version
          menu: [....],     // application menu structure changes
          error: err        // error to parent
        }

        // options (optional):
        {
          unique: false,    // if true run one only message for type until response
          timeout: 3000     // request timeout
        }

        // response
        {
          token: 'xxxx',     // token
          data: {...},       // data object
          action: 'ation',   // action name (see constants.)
          type: string;
        }

    
    --> events handler:
    raven.subscribe(
      (message) => any            // message handler
      [, (data) => boolean]);     // (optional) message filter

*/
(function(global) {
  let Deferred = function() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
  Deferred.prototype = {
    resolve: null,
    reject: null
  }
  const _handlers = {};
  const _cache = {};
  function _id() {
    const now = new Date();
    return now.getTime();
  }
  function _send(msg) {
    if (!raven.active) return console.warn('Undefined parent raven module!');
    global.parent.postMessage(msg, '*');
  }
  function _checkOutOfTime() {
    const now = (new Date()).getTime();
    Object.keys(_cache).forEach(k => {
      if (_cache[k].timeout+_cache[k].id > now) {
        _cache[k].reject('Request out of time!');
        delete _cache[k];
      }
    });
  }
  function _deferred(action, data, o) {
    o = o || {};
    const type = (action||'')+'';
    _checkOutOfTime();
    const request = {
      id: o.unique ? type : _id(),
      type: type,
      data: data, 
      timeout: o.timeout||raven.constants.tmeout
    };
    if (!!_cache[request.id]) return _cache[request.id].promise;
    _send(request);
    _cache[request.id] = new Deferred();
    return _cache[request.id].promise;
  }
  function _evalDefered(msg) {
    _checkOutOfTime();
    const promise = _cache[msg.id||'none'];
    if (promise) {
      msg.error ? promise.reject(msg.error) : promise.resolve(msg);
      delete _cache[msg.id];
    }
  }
  function _findHandler(finder) {
    const keys = Object.keys(_handlers);
    for (let i=0; i<keys.length; i++) {
      if (finder(_handlers[keys[i]])) return keys[i];
    }
  }
  function _addHandler(fn, filter) {
    const xh = _findHandler(h => h.callback === fn);
    if (!xh) _handlers[_id()] = {callback:fn, filter:filter};
  }
  function _removeHandler(fn) {
    const xh = _findHandler(h => h.callback === fn);
    if (xh) delete _handlers[xh];
  }
  const raven = {
    constants: {
      tmeout: 3000,
      owner: 'raven',
      broadcast: 'RAVEN-CONTAINER-MESSAGE',
      action: {
        menu: 'menu-action'
      }
    },
    active: (global.parent !== global),
    state: (data, o) => _deferred('state', data, o),
    subscribe: (fn, filter) => _addHandler(fn, filter),
    unsubscribe: (fn) => _removeHandler(fn)
  };

  global.addEventListener('message', (e) => {
    if ((e.data||{}).owner === raven.constants.owner) {
      // console.log('MESSAGE FROM RAVEN CONTAINER', e.data);
      _evalDefered(e.data);
      Object.keys(_handlers).forEach(k => (!_handlers[k].filter || !!_handlers[k].filter(e.data)) ? _handlers[k].callback(e.data) : null);
    }
  });

  if (raven.active) document.querySelector('html').classList.add(raven.constants.owner);

  global.raven = raven;
})(this);
