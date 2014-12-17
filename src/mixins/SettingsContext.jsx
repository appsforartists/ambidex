var React = require("react/addons");

var SettingsMixin = require("./Settings.jsx");

var SettingsContextMixin = {
  "propTypes":                  {
                                  "settings":     React.PropTypes.object.isRequired,
                                },

  "childContextTypes":          SettingsMixin.contextTypes,

  "getChildContext":            function () {
                                  return {
                                    "ambidexSettings":          this.props.settings,
                                  }
                                },
};

module.exports = SettingsContextMixin;
