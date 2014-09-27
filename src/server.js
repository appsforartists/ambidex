require("node-jsx").install(
  {
    "extension":  ".jsx",
    "harmony":    true
  }
);

// Adds useful methods to Promise prototype, inc. converting node callbacks to promises
require('prfun');

/*  Most of our globals are defined in `webpackSettings`, but since `settings`
 *  depends on `SERVER_IP`, and `webpackSettings` depends on `settings`, we
 *  have to manually declare this here.                                        */
global.SERVER_IP            = require("my-local-ip")();

var readFileSync            = require('fs').readFileSync;

var mach                    = require("mach");
var Webpack                 = require("webpack");
var WebpackDevServer        = require("webpack-dev-server");

var React                   = require("react");
var ReactRouter             = require("react-router");


function Ambidex (argumentDict) {
  var self = this;

  if (self === global)
    throw new Error("You forgot the `new` in `new Ambidex`!");

  if (!argumentDict || !arguments.length === 1)
    throw new Error("Ambidex requires an argument dictionary to be passed in.");

  self._initFromArgumentDict(argumentDict);


  var settings  = self._get("settings");

  self._initWebpack();
  self._initStack();

  if (self._get("shouldServeImmediately")) {
    process.title = settings.SHORT_NAME;
    self._startServing();
  }
}

Ambidex.prototype._has = function (key) {
  return this.hasOwnProperty("_" + key);
};

Ambidex.prototype._get = function (key) {
  return this["_" + key];
};

Ambidex.prototype._set = function (key, value) {
  this["_" + key] = value;
}

Ambidex.prototype._initFromArgumentDict = function (argumentDict) {
  var self = this;

  var requiredArguments = [
    "settings",
    "routes"
  ];

  var defaultForOptionalArgument = {
    "scaffold":                 require("./Scaffold.jsx"),
    "shouldServeImmediately":   true,
    "middlewareInjector":       undefined,
    "localPath":                undefined
  };

  var optionalArguments = Object.keys(defaultForOptionalArgument);


  Object.keys(argumentDict).forEach(
    function (key) {
      if (
           requiredArguments.indexOf(key) === -1
        && optionalArguments.indexOf(key) === -1
      ) {
        console.warn("Ambidex doesn't know what to do with {\"" + key + "\": " + argumentDict[key] + "}");

      } else {
        self._set(key, argumentDict[key]);
      }
    }
  );

  if (self._get("localPath")) {
    var fileNameForKey = {
      "settings":   "settings.js",
      "routes":     "Routes.jsx",
      "scaffold":   "Scaffold.jsx"
    };

    Object.keys(fileNameForKey).forEach(
      function (key) {
        if (!self._has(key)) {
          var modulePath = self._get("localPath") + "/" + fileNameForKey[key];

          try {
            self._set(key, require(modulePath));

          } catch (error) {
            if (error.message == "Cannot find module '" + modulePath + "'") {
              if (optionalArguments.indexOf(key) === -1) {
                console.warn(error.message);

              } else {
                console.info(error.message + ".  It's optional, so don't worry - we'll use Ambidex's default!");
              }

            } else {
              throw error;
            }
          }
        }
      }
    );
  }

  requiredArguments.forEach(
    function (key) {
      if (!self._has(key)) {
        throw new Error("Ambidex requires `" + key + "` to be passed into its constructor");
      }
    }
  );

  // TODO: validate settings

  optionalArguments.forEach(
    function (key) {
      if (
           !self._has(key)
        && defaultForOptionalArgument[key] !== undefined
      ) {
        self._set(key, defaultForOptionalArgument[key]);
      }
    }
  );
};

