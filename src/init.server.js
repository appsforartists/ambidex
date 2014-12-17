// Runs all app code through node-jsx, so we can use conveniences like fat-arrow lambdas

require("node-jsx").install(
  {
    "extension":  ".js",
    "harmony":    true
  }
);

require("./polyfills.js");

var common  = require("./init.common.js");
var Ambidex = require("./Ambidex.server.js");

module.exports = Object.assign(Ambidex, common);
