'use strict';
/**
 * RAVEN CLIENT MODULE
 * v1.1.1
 * @license
 * Released under MIT license
 * Copyright ...
 */
;(function() {
  // self
  const _self = typeof self == 'object' && self && self.Object === Object && self;
  // the global object
  const root = _self || Function('return this')();
  // skip if just exists
  if (!!root.raven) return console.log('RAVEN INSTALLED!');
  // exports
  const _exports = typeof exports == 'object' && exports && !exports.nodeType && exports;
  // module
  const _module = _exports && typeof module == 'object' && module && !module.nodeType && module;

  const _isFunction = (obj) => typeof obj == 'function' || false;

  let _Promise = function(cb) {
    setTimeout(() => cb(this.resolve, this.reject));
  }
  _Promise.prototype = {
    done: false,
    callback: null,
    then: (res, rej) => {
      this._resolve = res;
      this._reject = rej;
    },
    resolve: (data) => {
      if (this.done) return;
      this.done = true;
      if (_isFunction(this._resolve)) return this._resolve(data);
      console.warn('no resolve implemantation!');
    },
    reject: (err) => {
      if (this.done) return;
      this.done = true;
      if (_isFunction(this._reject)) return this._reject(err);
      console.warn('no reject implemantation!');
    }
  }
  const PRMSCTOR = (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) ? Promise : _Promise;

  let Deferred = function() {
    this.resolve = null;
    this.reject = null;
    this.promise = new PRMSCTOR((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  const _handlers = {};
  const _cache = {};
  const _state = {
    css: false
  };
  function _id() {
    const now = new Date();
    return now.getTime();
  }
  function _send(msg) {
    if (!raven.active) return console.warn('Undefined parent raven module!');
    root.parent.postMessage(msg, '*');
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
  function _checkCss(data) {
    if (!((data||{}).app||{}).css || _state.css) return;
    const style = document.createElement('style');
    const styleSheet = style.styleSheet||style.style;
    if (!!styleSheet) {
      styleSheet.cssText = data.app.css;
    } else {
      style.appendChild(document.createTextNode(data.app.css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
    _state.css = true;
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
  function _checkUrl() {
    const loc = window.location;
    if (_state.url !== loc.href && _isFunction(raven.getPosition)) {
      _state.url = loc.href;
      const position = raven.getPosition(loc);
      if (position) _send({ type: 'position', data: position });
    }
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
    active: (root.parent !== root),
    state: (data, o) => _deferred('state', data, o),
    send: (msg) => _send(msg),
    subscribe: (fn, filter) => _addHandler(fn, filter),
    unsubscribe: (fn) => _removeHandler(fn)
  };

  root.addEventListener('message', (e) => {
    if ((e.data||{}).owner === raven.constants.owner) {
      // console.log('MESSAGE FROM RAVEN CONTAINER', e.data);
      _checkCss(e.data);
      _evalDefered(e.data);
      Object.keys(_handlers).forEach(k => (!_handlers[k].filter || !!_handlers[k].filter(e.data)) ? _handlers[k].callback(e.data) : null);
    }
  });

  if (raven.active) {
    // html element has "raven" class inside raven
    document.querySelector('html').classList.add(raven.constants.owner);
    // check url changes
    setInterval(() => _checkUrl(), 250);
  }

  if (_module) {
    // Export for Node.js.
    (_module.exports = raven).raven = raven;
    // Export for CommonJS support.
    _exports.raven = raven;
  } else {
    // Export to the global object.
    root.raven = raven;
  }

}.call(this));
