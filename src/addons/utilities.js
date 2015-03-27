var Lazy = require("lazy.js");

var utilities = {
  "hasValue":                     function (value) {
                                    return value !== null && value !== undefined;
                                  },

  "hasContent":                   function (value) {
                                    try {
                                      return Boolean(Object.keys(value).length)

                                    } catch (error) {
                                      return utilities.hasValue(value);
                                    }
                                  },

  "recursiveCloneWithDefaults":   function (instance, defaults) {
                                    instance = instance || {};

                                    return Lazy(instance).defaults(defaults).map(
                                      (value, key) => value.constructor === Object
                                                        ? [key, utilities.recursiveCloneWithDefaults(instance[key] || {}, defaults[key] || {})]
                                                        : [key, value]
                                    ).toObject();
                                  },

  "promiseFromTruthyObservable":  function (stream) {
                                    return new Promise(
                                      (resolve, reject) => {
                                        var streamListener = (value) => {
                                          if (value) {
                                            resolve(
                                              value
                                            );

                                            stream.offValue(
                                              streamListener
                                            );
                                          }
                                        };

                                        stream.onValue(
                                          streamListener
                                        );
                                      }
                                    );
                                  }
};

module.exports = utilities;
