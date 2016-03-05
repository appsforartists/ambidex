// This file could probably be called .babelrc, but I don't want to clobber
// that name yet, in case we use it later to allow app developers to override
// these settings.

module.exports = {
  "plugins": [
    "syntax-trailing-function-commas", 
    "transform-object-rest-spread", 
  ],

  "presets": [
    "es2015", 
    "react",
  ],
  
  "ignore": (filePath) => (
    filePath.includes("node_modules") && 
    !(
      filePath.includes("ambidex") ||
      filePath.includes("experimental-nuclear-js") ||
      filePath.includes("gravel") ||
      filePath.includes("material-")
    )
  )
};