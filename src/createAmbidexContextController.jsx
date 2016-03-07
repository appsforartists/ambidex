var React = require("react");

// var NuclearContextMixin   = require("./mixins/NuclearContext.jsx");
var SettingsContextMixin  = require("./mixins/SettingsContext.jsx");
var TitleContextMixin     = require("./mixins/TitleContext.jsx");

var createAmbidexContextController = function (optionalFeatures) {
  var mixins = [
    SettingsContextMixin,
    TitleContextMixin,
  ];

  // if (optionalFeatures.nuclear)
  //   mixins.push(NuclearContextMixin);

  return React.createClass(
    {
      "mixins":                     mixins,

      "render":                     function () {
                                      return this.props.children;
                                    }
    }
  );
};

module.exports = createAmbidexContextController;
