"use strict";

exports.__esModule = true;
exports.default = void 0;
/* eslint-disable no-console */var SQLite = require('tauri-plugin-sql').default;
var {
  removeFile: removeFile
} = require('@tauri-apps/api/fs');
var {
  appConfigDir: appConfigDir
} = require('@tauri-apps/api/path');
var Database = /*#__PURE__*/function () {
  function Database(path = ':memory:') {
    this.path = path;
  }
  var _proto = Database.prototype;
  _proto.open = function open() {
    return new Promise(function ($return, $error) {
      var $Try_1_Post = function () {
        try {
          if (!this.instance) {
            return $error(new Error('Failed to open the database.'));
          }
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this);
      var $Try_1_Catch = function (error) {
        try {
          throw new Error("Failed to open the database. - ".concat(error));
        } catch ($boundEx) {
          return $error($boundEx);
        }
      };
      try {
        return Promise.resolve(SQLite.load("sqlite:".concat(this.path))).then(function ($await_3) {
          try {
            this.instance = $await_3;
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
  _proto.inTransaction = function inTransaction(executeBlock) {
    return new Promise(function ($return, $error) {
      var $Try_2_Post = function () {
        try {
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      };
      var $Try_2_Catch = function (error) {
        try {
          console.log('Error in transaction', error);
          return Promise.resolve(this.instance.execute('ROLLBACK')).then(function ($await_4) {
            try {
              throw error;
            } catch ($boundEx) {
              return $error($boundEx);
            }
          }, $error);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this);
      try {
        return Promise.resolve(this.instance.execute('BEGIN TRANSACTION')).then(function ($await_5) {
          try {
            return Promise.resolve(executeBlock()).then(function ($await_6) {
              try {
                return Promise.resolve(this.instance.execute('COMMIT')).then(function ($await_7) {
                  try {
                    return $Try_2_Post();
                  } catch ($boundEx) {
                    return $Try_2_Catch($boundEx);
                  }
                }, $Try_2_Catch);
              } catch ($boundEx) {
                return $Try_2_Catch($boundEx);
              }
            }.bind(this), $Try_2_Catch);
          } catch ($boundEx) {
            return $Try_2_Catch($boundEx);
          }
        }.bind(this), $Try_2_Catch);
      } catch (error) {
        $Try_2_Catch(error)
      }
    }.bind(this));
  };
  _proto.execute = function execute(query, args = []) {
    return new Promise(function ($return, $error) {
      return $return(this.instance.select(query, args));
    }.bind(this));
  };
  _proto.executeStatements = function executeStatements(queries) {
    return new Promise(function ($return, $error) {
      return $return(this.instance.execute(queries, []));
    }.bind(this));
  };
  _proto.queryRaw = function queryRaw(query, args = []) {
    return new Promise(function ($return, $error) {
      return $return(this.instance.select(query, args));
    }.bind(this));
  };
  _proto.count = function count(query, args = []) {
    return new Promise(function ($return, $error) {
      var results, result;
      return Promise.resolve(this.instance.select(query, args)).then(function ($await_8) {
        try {
          results = $await_8;
          if (results.length === 0) {
            return $error(new Error('Invalid count query, can`t find next() on the result'));
          }
          result = results[0];
          return $return(Number.parseInt(result.count, 10));
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.userVersion = function userVersion() {
    return new Promise(function ($return, $error) {
      var results;
      return Promise.resolve(this.instance.select('PRAGMA user_version')).then(function ($await_9) {
        try {
          results = $await_9;
          return $return(results[0].user_version);
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.setUserVersion = function setUserVersion(version) {
    return new Promise(function ($return, $error) {
      return Promise.resolve(this.instance.execute("PRAGMA user_version = ".concat(version))).then(function ($await_10) {
        try {
          return $return();
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }, $error);
    }.bind(this));
  };
  _proto.unsafeDestroyEverything = function unsafeDestroyEverything() {
    return new Promise(function ($return, $error) {
      var appConfigDirPath;
      return Promise.resolve(this.instance.close()).then(function ($await_11) {
        try {
          return Promise.resolve(appConfigDir()).then(function ($await_12) {
            try {
              appConfigDirPath = $await_12;
              return Promise.resolve(removeFile("".concat(appConfigDirPath).concat(this.path))).then(function ($await_13) {
                try {
                  return Promise.resolve(this.open()).then(function ($await_14) {
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
        } catch ($boundEx) {
          return $error($boundEx);
        }
      }.bind(this), $error);
    }.bind(this));
  };
  _proto.isInMemoryDatabase = function isInMemoryDatabase() {
    return false;
  };
  return Database;
}();
var _default = Database;
exports.default = _default;