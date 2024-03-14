"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getDispatcherType = getDispatcherType;
exports.makeDispatcher = void 0;
var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));
var _reactNative = require("react-native");
var _common = require("../../../utils/common");
var _Result = require("../../../utils/fp/Result");
/* eslint-disable global-require */
var {
  WMDatabaseBridge: WMDatabaseBridge
} = _reactNative.NativeModules;
var SqliteNativeModulesDispatcher = /*#__PURE__*/function () {
  function SqliteNativeModulesDispatcher(tag, bridge, {
    experimentalUnsafeNativeReuse: experimentalUnsafeNativeReuse
  }) {
    this._tag = tag;
    this._bridge = bridge;
    this._unsafeNativeReuse = experimentalUnsafeNativeReuse;
    if (process.env.NODE_ENV !== 'production') {
      (0, _common.invariant)(this._bridge, "NativeModules.WMDatabaseBridge is not defined! This means that you haven't properly linked WatermelonDB native module. Refer to docs for instructions about installation (and the changelog if this happened after an upgrade).");
      (0, _common.invariant)(_reactNative.Platform.OS !== 'windows', 'Windows is only supported via JSI. Pass { jsi: true } to SQLiteAdapter constructor.');
    }
  }
  var _proto = SqliteNativeModulesDispatcher.prototype;
  _proto.call = function call(name, _args, callback) {
    var _this$_bridge;
    var methodName = name;
    var args = _args;
    if (methodName === 'batch' && this._bridge.batchJSON) {
      methodName = 'batchJSON';
      args = [JSON.stringify(args[0])];
    } else if (['initialize', 'setUpWithSchema', 'setUpWithMigrations'].includes(methodName) && _reactNative.Platform.OS === 'android') {
      // FIXME: Hacky, refactor once native reuse isn't an "unsafe experimental" option
      args.push(this._unsafeNativeReuse);
    }
    (0, _Result.fromPromise)((_this$_bridge = this._bridge)[methodName].apply(_this$_bridge, [this._tag].concat((0, _toConsumableArray2.default)(args))), callback);
  };
  return SqliteNativeModulesDispatcher;
}();
var SqliteJsiDispatcher = /*#__PURE__*/function () {
  // debug hook for NT use

  function SqliteJsiDispatcher(dbName, {
    usesExclusiveLocking: usesExclusiveLocking
  }) {
    this._db = global.nativeWatermelonCreateAdapter(dbName, usesExclusiveLocking);
    this._unsafeErrorListener = function () {};
  }
  var _proto2 = SqliteJsiDispatcher.prototype;
  _proto2.call = function call(name, _args, callback) {
    var methodName = name;
    var args = _args;
    if (methodName === 'query' && !global.HermesInternal) {
      // NOTE: compressing results of a query into a compact array makes querying 15-30% faster on JSC
      // but actually 9% slower on Hermes (presumably because Hermes has faster C++ JSI and slower JS execution)
      methodName = 'queryAsArray';
    } else if (methodName === 'batch') {
      methodName = 'batchJSON';
      args = [JSON.stringify(args[0])];
    } else if (_reactNative.Platform.OS === 'windows' && (methodName === 'provideSyncJson' || methodName === 'unsafeLoadFromSync')) {
      callback({
        error: new Error("".concat(methodName, " unavailable on Windows. Please contribute."))
      });
    } else if (methodName === 'provideSyncJson') {
      (0, _Result.fromPromise)(WMDatabaseBridge.provideSyncJson.apply(WMDatabaseBridge, (0, _toConsumableArray2.default)(args)), callback);
      return;
    }
    try {
      var method = this._db[methodName];
      if (!method) {
        throw new Error("Cannot run database method ".concat(method, " because database failed to open. Hint: Did you install JSI correctly? This happens if you forgot to configure Proguard correctly ").concat(Object.keys(this._db).join(',')));
      }
      var result = method.apply(void 0, (0, _toConsumableArray2.default)(args));
      // On Android, errors are returned, not thrown - see DatabaseBridge.cpp
      if (result instanceof Error) {
        throw result;
      } else {
        if (methodName === 'queryAsArray') {
          result = require('./decodeQueryResult').default(result);
        }
        callback({
          value: result
        });
      }
    } catch (error) {
      this._unsafeErrorListener(error);
      callback({
        error: error
      });
    }
  };
  return SqliteJsiDispatcher;
}();
var makeDispatcher = function makeDispatcher(type, tag, dbName, options) {
  switch (type) {
    case 'jsi':
      return new SqliteJsiDispatcher(dbName, options);
    case 'asynchronous':
      return new SqliteNativeModulesDispatcher(tag, WMDatabaseBridge, options);
    default:
      throw new Error('Unknown DispatcherType');
  }
};
exports.makeDispatcher = makeDispatcher;
var initializeJSI = function initializeJSI() {
  if (global.nativeWatermelonCreateAdapter) {
    return true;
  }
  var bridge = WMDatabaseBridge;
  if (bridge.initializeJSI) {
    try {
      bridge.initializeJSI();
      return !!global.nativeWatermelonCreateAdapter;
    } catch (e) {
      _common.logger.error('[SQLite] Failed to initialize JSI');
      _common.logger.error(e);
    }
  }
  return false;
};
function getDispatcherType(options) {
  if (options.jsi) {
    if (initializeJSI()) {
      return 'jsi';
    }
    _common.logger.warn("JSI SQLiteAdapter not available\u2026 falling back to asynchronous operation. This will happen if you're using remote debugger, and may happen if you forgot to recompile native app after WatermelonDB update");
  }
  return 'asynchronous';
}