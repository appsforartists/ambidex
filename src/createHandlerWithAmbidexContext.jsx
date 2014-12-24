var React = require("react/addons");

var RefluxContextMixin    = require("./mixins/RefluxContext.jsx");
var SettingsContextMixin  = require("./mixins/SettingsContext.jsx");
var TitleContextMixin     = require("./mixins/TitleContext.jsx");

var createHandlerWithAmbidexContext = function (optionalFeatures) {
  var mixins = [
    SettingsContextMixin,
    TitleContextMixin,
  ];

  if (optionalFeatures.reflux)
    mixins.push(RefluxContextMixin);

  return React.createClass(
    {
      "mixins":                     mixins,

      "render":                     function () {
                                      return <this.props.Handler />;
                                    }
    }
  );
};

module.exports = createHandlerWithAmbidexContext;
