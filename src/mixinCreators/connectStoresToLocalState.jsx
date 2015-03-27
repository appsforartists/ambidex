var FunxMixin = require("../mixins/Funx.jsx");

var connectStoresToLocalState = function (storeNames) {
  console.assert(Array.isArray(storeNames), "connectStoresToLocalState expects an Array of store names.");
  console.assert(storeNames.length, "connectStoresToLocalState needs to know which stores to connect.");
  console.assert(storeNames.every(storeName => storeName[0] === storeName[0].toLowerCase()), "The store names passed to connectStoresToLocalState should be in lower-camel-case.");

  return Object.assign(
    {
      "componentWillMount":         function () {
                                      this._funxConnections = storeNames.map(
                                        storeName =>  (
                                                        {
                                                          "store":    this.getFunxStore(storeName),
                                                          "listener": value => {
                                                                        // Workaround for https://github.com/facebook/jstransform/issues/35
                                                                        var changedState = {};
                                                                        changedState[storeName] = value;
                                                                        this.setState(changedState);
                                                                      }
                                                        }
                                                      )
                                      );

                                      this._funxConnections.forEach(
                                        connection => connection.store.onValue(connection.listener)
                                      );
                                    },

      "componentWillUnmount":       function () {
                                      this._funxConnections.forEach(
                                        connection => connection.store.offValue(connection.listener)
                                      );
                                    },
    },

    FunxMixin
  );
};

module.exports = connectStoresToLocalState;