Ambidex.prototype._initWebpack = function () {
  var self      = this;
  var settings  = self._get("settings");

  var webpackSettingsOptions  = {};

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    webpackSettingsOptions.devServerOrigin = "http://" + settings.HOST + ":" + settings.WEBPACK_PORT;

  } else {
    webpackSettingsOptions.minimizeFileSize = true;
  }

  self._webpackSettings = require("./webpackSettingsGetter.js")(webpackSettingsOptions);


  // These are the globals defined for the browser with Webpack
  var globalDefinitions = self._webpackSettings.plugins[0].definitions;
  var serverOverrides = {
    "IN_BROWSER":   false
  };

  // We need to declare their server-side counterparts:
  Object.keys(globalDefinitions).forEach(
    function (key, i, keys) {
      global[key] = serverOverrides.hasOwnProperty(key)
        ? serverOverrides[key]

        // Webpack `eval`s strings, so we do too
        : typeof globalDefinitions[key] === "string"
          ? eval(globalDefinitions[key])
          : globalDefinitions[key]
    }
  );


  self.webpack      = new Webpack(webpackSettings);
  self.webpack.run  = Promise.promisify(webpack.run);


  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    self.stack.use(
      app => request => request.call(app).then(
                          function (response) {
                            response.headers["Access-Control-Allow-Origin"] = "//" + settings.HOST + ":" + settings.WEBPACK_PORT;
                            return response;
                          }
                        )
    );
  } else {
    self._webpackRan = self.webpack.run().then(
      function (stats) {
        console.log(stats.toString());

        self._styleHtml  = readFileSync(self._webpackSettings.output.path + "styles.js");
        self._scriptHtml = readFileSync(self._webpackSettings.output.path + "jsx.js");

        return stats;
      }
    ).catch(
      function (error) {
        console.error("Error packing bundles with Webpack:");
        console.error(error);
      }
    );
  }
};

Ambidex.prototype._initStack = function () {
  self.stack = new mach.stack();
  self.stack.use(mach.logger);
  self.stack.use(mach.gzip);

  var middlewareInjector = self._get("middlewareInjector");
  if (middlewareInjector) {
    middlewareInjector(self.stack);
  }

  stack.serve(
    "*",
    self._processRequest
  );
};

Ambidex.prototype._processRequest = function(request) {
  var self      = this;
  var settings  = self._get("settings");

  var styleProp  = {};
  var scriptProp = {};

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    styleProp.src  = self._webpackSettings.output.publicPath + "styles.js";
    scriptProp.src = self._webpackSettings.output.publicPath + "jsx.js";
  } else {
    // Inline the source if we aren't using Hot Module Replacement to reduce
    // unneccesary requests
    styleProp.__html  = self._styleHtml;
    scriptProp.__html = self._scriptHtml;
  }

  return Promise.all(
    [
      ReactRouter.renderRoutesToString(
        self._get("routes"),
        request.path
      ),

      // If webpack is running, block til it's ready to return
      webpackRan
    ]
  ).then(
    function (resolvedPromises) {
      var renderedResult = resolvedPromises.shift();
      var webpackStats   = resolvedPromises.shift();

      return mach.html(
        [
          "<!DOCTYPE html>",

          // Running ReactRouter against the <html> element is buggy,
          // so we only render <Main> (which mounts to the <body>) with
          // ReactRouter and do the rest as static markup with <Scaffold>
          React.renderComponentToStaticMarkup(
            require("./generic/components/Scaffold.jsx")(
              {
                "favIconSrc": settings.FAV_ICON_URL,
                "style":      styleProp,
                "script":     scriptProp,
                "body":       {
                                "__html":   renderedResult.html
                              }
              }
            )
          )
        ].join("\n")
      );
    }
  ).catch(
    function (error) {
      console.log(error);

      return {
        "status":   error.httpStatus,
        "content": "ReactRouter errored."
      };
    }
  )
};

Ambidex.prototype._startServing = function () {
  var self      = this;
  var settings  = self._get("settings");

  try {
    mach.serve(
      stack,
      settings.VM_PORT || settings.PORT
    );

    if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
      WebpackDevServer.prototype.listen = Promise.promisify(WebpackDevServer.prototype.listen);

      self.webpackDevServer = new WebpackDevServer(
        self.webpack,
        {
          "hot":        true,
          "publicPath": self._webpackSettings.output.publicPath
        }
      );

      self.webpackDevServer.listen(
        settings.WEBPACK_PORT,
        settings.HOST
      ).then(
        function (result) {
          console.info("Started Webpack Dev Server on " + settings.HOST + ":" + settings.WEBPACK_PORT + "…");
        }
      ).catch(
        function (error) {
          console.error(error);
          process.exit();
        }
      );
    }

  } catch (error) {
    console.error("Couldn't start " + settings.NAME + " on port " + settings.PORT + " because");
    console.error(error);
  }
};

module.exports = Ambidex;
