"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.rawFieldEquals = exports.notLike = exports.like = exports.default = void 0;
var _likeToRegexp = _interopRequireDefault(require("../../utils/fp/likeToRegexp"));
/* eslint-disable eqeqeq */
var between = function between(left, [lower, upper]) {
  return left >= lower && left <= upper;
};
var rawFieldEquals = function rawFieldEquals(left, right) {
  return left == right;
};
exports.rawFieldEquals = rawFieldEquals;
var rawFieldNotEquals = function rawFieldNotEquals(left, right) {
  return !(left == right);
};
var noNullComparisons = function noNullComparisons(operator) {
  return function (left, right) {
    // return false if any operand is null/undefined
    if (left == null || right == null) {
      return false;
    }
    return operator(left, right);
  };
};

// Same as `a > b`, but `5 > undefined` is also true
var weakGt = function weakGt(left, right) {
  return left > right || left != null && right == null;
};
var handleLikeValue = function handleLikeValue(v, defaultV) {
  return typeof v === 'string' ? v : defaultV;
};
var like = function like(left, right) {
  var leftV = handleLikeValue(left, '');
  return (0, _likeToRegexp.default)(right).test(leftV);
};
exports.like = like;
var notLike = function notLike(left, right) {
  // Mimic SQLite behaviour
  if (left === null) {
    return false;
  }
  var leftV = handleLikeValue(left, '');
  return !(0, _likeToRegexp.default)(right).test(leftV);
};
exports.notLike = notLike;
var oneOf = function oneOf(value, values) {
  return values.includes(value);
};
var notOneOf = function notOneOf(value, values) {
  return !values.includes(value);
};
var gt = function gt(a, b) {
  return a > b;
};
var gte = function gte(a, b) {
  return a >= b;
};
var lt = function lt(a, b) {
  return a < b;
};
var lte = function lte(a, b) {
  return a <= b;
};
var includes = function includes(a, b) {
  return typeof a === 'string' && a.includes(b);
};
var operators = {
  eq: rawFieldEquals,
  notEq: rawFieldNotEquals,
  gt: noNullComparisons(gt),
  gte: noNullComparisons(gte),
  weakGt: weakGt,
  lt: noNullComparisons(lt),
  lte: noNullComparisons(lte),
  oneOf: oneOf,
  notIn: noNullComparisons(notOneOf),
  between: between,
  like: like,
  notLike: notLike,
  includes: includes
};
var _default = operators;
exports.default = _default;