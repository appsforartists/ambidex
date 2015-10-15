var React = require("react");

var NuclearMixin = require("./Nuclear.jsx");

var NuclearContextMixin = {
  "propTypes":                  {
                                  "reactor":   React.PropTypes.object.isRequired,
                                },

  "childContextTypes":          NuclearMixin.contextTypes,

  "getChildContext":            function () {
                                  return {
                                    "ambidexReactor":    this.props.reactor,
                                  }
                                },
};

module.exports = NuclearContextMixin;
