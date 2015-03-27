module.exports = {
  "addons":         {
                      "utilities":      require("./addons/utilities.js"),
                    },

  "mixinCreators":  {
                      "connectStoresToLocalState":   require("./mixinCreators/connectStoresToLocalState.jsx"),
                    },

  "mixins":         {
                      "Funx":     require("./mixins/Funx.jsx"),
                      "Settings": require("./mixins/Settings.jsx"),
                      "Title":    require("./mixins/Title.jsx"),
                    },
};
