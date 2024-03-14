"use strict";

exports.__esModule = true;
exports.default = exports.censorValue = void 0;
var _fp = require("../utils/fp");
// beginning, end, length
var censorValue = function censorValue(value) {
  return "".concat(value.slice(0, 2), "***").concat(value.slice(-2), "(").concat(value.length, ")");
};
exports.censorValue = censorValue;
var shouldCensorKey = function shouldCensorKey(key) {
  return key !== 'id' && !key.endsWith('_id') && key !== '_status' && key !== '_changed';
};

// $FlowFixMe
var censorRaw = (0, _fp.mapObj)(function (value, key) {
  return shouldCensorKey(key) && typeof value === 'string' ? censorValue(value) : value;
});
var _default = censorRaw;
exports.default = _default;