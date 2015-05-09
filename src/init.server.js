var babelBlacklist = require("./babelBlacklist");

require("babel/register")(
  {
    "stage":   1,               // Allow experimental transforms (specifically, ...rest in objects)
    "ignore":  babelBlacklist,
  }
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
