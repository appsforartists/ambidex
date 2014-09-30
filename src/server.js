require("node-jsx").install(
  {
    "extension":  ".jsx",
    "harmony":    true
  }
);

// Adds `Promise.promisify`
require('prfun');

var fs                      = require("fs");

fs = {
  "exists":                 // Can't use Promisify because fs.exists can't error
                            function (path) {
                              return new Promise(
                                function (resolve) {
                                  return require("fs").exists(path, resolve);
                                }
                              );
                            },

  "readFile":               Promise.promisify(fs.readFile)
};

var mach                    = require("mach");
var Lazy                    = require("lazy.js");
var Webpack                 = require("webpack");
var WebpackDevServer        = require("webpack-dev-server");

// See _importModulesFromCaller
var React, ReactRouter;

function Ambidex (argumentDict) {
  var self = this;

  if (self === global)
    throw new Error("You forgot the `new` in `new Ambidex(…)`!");

  if (!argumentDict || !arguments.length === 1)
    throw new Error("Ambidex requires an argument dictionary to be passed in.");

  self._initFromArgumentDict(argumentDict);


  var settings  = self._get("settings");

  self._verifyPaths(

  ).then(
    () =>  self._initStack()

  ).then(
    () =>  self._initWebpack()

  ).then(
    () =>  self._importModulesFromCaller()

  ).then(
    () => {
            if (self._get("shouldServeImmediately")) {
              process.title = settings.SHORT_NAME;
              return self._startServing();
            }
          }
  ).catch(
    (error) =>  {
                  console.error(error);
                  throw error;
                }
  );
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
    "settings"
  ];

  var defaultsForOptionalArguments = {
    "shouldServeImmediately":   true,
    "middlewareInjector":       undefined
  };

  var optionalArguments = Object.keys(defaultsForOptionalArguments);


  Lazy(argumentDict).each(
    function (value, key) {
      if (
           Lazy(requiredArguments).contains(key)
        || Lazy(optionalArguments).contains(key)
      ) {
        self._set(key, value);

      } else {
        console.warn("Ambidex doesn't know what to do with {\"" + key + "\": " + value + "}");
      }
    }
  );

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
        && defaultsForOptionalArguments[key] !== undefined
      ) {
        self._set(key, defaultsForOptionalArguments[key]);
      }
    }
  );
};

Ambidex.prototype._verifyPaths = function () {
  /*  - Converts all FILESYSTEM_PATHS to absolute,
   *  - Makes sure they all exist,
   *  - Stores them on self with `self._set("routesPath", FILESYSTEM_PATHS["ROUTES"])`, and
   *  - `self.set("routes, require(ROUTES_PATH))`
   */

  var self      = this;
  var settings  = self._get("settings");
  var paths     = settings.FILESYSTEM_PATHS;

  [
    "BASE",
    "BUNDLES",
    "MODULES",
  ].forEach(
    (key) =>  paths[key] = paths[key].endsWith("/")
                ? settings.FILESYSTEM_PATHS[key]
                : settings.FILESYSTEM_PATHS[key] + "/"
  );

  var basePath  = paths["BASE"];

  return Promise.all(
    Lazy(paths).omit("BASE").map(
      (path, name) =>   {
                          path = path.startsWith("/")
                            ? path
                            : basePath + path;

                          return fs.exists(path).then(
                            pathIsValid =>  {
                                              if (pathIsValid) {
                                                self._set(name.toLowerCase() + "Path", path);

                                              } else {
                                                throw new Error("Ambidex could not find `" + path + "`.  Make sure routes.FILESYSTEM_PATHS[\"BASE\"] and [\"" + name + "\"] are set correctly.");
                                              }
                                            }
                          );
                        }
    ).toArray()
  ).then(
    () => {
            self._set("basePath", basePath)
            self._set("routes", require(self._get("routesPath")));
          }
  );
};

