// Runs all app code through node-jsx, so we can use conveniences like fat-arrow lambdas

require("node-jsx").install(
  {
    "extension":  ".js",
    "harmony":    true
  }
);

require("./polyfills.js");

var recursiveCloneWithDefaults = require("./addons/utilities.js").recursiveCloneWithDefaults;

module.exports = Object.assign(
  require("./Ambidex.server.js"),

  recursiveCloneWithDefaults(
    {
      "addons": {
                  "TardisGallery":  require("./addons/tardis/TardisGallery.server.js"),
                }
    },

    require("./init.common.js")
  )
);
