var React = require("react/addons");

var FunxMixin = {
  "contextTypes":               {
                                  "ambidexFunx":        React.PropTypes.object.isRequired,
                                },

  "getFunxAction":              function (actionName) {
                                  return this.context.ambidexFunx.actions[actionName] || console.warn(`Funx action ${ actionName } was not found.  Available actions: ${ Object.keys(this.context.ambidexFunx.actions) }`);
                                },

  "getFunxStore":               function (storeName) {
                                  return this.context.ambidexFunx.stores[storeName]   || console.warn(`Funx store ${ storeName } was not found.  Available stores: ${ Object.keys(this.context.ambidexFunx.stores) }`);
                                }
};

module.exports = FunxMixin;
