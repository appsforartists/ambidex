require("babel-register")(
  require("./babelConfig")
);

require("make-node-env-global")();

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
