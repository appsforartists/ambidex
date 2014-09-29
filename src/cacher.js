require('prfun');

var createHash  = require("crypto").createHash;
var fs          = require("fs");

fs = {
  "exists":     // Can't use Promisify because fs.exists can't error
                function (path) {
                  return new Promise(
                    function (resolve) {
                      return require("fs").exists(path, resolve);
                    }
                  );
                },

  "readFile":   Promise.promisify(fs.readFile),
  "writeFile":  Promise.promisify(fs.writeFile),
  "mkdir":      Promise.promisify(fs.mkdir),
  "rmRF":       Promise.promisify(require("rimraf"))
};

module.exports = {
  "fileOptions":          {
                            "encoding":     "utf8",
                          },

  "path":                 "../cache",

  "md5":                  function (value) {
                            return createHash("md5").update(value).digest("hex");
                          },

  "initPath":             function () {
                            return fs.exists(this.path).then(
                              aleadyExists => {
                                                if (aleadyExists) {
                                                  return true;

                                                } else {
                                                  return fs.mkdir(this.path).then(
                                                    () => true
                                                  );
                                                }
                                              }
                            )
                          },

  "_getFilePathForKey":   function (key) {
                            return filePath  = this.path + "/" + this.md5(key);
                          },

  "checkFor":             function (key) {
                            return fs.exists(this._getFilePathForKey(key));
                          },

  "get":                  function (key) {
                            return fs.readFile(
                              this._getFilePathForKey(key),
                              this.fileOptions
                            );
                          },

  "create":               function (key, value) {
                            return fs.writeFile(
                              this._getFilePathForKey(key),
                              value,
                              this.fileOptions
                            ).then(
                              () => value
                            );
                          },

  "getOrCreate":          function (key, value) {
                            return this.checkFor(key).then(
                              aleadyExists => aleadyExists
                                                ? this.get(key)
                                                : this.create(key, value)
                            )

                          },

  "clear":                function () {
                            return fs.rmRF(this.path).then(
                              () => this.initPath()
                            );
                          },
};