Ambidex.prototype._initWebpack = function () {
  var self      = this;
  var settings  = self._get("settings");

  var webpackSettingsOptions  = {
    "paths":    {
                  "JSX":      __dirname + "/client.js",
                  "BASE":     self._get("basePath"),
                  "STYLES":   self._get("stylesPath"),
                  "BUNDLES":  self._get("bundlesPath"),
                }
  };

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    webpackSettingsOptions.devServerOrigin = "http://" + settings.HOST + ":" + settings.WEBPACK_PORT;

  } else {
    webpackSettingsOptions.minimizeFileSize = true;
  }

  if (settings.SERVER_ONLY_MODULE_NAMES)
    webpackSettingsOptions.ignoredModuleNames = settings.SERVER_ONLY_MODULE_NAMES;

  var constants = settings.GLOBAL_CONSTANTS;

  if (constants) {
    var sharedConstants = constants["SHARED"];
    var serverConstants = constants["SERVER"];
    var clientConstants = constants["CLIENT"];

    if (
         !constants.hasOwnProperty("SHARED")
      && !constants.hasOwnProperty("SERVER")
      && !constants.hasOwnProperty("CLIENT")
    ) {
      sharedConstants = constants;
    }

    sharedConstants["ROUTES_PATH"]  = self._get("routesPath");
    sharedConstants["MODULES_PATH"] = self._get("modulesPath");

    webpackSettingsOptions.constants = Lazy(clientConstants).defaults(sharedConstants).map(
      // Webpack `eval`s its constants, so we have to stringify them first
      (value, key) => [key, JSON.stringify(value)]
    ).toObject();

    Lazy(serverConstants).defaults(sharedConstants).each(
      // Run the constants through JSON to make sure you don't end up with
      // obscure differences between the client and server
      (value, key) => {
                        global[key] = JSON.parse(JSON.stringify(value));

                        // Lazy will bail the first time it sees a false, so
                        // we explicitly return true to force it to call everything
                        return true;
                      }
    );
  }

  self._webpackSettings = require("./webpackSettingsGetter.js")(webpackSettingsOptions);

  self.webpack      = new Webpack(self._webpackSettings);
  self.webpack.run  = Promise.promisify(self.webpack.run);

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    self.stack.use(
      app => request => request.call(app).then(
                          function (response) {
                            response.headers["Access-Control-Allow-Origin"] = request.protocol + "//" + settings.HOST + ":" + settings.WEBPACK_PORT;
                            return response;
                          }
                        )
    );
  } else {
    self._webpackRan = self.webpack.run().then(
      function (stats) {
        console.log(stats.toString());

        var bundlesPath = self._get("bundlesPath");

        self._styleHtml  = fs.readFileSync(bundlesPath + "/styles.js");
        self._scriptHtml = fs.readFileSync(bundlesPath + "/jsx.js");

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
  var self = this;

  self.stack = new mach.stack();
  self.stack.use(mach.logger);
  self.stack.use(mach.gzip);

  var middlewareInjector = self._get("middlewareInjector");
  if (middlewareInjector) {
    middlewareInjector(self.stack);
  }

  self.stack.route(
    "*",
    self._getRequestProcessor()
  );
};

// mach will hijack the `this` binding of a request processor
// so we return a closure to preserve access to `self`
Ambidex.prototype._getRequestProcessor = function () {
  var self      = this;

  return function (request) {
    var settings  = self._get("settings");

    var styleProp  = {};
    var scriptProp = {};

    var bundlesURL = self._webpackSettings.output.publicPath;

    if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
      styleProp.src  = bundlesURL + "styles.js";
      scriptProp.src = bundlesURL + "jsx.js";
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
        self._webpackRan
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
              require("./Scaffold.jsx")(
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
        console.error(error);

        return {
          "status":   error.httpStatus,
          "content": "ReactRouter errored."
        };
      }
    )
  }
};

Ambidex.prototype._importModulesFromCaller = function () {
  var MODULES_PATH = global["MODULES_PATH"];

  // !!!!   IMPORTANT !!!!!!
  // Only import things that have been `var` at the top of the module!!!

  React       = require(MODULES_PATH + "react");
  ReactRouter = require(MODULES_PATH + "react-router");
};

Ambidex.prototype._startServing = function () {
  var self      = this;
  var settings  = self._get("settings");

  try {
    mach.serve(
      self.stack,
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
