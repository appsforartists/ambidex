var Immutable = require("immutable");

var routerState = {
  "initialize":       function () {
                        this.on(
                          this.actions.routerStateChanged,

                          (lastValue, { routerState }) => Immutable.fromJS(routerState)
                        );
                      }
};

module.exports = routerState;
