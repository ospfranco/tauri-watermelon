"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _fp = require("../../utils/fp");
var _rx = require("../../utils/rx");
var failsafe = function failsafe(fallback = undefined) {
  return function (target, key, descriptor) {
    return (0, _extends2.default)({}, descriptor, {
      get: function get() {
        var value;
        // $FlowFixMe[object-this-reference]
        var unsafeThis = this;
        if ('value' in descriptor) {
          value = descriptor.value;
        } else if ('get' in descriptor) {
          value = descriptor.get.call(unsafeThis);
        } else if ('initializer' in descriptor) {
          value = descriptor.initializer.call(unsafeThis);
        }
        if (value && (0, _fp.isObj)(value)) {
          var originalFetch = value.fetch;
          var originalObserve = value.observe;
          if (typeof originalFetch === 'function') {
            value.fetch = function fetch(...args) {
              var result = originalFetch.apply(value, args);
              if ((0, _fp.isObj)(result) && typeof result.catch === 'function') {
                return result.catch(function () {
                  return fallback;
                });
              }
              return result;
            };
          }
          if (typeof originalObserve === 'function') {
            value.observe = function observe(...args) {
              var result = originalObserve.apply(value, args);
              if ((0, _fp.isObj)(result) && typeof result.pipe === 'function') {
                return result.pipe((0, _rx.catchError)(function () {
                  return (0, _rx.of)(fallback);
                }));
              }
              return result;
            };
          }
        }
        Object.defineProperty(unsafeThis, key, {
          value: value,
          enumerable: descriptor.enumerable
        });
        return value;
      }
    });
  };
};
var _default = failsafe;
exports.default = _default;