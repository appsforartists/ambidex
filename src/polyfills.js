Object.assign = Object.assign || require("react/lib/Object.assign.js");

// from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes

if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}
