"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.getPath = getPath;
var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));
var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));
var _Database = _interopRequireDefault(require("./Database"));
function fixArgs(args) {
  return args.map(function (value) {
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return value;
  });
}
var MigrationNeededError = /*#__PURE__*/function (_Error) {
  (0, _inheritsLoose2.default)(MigrationNeededError, _Error);
  function MigrationNeededError(databaseVersion) {
    var _this;
    _this = _Error.call(this, 'MigrationNeededError') || this;
    _this.databaseVersion = databaseVersion;
    _this.type = 'MigrationNeededError';
    _this.message = 'MigrationNeededError';
    return _this;
  }
  return MigrationNeededError;
}( /*#__PURE__*/(0, _wrapNativeSuper2.default)(Error));
var SchemaNeededError = /*#__PURE__*/function (_Error2) {
  (0, _inheritsLoose2.default)(SchemaNeededError, _Error2);
  function SchemaNeededError() {
    var _this2;
    _this2 = _Error2.call(this, 'SchemaNeededError') || this;
    _this2.type = 'SchemaNeededError';
    _this2.message = 'SchemaNeededError';
    return _this2;
  }
  return SchemaNeededError;
}( /*#__PURE__*/(0, _wrapNativeSuper2.default)(Error));
function getPath(dbName) {
  if (dbName === ':memory:' || dbName === 'file::memory:') {
    return dbName;
  }
  var path = dbName;
  // dbName.startsWith('/') || dbName.startsWith('file:') ? dbName : `${process.cwd()}/${dbName}`
  if (path.indexOf('.db') === -1) {
    if (path.indexOf('?') >= 0) {
      var index = path.indexOf('?');
      path = "".concat(path.substring(0, index), ".db").concat(path.substring(index));
    } else {
      path = "".concat(path, ".db");
    }
  }
  return path;
}
var DatabaseDriver = /*#__PURE__*/function () {
  function DatabaseDriver() {
    this.cachedRecords = {};
  }
  var _proto = DatabaseDriver.prototype;
  _proto.initialize = function initialize(dbName, schemaVersion) {
    return new Promise(function ($return, $error) {
      return Promise.resolve(this.init(dbName)).then(function ($await_7) {
        try {
          return Promise.resolve(this.isCompatible(schemaVersion)).then(function ($await_8) {
            try {
              return $return();
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }, $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.setUpWithSchema = function setUpWithSchema(dbName, schema, schemaVersion) {
    return new Promise(function ($return, $error) {
      return Promise.resolve(this.init(dbName)).then(function ($await_9) {
        try {
          return Promise.resolve(this.unsafeResetDatabase({
            version: schemaVersion,
            sql: schema
          })).then(function ($await_10) {
            try {
              return Promise.resolve(this.isCompatible(schemaVersion)).then(function ($await_11) {
                try {
                  return $return();
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }, $error);
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }.bind(this), $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.setUpWithMigrations = function setUpWithMigrations(dbName, migrations) {
    return new Promise(function ($return, $error) {
      return Promise.resolve(this.init(dbName)).then(function ($await_12) {
        try {
          return Promise.resolve(this.migrate(migrations)).then(function ($await_13) {
            try {
              return Promise.resolve(this.isCompatible(migrations.to)).then(function ($await_14) {
                try {
                  return $return();
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }, $error);
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }.bind(this), $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.init = function init(dbName) {
    return new Promise(function ($return, $error) {
      this.database = new _Database.default(getPath(dbName));
      return Promise.resolve(this.database.open()).then(function ($await_15) {
        try {
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.find = function find(table, id) {
    return new Promise(function ($return, $error) {
      var query, results;
      if (this.isCached(table, id)) {
        return $return(id);
      }
      query = "SELECT * FROM '".concat(table, "' WHERE id == ? LIMIT 1");
      return Promise.resolve(this.database.queryRaw(query, [id])).then(function ($await_16) {
        try {
          results = $await_16;
          if (results.length === 0) {
            return $return(null);
          }
          this.markAsCached(table, id);
          return $return(results[0]);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.cachedQuery = function cachedQuery(table, query, args) {
    return new Promise(function ($return, $error) {
      var _this3, results;
      _this3 = this;
      return Promise.resolve(this.database.queryRaw(query, fixArgs(args))).then(function ($await_17) {
        try {
          results = $await_17;
          return $return(results.map(function (row) {
            var id = "".concat(row.id);
            if (_this3.isCached(table, id)) {
              return id;
            }
            _this3.markAsCached(table, id);
            return row;
          }));
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.queryIds = function queryIds(query, args) {
    return new Promise(function ($return, $error) {
      var results;
      return Promise.resolve(this.database.queryRaw(query, fixArgs(args))).then(function ($await_18) {
        try {
          results = $await_18;
          return $return(results.map(function (row) {
            return "".concat(row.id);
          }));
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.unsafeQueryRaw = function unsafeQueryRaw(query, args) {
    return new Promise(function ($return, $error) {
      return $return(this.database.queryRaw(query, fixArgs(args)));
    }.bind(this));
  };
  _proto.count = function count(query, args) {
    return new Promise(function ($return, $error) {
      return $return(this.database.count(query, fixArgs(args)));
    }.bind(this));
  };
  _proto.batch = function batch(operations) {
    return new Promise(function ($return, $error) {
      var _this4, newIds, removedIds;
      _this4 = this;
      newIds = [];
      removedIds = [];
      return Promise.resolve(this.database.inTransaction(function () {
        return new Promise(function ($return, $error) {
          var cacheBehavior, table, sql, argBatches;
          var operation,
            $iterator_operation_1 = [operations[Symbol.iterator]()];
          var $Loop_2_trampoline;
          function $Loop_2() {
            if (!($iterator_operation_1[1] = $iterator_operation_1[0].next()).done && ((operation = $iterator_operation_1[1].value) || true)) {
              [cacheBehavior, table, sql, argBatches] = operation;
              var args,
                $iterator_args_4 = [argBatches[Symbol.iterator]()];
              var $Loop_5_trampoline;
              function $Loop_5() {
                if (!($iterator_args_4[1] = $iterator_args_4[0].next()).done && ((args = $iterator_args_4[1].value) || true)) {
                  return Promise.resolve(_this4.database.execute(sql, fixArgs(args))).then(function ($await_19) {
                    try {
                      if (cacheBehavior === 1) {
                        newIds.push([table, args[0]]);
                      } else if (cacheBehavior === -1) {
                        removedIds.push([table, args[0]]);
                      }
                      return $Loop_5;
                    } catch ($boundEx) {
                      return $error($boundEx);
                    }
                  }, $error);
                } else return [1];
              }
              return ($Loop_5_trampoline = function (q) {
                while (q) {
                  if (q.then) return q.then($Loop_5_trampoline, $error);
                  try {
                    if (q.pop) {
                      if (q.length) return q.pop() ? $Loop_5_exit.call(this) : q;else q = $Loop_5;
                    } else q = q.call(this);
                  } catch (_exception) {
                    return $error(_exception);
                  }
                }
              }.bind(this))($Loop_5);
              function $Loop_5_exit() {
                return $Loop_2;
              }
            } else return [1];
          }
          return ($Loop_2_trampoline = function (q) {
            while (q) {
              if (q.then) return void q.then($Loop_2_trampoline, $error);
              try {
                if (q.pop) {
                  if (q.length) return q.pop() ? $Loop_2_exit.call(this) : q;else q = $Loop_2;
                } else q = q.call(this);
              } catch (_exception) {
                return $error(_exception);
              }
            }
          }.bind(this))($Loop_2);
          function $Loop_2_exit() {
            return $return();
          }
        });
      })).then(function ($await_20) {
        try {
          newIds.forEach(function ([table, id]) {
            _this4.markAsCached(table, id);
          });
          removedIds.forEach(function ([table, id]) {
            _this4.removeFromCache(table, id);
          });
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  }

  // MARK: - LocalStorage
  ;
  _proto.getLocal = function getLocal(key) {
    return new Promise(function ($return, $error) {
      var results;
      return Promise.resolve(this.database.queryRaw('SELECT `value` FROM `local_storage` WHERE `key` = ?', [key])).then(function ($await_21) {
        try {
          results = $await_21;
          if (results.length > 0) {
            return $return(results[0].value);
          }
          return $return(null);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  }

  // MARK: - Record caching
  ;
  _proto.hasCachedTable = function hasCachedTable(table) {
    // $FlowFixMe
    return Object.prototype.hasOwnProperty.call(this.cachedRecords, table);
  };
  _proto.isCached = function isCached(table, id) {
    if (this.hasCachedTable(table)) {
      return this.cachedRecords[table].has(id);
    }
    return false;
  };
  _proto.markAsCached = function markAsCached(table, id) {
    if (!this.hasCachedTable(table)) {
      this.cachedRecords[table] = new Set();
    }
    this.cachedRecords[table].add(id);
  };
  _proto.removeFromCache = function removeFromCache(table, id) {
    if (this.hasCachedTable(table) && this.cachedRecords[table].has(id)) {
      this.cachedRecords[table].delete(id);
    }
  }

  // MARK: - Other private details
  ;
  _proto.isCompatible = function isCompatible(schemaVersion) {
    return new Promise(function ($return, $error) {
      var databaseVersion;
      return Promise.resolve(this.database.userVersion()).then(function ($await_22) {
        try {
          databaseVersion = $await_22;
          if (schemaVersion !== databaseVersion) {
            if (databaseVersion > 0 && databaseVersion < schemaVersion) {
              return $error(new MigrationNeededError(databaseVersion));
            } else {
              return $error(new SchemaNeededError());
            }
          }
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.unsafeResetDatabase = function unsafeResetDatabase(schema) {
    return new Promise(function ($return, $error) {
      var _this5;
      _this5 = this;
      return Promise.resolve(this.database.unsafeDestroyEverything()).then(function ($await_23) {
        try {
          this.cachedRecords = {};
          return Promise.resolve(this.database.inTransaction(function () {
            return new Promise(function ($return, $error) {
              return Promise.resolve(_this5.database.executeStatements(schema.sql)).then(function ($await_24) {
                try {
                  return Promise.resolve(_this5.database.setUserVersion(schema.version)).then(function ($await_25) {
                    try {
                      return $return();
                    } catch ($boundEx) {
                      return $error($boundEx);
                    }
                  }, $error);
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }, $error);
            });
          })).then(function ($await_26) {
            try {
              return $return();
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }, $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.migrate = function migrate(migrations) {
    return new Promise(function ($return, $error) {
      var _this6, databaseVersion;
      _this6 = this;
      return Promise.resolve(this.database.userVersion()).then(function ($await_27) {
        try {
          databaseVersion = $await_27;
          if ("".concat(databaseVersion) !== "".concat(migrations.from)) {
            return $error(new Error("Incompatbile migration set applied. DB: ".concat(databaseVersion, ", migration: ").concat(migrations.from)));
          }
          return Promise.resolve(this.database.inTransaction(function () {
            return new Promise(function ($return, $error) {
              return Promise.resolve(_this6.database.executeStatements(migrations.sql)).then(function ($await_28) {
                try {
                  _this6.database.setUserVersion(migrations.to);
                  return $return();
                } catch ($boundEx) {
                  return $error($boundEx);
                }
              }, $error);
            });
          })).then(function ($await_29) {
            try {
              return $return();
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }, $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  return DatabaseDriver;
}();
DatabaseDriver.sharedMemoryConnections = {};
var _default = DatabaseDriver;
exports.default = _default;