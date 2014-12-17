var React = require("react/addons");

var SettingsContextMixin = require("./mixins/SettingsContext.jsx");
var TitleContextMixin    = require("./mixins/TitleContext.jsx");

var HandlerWithAmbidexContext = React.createClass(
  {
    "mixins":                     [
                                    SettingsContextMixin,
                                    TitleContextMixin,
                                  ],

    "render":                     function () {
                                    return <this.props.Handler />;
                                  }
  }
);

module.exports = HandlerWithAmbidexContext;
