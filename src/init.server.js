// Runs all app code through node-jsx, so we can use conveniences like fat-arrow lambdas

require("node-jsx").install(
  {
    "extension":  ".js",
    "harmony":    true
  }
);

var Ambidex = require("./Ambidex.server.js");
var common  = require("./init.common.js");

Object.assign = Object.assign || require("react/lib/Object.assign.js");

module.exports = Object.assign(Ambidex, common);
