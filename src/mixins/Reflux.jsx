var React = require("react/addons");

var RefluxMixin = {
  "contextTypes":               {
                                  "ambidexReflux":        React.PropTypes.object.isRequired,
                                },

  "getRefluxAction":            function (actionName) {
                                  return this.context.ambidexReflux.actions[actionName] || console.warn(`Reflux action ${ actionName } was not found.`);
                                },

  "getRefluxStore":             function (storeName) {
                                  return this.context.ambidexReflux.stores[storeName]   || console.warn(`Reflux store ${ storeName } was not found.`);
                                }
};

module.exports = RefluxMixin;
