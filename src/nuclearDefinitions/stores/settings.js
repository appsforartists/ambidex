var Immutable = require("immutable");

var settings = {
  "initialize":       function () {
                        this.on(
                          this.actions.loadSettings,

                          (lastValue, { settings }) => settings
                        );
                      }
};

module.exports = settings;
