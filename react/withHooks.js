"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = withHooks;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _helpers = require("./helpers");
function withHooks(hookTransformer) {
  return function (BaseComponent) {
    var factory = (0, _helpers.createFactory)(BaseComponent);
    var enhanced = function WithHooks(props) {
      var newProps = hookTransformer(props);
      return factory((0, _extends2.default)({}, props, newProps));
    };
    if (process.env.NODE_ENV !== 'production') {
      var baseName = BaseComponent.displayName || BaseComponent.name || 'anon';
      // $FlowFixMe
      enhanced.displayName = "withHooks[".concat(baseName, "]");
    }
    return enhanced;
  };
}