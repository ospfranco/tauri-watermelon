"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _reactNative = require("react-native");
var _randomId_v = _interopRequireDefault(require("./randomId_v2.native"));
var _fallback = _interopRequireDefault(require("./fallback"));
/* eslint-disable no-bitwise */
var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var randomNumbers = [];
var cur = 9999999;

// TODO: This is 3-5x slower than Math.random()-based implementation
// Should be migrated to JSI, or simply implemented fully in native
// (bridging is the bottleneck)
function nativeRandomId_v1() {
  var id = '';
  var len = 0;
  var v = 0;
  while (len < 16) {
    if (cur < 256) {
      v = randomNumbers[cur] >> 2;
      cur++;
      if (v < 62) {
        id += alphabet[v];
        len++;
      }
    } else {
      randomNumbers = _reactNative.NativeModules.WMDatabaseBridge.getRandomBytes(256);
      cur = 0;
    }
  }
  return id;
}
var nativeRandomId = function () {
  var _NativeModules$WMData, _NativeModules$WMData2;
  if ((_NativeModules$WMData = _reactNative.NativeModules.WMDatabaseBridge) !== null && _NativeModules$WMData !== void 0 && _NativeModules$WMData.getRandomIds) {
    return _randomId_v.default;
  } else if ((_NativeModules$WMData2 = _reactNative.NativeModules.WMDatabaseBridge) !== null && _NativeModules$WMData2 !== void 0 && _NativeModules$WMData2.getRandomBytes) {
    return nativeRandomId_v1;
  }
  return _fallback.default;
}();
var _default = nativeRandomId;
exports.default = _default;