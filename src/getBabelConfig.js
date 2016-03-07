// This file could probably be called .babelrc, but I don't want to clobber
// that name yet, in case we use it later to allow app developers to override
// these settings.

var getBabelConfig = function () {
  // make a copy of babelConfig, because bable-register seems to be altering it
  return {
    "plugins": [
      "syntax-trailing-function-commas", 
      "transform-object-rest-spread", 
    ],

    "presets": [
      "es2015-webpack", 
      "react",
    ],

    // Also used as the value for babel-loader.include
    "only": (filePath) => (
      !filePath.includes("node_modules") ||
      (
        filePath.includes("ambidex") ||
        filePath.includes("gravel") ||
        filePath.includes("material-")
      )
    )
  }
};

module.exports = getBabelConfig;