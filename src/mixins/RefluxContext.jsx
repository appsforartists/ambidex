var React = require("react/addons");

var RefluxMixin = require("./Reflux.jsx");

var RefluxContextMixin = {
  "propTypes":                  {
                                  "reflux":   React.PropTypes.object.isRequired,
                                },

  "childContextTypes":          RefluxMixin.contextTypes,

  "getChildContext":            function () {
                                  return {
                                    "ambidexReflux":    this.props.reflux,
                                  }
                                },
};

module.exports = RefluxContextMixin;
