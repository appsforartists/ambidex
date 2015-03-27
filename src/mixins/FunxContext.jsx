var React = require("react/addons");

var FunxMixin = require("./Funx.jsx");

var FunxContextMixin = {
  "propTypes":                  {
                                  "funx":   React.PropTypes.object.isRequired,
                                },

  "childContextTypes":          FunxMixin.contextTypes,

  "getChildContext":            function () {
                                  return {
                                    "ambidexFunx":    this.props.funx,
                                  }
                                },
};

module.exports = FunxContextMixin;
