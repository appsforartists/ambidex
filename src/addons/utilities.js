var Lazy = require("lazy.js");

var utilities = {
  "recursiveCloneWithDefaults":   function (instance, defaults) {
                                    instance = instance || {};

                                    return Lazy(instance).defaults(defaults).map(
                                      (value, key) => value.constructor === Object
                                                        ? [key, utilities.recursiveCloneWithDefaults(instance[key] || {}, defaults[key] || {})]
                                                        : [key, value]
                                    ).toObject();
                                  }
};

module.exports = utilities;
