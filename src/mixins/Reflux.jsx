var React = require("react/addons");

var RefluxMixin = {
  "contextTypes":               {
                                  "ambidexReflux":        React.PropTypes.object.isRequired,
                                },

  "getRefluxAction":            function (actionName) {
                                  return this.context.ambidexReflux.actions[actionName];
                                },

  "getRefluxStore":             function (storeName) {
                                  return this.context.ambidexReflux.stores[storeName];
                                }
};

module.exports = RefluxMixin;
