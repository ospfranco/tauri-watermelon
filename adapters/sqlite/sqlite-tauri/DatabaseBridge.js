"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _DatabaseDriver = _interopRequireDefault(require("./DatabaseDriver"));
var DatabaseBridge = /*#__PURE__*/function () {
  function DatabaseBridge() {
    var _this = this;
    this.connections = {};
    this._initializationPromiseResolve = function () {};
    this._initializationPromise = new Promise(function (resolve) {
      _this._initializationPromiseResolve = resolve;
    });
    this._operationLock = null;
  }
  var _proto = DatabaseBridge.prototype;
  // MARK: - Asynchronous connections
  _proto.connected = function connected(tag, driver) {
    this.connections[tag] = {
      driver: driver,
      queue: [],
      status: 'connected'
    };
  };
  _proto.waiting = function waiting(tag, driver) {
    this.connections[tag] = {
      driver: driver,
      queue: [],
      status: 'waiting'
    };
  };
  _proto.initialize = function initialize(tag, databaseName, schemaVersion, resolve, reject) {
    return new Promise(function ($return, $error) {
      var driver;
      var $Try_1_Post = function () {
        try {
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      };
      var $Try_1_Catch = function (error) {
        try {
          if (driver && error.type === 'SchemaNeededError') {
            this.waiting(tag, driver);
            this._initializationPromiseResolve();
            resolve({
              code: 'schema_needed'
            });
          } else if (driver && error.type === 'MigrationNeededError') {
            this.waiting(tag, driver);
            this._initializationPromiseResolve();
            resolve({
              code: 'migrations_needed',
              databaseVersion: error.databaseVersion
            });
          } else {
            this.sendReject(reject, error, 'initialize');
          }
          return $Try_1_Post();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this);
      try {
        this.assertNoConnection(tag);
        driver = new _DatabaseDriver.default();
        return Promise.resolve(driver.initialize(databaseName, schemaVersion)).then(function ($await_6) {
          try {
            this._initializationPromiseResolve();
            this.connected(tag, driver);
            resolve({
              code: 'ok'
            });
            return $Try_1_Post();
          } catch ($boundEx) {
            return $Try_1_Catch($boundEx);
          }
        }.bind(this), $Try_1_Catch);
      } catch (error) {
        $Try_1_Catch(error)
      }
    }.bind(this));
  };
  _proto.setUpWithSchema = function setUpWithSchema(tag, databaseName, schema, schemaVersion, resolve, _reject) {
    return new Promise(function ($return, $error) {
      var driver;
      driver = new _DatabaseDriver.default();
      return Promise.resolve(driver.setUpWithSchema(databaseName, schema, schemaVersion)).then(function ($await_7) {
        try {
          this.connectDriverAsync(tag, driver);
          this._initializationPromiseResolve();
          resolve(true);
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.setUpWithMigrations = function setUpWithMigrations(tag, databaseName, migrations, fromVersion, toVersion, resolve, reject) {
    return new Promise(function ($return, $error) {
      var _driver;
      var $Try_2_Post = function () {
        try {
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      };
      var $Try_2_Catch = function (error) {
        try {
          this.disconnectDriver(tag);
          this.sendReject(reject, error, 'setUpWithMigrations');
          return $Try_2_Post();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this);
      try {
        _driver = new _DatabaseDriver.default();
        return Promise.resolve(_driver.setUpWithMigrations(databaseName, {
          from: fromVersion,
          to: toVersion,
          sql: migrations
        })).then(function ($await_8) {
          try {
            this.connectDriverAsync(tag, _driver);
            this._initializationPromiseResolve();
            resolve(true);
            return $Try_2_Post();
          } catch ($boundEx) {
            return $Try_2_Catch($boundEx);
          }
        }.bind(this), $Try_2_Catch);
      } catch (error) {
        $Try_2_Catch(error)
      }
    }.bind(this));
  }

  // MARK: - Asynchronous actions
  ;
  _proto.find = function find(tag, table, id, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'find', function (driver) {
      return driver.find(table, id);
    });
  };
  _proto.query = function query(tag, table, _query, args, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'query', function (driver) {
      return driver.cachedQuery(table, _query, args);
    });
  };
  _proto.queryIds = function queryIds(tag, query, args, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'queryIds', function (driver) {
      return driver.queryIds(query, args);
    });
  };
  _proto.unsafeQueryRaw = function unsafeQueryRaw(tag, query, args, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'unsafeQueryRaw', function (driver) {
      return driver.unsafeQueryRaw(query, args);
    });
  };
  _proto.count = function count(tag, query, args, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'count', function (driver) {
      return driver.count(query, args);
    });
  };
  _proto.batch = function batch(tag, operations, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'batch', function (driver) {
      return driver.batch(operations);
    });
  };
  _proto.unsafeResetDatabase = function unsafeResetDatabase(tag, schema, schemaVersion, resolve, reject) {
    this.withDriver(tag, resolve, reject, 'unsafeResetDatabase', function (driver) {
      return driver.unsafeResetDatabase({
        version: schemaVersion,
        sql: schema
      });
    });
  }

  // getLocal(tag: number, key: string, resolve: (any) => void, reject: (string) => void): void {
  //   this.withDriver(tag, resolve, reject, 'getLocal', (driver) => driver.getLocal(key))
  // }

  // MARK: - Helpers
  ;
  _proto.withDriver = function withDriver(tag, resolve, reject, functionName, action) {
    return new Promise(function ($return, $error) {
      var _this2, connection, result;
      _this2 = this;
      var $Try_3_Post = function () {
        try {
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      };
      var $Try_3_Catch = function (error) {
        try {
          this.sendReject(reject, error, functionName);
          return $Try_3_Post();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this);
      try {
        return Promise.resolve(this._initializationPromise).then(function ($await_9) {
          try {
            connection = this.connections[tag];
            if (!connection) {
              throw new Error("No driver for with tag ".concat(tag, " available, called from ").concat(functionName));
            }
            if (connection.status === 'connected') {
              if (this._operationLock) {
                return Promise.resolve(this._operationLock).then(function ($await_10) {
                  try {
                    return $If_5.call(this);
                  } catch ($boundEx) {
                    return $Try_3_Catch($boundEx);
                  }
                }.bind(this), $Try_3_Catch);
              }
              function $If_5() {
                this._operationLock = action(connection.driver);
                return Promise.resolve(this._operationLock).then(function ($await_11) {
                  try {
                    result = $await_11;
                    resolve(result);
                    this._operationLock = null;
                    return $If_4.call(this);
                  } catch ($boundEx) {
                    return $Try_3_Catch($boundEx);
                  }
                }.bind(this), $Try_3_Catch);
              }
              return $If_5.call(this);
            } else {
              if (connection.status === 'waiting') {
                // try again when driver is ready
                connection.queue.push(function () {
                  _this2.withDriver(tag, resolve, reject, functionName, action);
                });
              }
              return $If_4.call(this);
            }
            function $If_4() {
              return $Try_3_Post();
            }
          } catch ($boundEx) {
            return $Try_3_Catch($boundEx);
          }
        }.bind(this), $Try_3_Catch);
      } catch (error) {
        $Try_3_Catch(error)
      }
    }.bind(this));
  };
  _proto.connectDriverAsync = function connectDriverAsync(tag, driver) {
    var {
      queue = []
    } = this.connections[tag];
    this.connections[tag] = {
      driver: driver,
      queue: [],
      status: 'connected'
    };
    queue.forEach(function (operation) {
      return operation();
    });
  };
  _proto.disconnectDriver = function disconnectDriver(tag) {
    var {
      queue = []
    } = this.connections[tag];
    delete this.connections[tag];
    queue.forEach(function (operation) {
      return operation();
    });
  };
  _proto.assertNoConnection = function assertNoConnection(tag) {
    if (this.connections[tag]) {
      throw new Error("A driver with tag ".concat(tag, " already set up"));
    }
  };
  _proto.sendReject = function sendReject(reject, error, functionName) {
    if (reject) {
      reject("db.".concat(functionName, ".error"), error.message, error);
    } else {
      throw new Error("db.".concat(functionName, " missing reject (").concat(error.message, ")"));
    }
  };
  return DatabaseBridge;
}();
var databaseBridge = new DatabaseBridge();
var _default = databaseBridge;
exports.default = _default;