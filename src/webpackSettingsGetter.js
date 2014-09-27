var Webpack = require("webpack");

var settings = require("./webpackSettings.js");

// Lets us dynamically generate a settings object to enable things like Hot Module Replacement
function getSettings (options) {
  if (options.hasOwnProperty("devServerOrigin")) {

    // Add the HMR client to each exported bundle
    for (var bundleName in settings.entry) {
      settings.entry[bundleName].push(
        "webpack-dev-server/client?" + options.devServerOrigin, // e.g. localhost:8081
        "webpack/hot/dev-server"
      );
    }

    settings.output.publicPath = options.devServerOrigin + settings.output.publicPath;


    // react-hot-loader will keep the components updated when HMR happens
    jsxLoaderSettings = settings.module.loaders.filter(
      function (loader, i, loaders) {
        return loader.test.exec(".jsx");
      }
    )[0];

    jsxLoaderSettings.loader = "react-hot-loader!" + jsxLoaderSettings.loader;

    settings.plugins.push(
      new Webpack.HotModuleReplacementPlugin()
    );

  }

  if (options.hasOwnProperty("minimizeFileSize") && options.minimizeFileSize) {
    settings.plugins.push(
      new Webpack.optimize.OccurenceOrderPlugin(),
      new Webpack.optimize.UglifyJsPlugin(
        {
          "output":   {
                        "inline_scripts":   true
                      }
        }
      )
    );
  }

  return settings;
}

module.exports = getSettings;
