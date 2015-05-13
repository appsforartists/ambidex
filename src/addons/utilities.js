var Lazy = require("lazy.js");

var utilities = {
  "noOp":                         function () {
                                  },

  "echo":                         function () {
                                    switch (arguments.length) {
                                      case 0:
                                        return undefined;

                                      case 1:
                                        return arguments[0];

                                      default:
                                        return Array.prototype.slice.call(arguments);
                                    };
                                  },

  "echoFirst":                    function () {
                                    return arguments[0];
                                  },

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
};

module.exports = utilities;
