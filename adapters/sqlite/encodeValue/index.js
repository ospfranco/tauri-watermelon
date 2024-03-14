"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = encodeValue;
var _sqlEscapeString = _interopRequireDefault(require("sql-escape-string"));
var _common = require("../../../utils/common");
// Note: SQLite doesn't support literal TRUE and FALSE; expects 1 or 0 instead
// It also doesn't encode strings the same way
// Also: catches invalid values (undefined, NaN) early
function encodeValue(value) {
  if (value === true) {
    return '1';
  } else if (value === false) {
    return '0';
  } else if (Number.isNaN(value)) {
    (0, _common.logError)('Passed NaN to query');
    return 'null';
  } else if (value === undefined) {
    (0, _common.logError)('Passed undefined to query');
    return 'null';
  } else if (value === null) {
    return 'null';
  } else if (typeof value === 'number') {
    return "".concat(value);
  } else if (typeof value === 'string') {
    // TODO: We shouldn't ever encode SQL values directly — use placeholders
    return (0, _sqlEscapeString.default)(value);
  }
  throw new Error('Invalid value to encode into query');
}