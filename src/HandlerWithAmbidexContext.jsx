var React = require("react/addons");

var SettingsMixin = require("./mixins/Settings.jsx");

var HandlerWithAmbidexContext = React.createClass(
  {
    "childContextTypes":          SettingsMixin.contextTypes,

    "getChildContext":            function () {
                                    return {
                                      "ambidexSettings":   this.props.settings
                                    }
                                  },

    "render":                     function () {
                                    return  <this.props.Handler />;
                                  }
  }
);

module.exports = HandlerWithAmbidexContext;
