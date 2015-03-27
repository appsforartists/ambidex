var React = require("react/addons");

var FunxContextMixin      = require("./mixins/FunxContext.jsx");
var SettingsContextMixin  = require("./mixins/SettingsContext.jsx");
var TitleContextMixin     = require("./mixins/TitleContext.jsx");

var createHandlerWithAmbidexContext = function (optionalFeatures) {
  var mixins = [
    SettingsContextMixin,
    TitleContextMixin,
  ];

  if (optionalFeatures.funx)
    mixins.push(FunxContextMixin);

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
