var React = require("react/addons");

/*  Since React components are designed to be idempotent, calling
 *  componentWillMount/DidUpdate repeatedly needs to be harmless.  
 *
 *  If we pushed a primative (like a string) directly onto the stack,
 *  we'd have to worry about duplicates.  Therefore, we simply register
 *  that this component implements sectionTitle and let Ambidex look up
 *  its title when Ambidex needs to know it.
 */

var TitleMixin = {  
  "contextTypes":               {
                                  "ambidexRegisterTitledComponent":   React.PropTypes.func.isRequired,
                                },

  "_registerAsTitledComponent": function () {
                                  if (this.sectionTitle || this.getSectionTitle) {
                                    this.context.ambidexRegisterTitledComponent(this);
                                  }
                                },

  "componentWillMount":         function () {
                                  this._registerAsTitledComponent();
                                },

  "componentWillReceiveProps":  function () {
                                  this._registerAsTitledComponent();
                                },
};

module.exports = TitleMixin;
