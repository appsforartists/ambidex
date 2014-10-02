var Ambidex = function () {
  // The real implementation is in Ambidex.server.js
  // This function is just to make the client API compatible.
};

Ambidex.getFromSettings = require("./getGetFromSettings.js")();

module.exports = Ambidex;
