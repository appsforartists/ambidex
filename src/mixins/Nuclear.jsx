var React = require("react");

var NuclearMixin = {
  "contextTypes":               {
                                  "ambidexReactor":        React.PropTypes.object.isRequired,
                                },

  "getInitialState":            function () {
                                  // this.reactor shouldn't ever change, so keeping it simple
                                  // and not worrying about componentWillUpdate
                                  this.reactor = this.context.ambidexReactor;

                                  return this.getDataBindings === undefined
                                    ? {}
                                    : this.reactor.ReactMixin.getInitialState.apply(this);
                                },

                                // Should probably be more intropective about this for futureproofness;
                                // but for now, this does the job
  "componentDidMount":          function () {
                                  if (this.getDataBindings !== undefined) {
                                    return this.reactor.ReactMixin.componentDidMount.apply(this, arguments);
                                  }
                                },

  "componentWillUnmount":       function () {
                                  if (this.getDataBindings !== undefined) {
                                    return this.reactor.ReactMixin.componentWillUnmount.apply(this, arguments);
                                  }
                                },
};

module.exports = NuclearMixin;
