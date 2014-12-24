var Lazy   = require("lazy.js");
var Reflux = require("reflux");

var toCamelCase = require("to-camel-case");

var RefluxMixin = require("../mixins/Reflux.jsx");

var connectStoresToLocalState = function (listenableNames) {
    /*  connectStoresToLocalState can be called in three ways:
     *
     *  - connectStoresToLocalState(StoreName, componentStateKeyName),
     *
     *  - connectStoresToLocalState([StoreName1, StoreName2]): componentStateKeyName will 
     *    be the lower-camel-case version of StoreName.  If you pass in a single string,
     *    it will be treated as an Array of one item (the string).
     *
     *  - connectStoresToLocalState(
     *      {
     *        "StoreName1":   "componentStateKeyName1",
     *        "StoreName2":   "componentStateKeyName2",
     *      }
     *    )
     */

  console.assert(listenableNames.length, "connectStoresToLocalState needs to know which stores to connect.");

  if (arguments.length == 2) {
    listenableNames = Lazy([arguments]).toObject();

  } else if (listenableNames.constructor === String) {
    listenableNames = [listenableNames];
  }

  if (Array.isArray(listenableNames)) {
    listenableNames = Lazy(listenableNames).map(
      storeName => [storeName, toCamelCase(storeName)]
    ).toObject();
  }

  // Heavily inspired by Reflux.connect: https://github.com/spoike/refluxjs/blob/master/src/connect.js
  return Object.assign(
    {
      "getInitialState":            function () {
                                      return Lazy(listenableNames).map(
                                        (componentStateKeyName, storeName) => {
                                          return [componentStateKeyName, this.getRefluxStore(storeName).state]
                                        }
                                      ).toObject();
                                    },

      "componentDidMount":          function () {
                                      Lazy(listenableNames).each(
                                        (componentStateKeyName, storeName) => {
                                          this.listenTo(
                                            this.getRefluxStore(storeName),

                                            (value) =>  this.setState(
                                                          {
                                                            componentStateKeyName,
                                                            value 
                                                          }
                                                        )
                                          )
                                        }
                                      );
                                    },

      "componentWillUnmount":       Reflux.ListenerMixin.componentWillUnmount
    },

    RefluxMixin,
    Reflux.ListenerMethods
  );
};

module.exports = connectStoresToLocalState;
