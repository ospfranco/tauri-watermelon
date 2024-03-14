"use strict";

exports.__esModule = true;
exports.default = isObj;
function isObj(maybeObject) {
  return maybeObject !== null && typeof maybeObject === 'object' && !Array.isArray(maybeObject);
}