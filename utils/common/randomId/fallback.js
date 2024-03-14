"use strict";

exports.__esModule = true;
exports.default = fallbackRandomId;
var alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function fallbackRandomId() {
  var id = '';
  var v = 0;
  for (var i = 0; i < 16; i += 1) {
    v = Math.floor(Math.random() * 62);
    id += alphabet[v % 62];
  }
  return id;
}