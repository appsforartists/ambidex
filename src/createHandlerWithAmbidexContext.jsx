var React = require("react/addons");

var NuclearContextMixin   = require("./mixins/NuclearContext.jsx");
var SettingsContextMixin  = require("./mixins/SettingsContext.jsx");
var TitleContextMixin     = require("./mixins/TitleContext.jsx");

var createHandlerWithAmbidexContext = function (optionalFeatures) {
  var mixins = [
    SettingsContextMixin,
    TitleContextMixin,
  ];

  if (optionalFeatures.nuclear)
    mixins.push(NuclearContextMixin);

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
