'use strict';
/**
 * RAVEN CLIENT MODULE (ES5)
 * v1.1.1
 * @license
 * Released under MIT license
 * Copyright ...
 */
;(function() {
    // self
    var _self = typeof self == 'object' && self && self.Object === Object && self;
    // the global object
    var root = _self || Function('return this')();
    // skip if just exists
    if (!!root.raven) return console.log('RAVEN INSTALLED!');
    // exports
    var _exports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    // module
    var _module = _exports && typeof module == 'object' && module && !module.nodeType && module;

    function _isFunction(obj) {
        return typeof obj == 'function' || false;
    }

    var _Promise = function (cb) {
        var self = this;
        this.done = false;
        this._resolve = null;
        this._reject = null;
        setTimeout(function () {
            return cb(self.resolve, self.reject);
        });
    }
    _Promise.prototype.then = function (res, rej) {
        this._resolve = res;
        this._reject = rej;
    }
    _Promise.prototype.resolve = function (data) {
        var self = this.promise || this;
        if (self.done) return;
        self.done = true;
        if (_isFunction(self._resolve)) return self._resolve(data);
        console.warn('no resolve implemantation!');
    }
    _Promise.prototype.reject = function (err) {
        var self = this.promise || this;
        if (self.done) return;
        self.done = true;
        if (_isFunction(self._reject)) return self._reject(err);
        console.warn('no reject implemantation!');
    }

    var PRMSCTOR = (typeof Promise !== "undefined" && Promise.toString().indexOf("[native code]") !== -1) ? Promise : _Promise;

    var Deferred = function () {
        this.resolve = null;
        this.reject = null;
        var self = this;
        this.promise = new PRMSCTOR(function (resolve, reject) {
            self.resolve = resolve;
            self.reject = reject;
        });
    }

    var _handlers = {};
    var _cache = {};
    var _state = {
        css: false,
        url: undefined
    };

    function _id() {
        var now = new Date();
        return now.getTime();
    }

    function _send(msg) {
        if (!raven.active) return console.warn('Undefined parent raven module!');
        root.parent.postMessage(msg, raven.parentOrigin);
    }

    function _checkOutOfTime() {
        var now = (new Date()).getTime();
        Object.keys(_cache).forEach(function (k) {
            if (_cache[k].timeout + _cache[k].id > now) {
                _cache[k].reject('Request out of time!');
                delete _cache[k];
            }
        });
    }

    function _checkCss(data) {
        if (!((data || {}).app || {}).css || _state.css) return;
        var style = document.createElement('style');
        var styleSheet = style.styleSheet||style.style;
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
        var type = (action || '') + '';
        _checkOutOfTime();
        var request = {
            id: o.unique ? type : _id(),
            type: type,
            data: data,
            timeout: o.timeout || raven.constants.tmeout
        };
        if (!!_cache[request.id]) return _cache[request.id].promise;
        _send(request);
        _cache[request.id] = new Deferred();
        return _cache[request.id].promise;
    }

    function _evalDefered(msg) {
        _checkOutOfTime();
        var promise = _cache[msg.id || 'none'];
        if (promise) {
            msg.error ? promise.reject(msg.error) : promise.resolve(msg);
            delete _cache[msg.id];
        }
    }

    function _findHandler(finder) {
        var keys = Object.keys(_handlers);
        for (var i = 0; i < keys.length; i++) {
            if (!!finder(_handlers[keys[i]])) return keys[i];
        }
    }

    function _addHandler(fn, filter) {
        var xh = _findHandler(function (h) {
            return h.callback === fn;
        });
        if (!xh) _handlers[_id()] = {callback: fn, filter: filter};
    }

    function _removeHandler(fn) {
        var xh = _findHandler(function (h) {
            return h.callback === fn;
        });
        if (xh) delete _handlers[xh];
    }

    function _checkUrl() {
        var loc = window.location;
        if (_state.url !== loc.href && _isFunction(raven.getPosition)) {
            _state.url = loc.href;
            var position = raven.getPosition(loc);
            if (position) _send({ type: 'position', data: position });
        }
    }

    var raven = {
        constants: {
            tmeout: 3000,
            owner: 'raven',
            broadcast: 'RAVEN-CONTAINER-MESSAGE',
            action: {
                menu: 'menu-action'
            }
        },
        parentOrigin: '*',
        active: (root.parent !== root),
        state: function (data, o) {
            return _deferred('state', data, o);
        },
        send: function (msg) {
            return _send(msg);
        },
        subscribe: function (fn, filter) {
            return _addHandler(fn, filter);
        },
        unsubscribe: function (fn) {
            return _removeHandler(fn);
        }
    };

    root.addEventListener('message', function (e) {
        if ((e.data || {}).owner === raven.constants.owner) {
            // console.log('MESSAGE FROM RAVEN CONTAINER', e.data);
            _checkCss(e.data);
            _evalDefered(e.data);
            Object.keys(_handlers).forEach(function (k) {
                if (!_handlers[k].filter || !!_handlers[k].filter(e.data)) {
                    _handlers[k].callback(e.data);
                }
            });
        }
    });

    if (raven.active) {
        // html element has "raven" class inside raven
        document.querySelector('html').classList.add(raven.constants.owner);
        // check url changes
        setInterval(function () {
            _checkUrl()
        }, 250);
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
