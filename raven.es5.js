'use strict';
/**
 * RAVEN CLIENT MODULE (ES5)
 * v1.0.8
 * @license
 * Released under MIT license
 * Copyright ...
 *
 * --> send or/and retrieve state message:
 * raven.state([data [, options]])
 *   .then(
 *      function(response) {...},
 *      function(err) {...});
 *
 *      // data (optional):
 *      // send data to raven container
 *      {
 *        name: 'appname',  // application name
 *        version: '1.0.0', // application version
 *        menu: [....],     // application menu structure changes
 *        error: err        // error to parent
 *      }
 *
 *      // options (optional):
 *      {
 *        unique: false,    // if true run one only message for type until response
 *        timeout: 3000     // request timeout
 *      }
 *
 *      // response
 *      {
 *        token: 'xxxx',     // token
 *        data: {...},       // data object
 *        action: 'ation',   // action name (see constants.)
 *        type: string;
 *      }
 *
 * --> events handler:
 * raven.subscribe(
 *    function(message) { ... }                         // message handler
 *    [, function(data) { return boolean; }]);      // (optional) message filter
 *
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

    function _isFunction(obj) {
        return typeof obj == 'function' || false;
    }

    let _Promise = function(cb) {
        const self = this;
        this.done = false;
        this._resolve = null;
        this._reject = null;
        setTimeout(function() { return cb(self.resolve, self.reject); });
    }
    _Promise.prototype.then = function(res, rej) {
        this._resolve = res;
        this._reject = rej;
    }
    _Promise.prototype.resolve = function(data) {
        if (this.done) return;
        this.done = true;
        if (_isFunction(this._resolve)) return this._resolve(data);
        console.warn('no resolve implemantation!');
    }
    _Promise.prototype.reject = function(err) {
        if (this.done) return;
        this.done = true;
        if (_isFunction(this._reject)) return this._reject(err);
        console.warn('no reject implemantation!');
    }

    const PRMSCTOR = (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) ? Promise : _Promise;

    let Deferred = function() {
        this.resolve = null;
        this.reject = null;
        const self = this;
        this.promise = new PRMSCTOR(function(resolve, reject) {
            self.resolve = resolve;
            self.reject = reject;
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
        Object.keys(_cache).forEach(function(k) {
            if (_cache[k].timeout+_cache[k].id > now) {
                _cache[k].reject('Request out of time!');
                delete _cache[k];
            }
        });
    }
    function _checkCss(data) {
        if (!((data||{}).app||{}).css || _state.css) return;
        const style = document.createElement('style');
        if (!!style.styleSheet) {
            style.styleSheet.cssText = data.app.css;
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
            if (!!finder(_handlers[keys[i]])) return keys[i];
        }
    }
    function _addHandler(fn, filter) {
        const xh = _findHandler(function(h) { return h.callback === fn; });
        if (!xh) _handlers[_id()] = { callback: fn, filter: filter };
    }
    function _removeHandler(fn) {
        const xh = _findHandler(function(h) { return h.callback === fn; });
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
        active: (root.parent !== root),
        state: function(data, o) { return _deferred('state', data, o); },
        send: function(msg) { return _send(msg); },
        subscribe: function(fn, filter) { return _addHandler(fn, filter); },
        unsubscribe: function(fn) { return _removeHandler(fn); }
    };

    root.addEventListener('message', function(e) {
        if ((e.data||{}).owner === raven.constants.owner) {
            // console.log('MESSAGE FROM RAVEN CONTAINER', e.data);
            _checkCss(e.data);
            _evalDefered(e.data);
            Object.keys(_handlers).forEach(function(k)  {
                if (!_handlers[k].filter || !!_handlers[k].filter(e.data)) {
                    _handlers[k].callback(e.data);
                }
            });
        }
    });

    if (raven.active) document.querySelector('html').classList.add(raven.constants.owner);

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
