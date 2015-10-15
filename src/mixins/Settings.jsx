var React = require("react");

var SettingsMixin = {
  "contextTypes":               {
                                  "ambidexSettings":        React.PropTypes.object.isRequired,
                                },

  "getAmbidexSettings":         function () {
                                  return this.context.ambidexSettings;
                                }
};

module.exports = SettingsMixin;
