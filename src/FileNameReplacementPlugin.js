// Adapted from https://github.com/peerigon/alamid/blob/master/lib/core/bundle/AlamidWebpackPlugin.class.js

var FileNameReplacementPlugin = function (toFind, replaceWith) {
  toFind      = toFind      || ".server.";
  replaceWith = replaceWith || ".client.";

  return {
      "apply":  function (compiler) {
                  compiler.plugin(
                    "normal-module-factory",

                    function (normalModuleFactory) {
                      normalModuleFactory.plugin(
                        "after-resolve",

                        function (result, callback) {
                          [
                            "request",
                            "userRequest",
                            "resource"

                          ].forEach(
                            function (key) {
                              result[key] = result[key].replace(toFind, replaceWith);
                            }
                          );

                          return callback(null, result);
                        }
                      );
                    }
                  );
                }
  };
};

module.exports = FileNameReplacementPlugin;
