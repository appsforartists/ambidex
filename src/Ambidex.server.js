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
  "exists":                 // Can't use Promisify because fs.exists doesn't have an error callback
                            function (path) {
                              return new Promise(
                                function (resolve) {
                                  return require("fs").exists(path, resolve);
                                }
                              );
                            },

  "readFile":               Promise.promisify(fs.readFile)
};

var path                    = require("path");

var React                   = require("react/addons");
var ReactRouter             = require("react-router");
var mach                    = require("mach");
var Lazy                    = require("lazy.js");
var Reflux                  = require("isomorphic-reflux");
var toCamelCase             = require("to-camel-case");
var Webpack                 = require("webpack");
var WebpackDevServer        = require("webpack-dev-server");

var createWebpackSettings           = require("./createWebpackSettings.js");
var createHandlerWithAmbidexContext = require("./createHandlerWithAmbidexContext.jsx");
var callActionsForRouterState       = require("./callActionsForRouterState.js");

function Ambidex (argumentDict) {
  var self = this;

  var  rejectInitializationPromise;
  var resolveInitializationPromise;

  var initializationPromise = new Promise(
    function (resolve, reject) {
      rejectInitializationPromise = function (error) {
        console.error(error.stack);
        reject(error);
      };

      resolveInitializationPromise = resolve;
    }
  );

  try {
    if (self === global)
      throw new Error("You forgot the `new` in `new Ambidex(…)`!");

    if (!argumentDict || !arguments.length === 1)
      throw new Error("Ambidex requires an argument dictionary to be passed in.");

    self._initFromArgumentDict(argumentDict);


    var settings  = self._get("settings");

    self._verifyPaths(

    ).then(
      () => {
              self._initStack();
              self._initWebpack();

              if (self._get("shouldServeImmediately")) {
                process.title = settings.SHORT_NAME;
                self._startServing().then(
                  () => resolveInitializationPromise(self)
                );

              } else {
                resolveInitializationPromise(self);
              }
            }
    ).catch(
      error =>  rejectInitializationPromise(error)
    );

    return initializationPromise;

  } catch (error) {
    rejectInitializationPromise(error);
  }
}

Ambidex.prototype._has = function (key) {
  return this.hasOwnProperty("_" + key);
};

Ambidex.prototype._get = function (key) {
  return this["_" + key];
};

Ambidex.prototype._set = function (key, value) {
  return this["_" + key] = value;
}

Ambidex.prototype._initFromArgumentDict = function (argumentDict) {
  var self = this;

  var requiredArguments = [
    "settings"
  ];

  var defaultsForOptionalArguments = {
    "shouldServeImmediately":   true,
    "middlewareInjector":       undefined,
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
  ].forEach(
    (key) =>  paths[key] = paths[key].endsWith("/")
                ? settings.FILESYSTEM_PATHS[key]
                : settings.FILESYSTEM_PATHS[key] + "/"
  );

  var basePath  = paths["BASE"];

  return Promise.all(
    Lazy(paths).omit("BASE").map(
      (path, name) => {
        path = path.startsWith("/")
          ? path
          : basePath + path;

        return fs.exists(path).then(
          pathIsValid =>  {
            if (pathIsValid) {
              self._set(toCamelCase(name) + "Path", path);

            } else {
              throw new Error("Ambidex could not find `" + path + "`.  Make sure routes.FILESYSTEM_PATHS[\"BASE\"] and [\"" + name + "\"] are set correctly.");
            }
          }
        );
      }
    ).toArray()

  ).then(
    () => {
      self._set("basePath", basePath);

      self._reloadExternalModules();
    }
  );
};

Ambidex.prototype._reloadExternalModules = function () {
  var self = this;

  self._set(
    "Scaffold",
    require(self._get("scaffoldPath") || __dirname + "/Scaffold.jsx")
  );

  self._set(
    "routes",

    require(self._get("routesPath"))
  );

  [
    "refluxDefinitions",
    "refluxActionsForRouterState",
  ].forEach(
    objectName => {
      var path = self._get(objectName + "Path");

      if (path) {
        self._set(
          objectName,
          require(path)
        );
      }
    }
  );
};

Ambidex.prototype._initWebpack = function () {
  var self      = this;
  var settings  = self._get("settings");

  var webpackSettingsOptions  = {
    "paths":    {
                  "JSX":      __dirname + "/render.client.js",
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

  /*  Webpack constants are effectively string replacements.  Webpack looks for the keys that appear below and
   *  substitutes them with the values on the right.  Therefore, the values must be stringified.  Otherwise:
   *
   *      "__constant":   "my string"     // the quotation marks create a string, but the string itself contains none
   *      …
   *      var myVariable = __constant;
   *
   *  would result in a syntax error:
   *
   *      var myVariable = my string;
   *
   *  For the same reason, we must stringify each path individually.  Otherwise, Webpack would be able to replace
   *  `__ambidexPaths`, but would choke on `__ambidexPaths.routes`, as it wouldn't understand how to parse the
   *  JSONified structure `__ambidexPaths` contained.
   *
   *  See https://github.com/webpack/webpack/issues/634#issuecomment-67832382
   */

  webpackSettingsOptions.constants = {
    "__ambidexSettings":  JSON.stringify(settings),
    "__ambidexPaths":     Lazy(
                            [
                              "routes",
                              "refluxDefinitions",
                              "refluxActionsForRouterState",
                            ]
                          ).map(
                            key => [key, JSON.stringify(self._get(key + "Path")) || "null"]
                          ).toObject()
  }

  // Make sure everything in `settings` is JSON-safe, so we fail consistently if we're passed unJSONifyable data
  settings = self._set("settings", JSON.parse(webpackSettingsOptions.constants.__ambidexSettings));

  self._webpackSettings = createWebpackSettings(webpackSettingsOptions);

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

// TODO: resolve this for real in _startServingWebpack
    // put a no-op promise here, so calls to _webpackRan.then don't fail later-on
    self._webpackRan = Promise.resolve(null);

  } else {
    self._webpackRan = self.webpack.run().then(
      (stats) =>  {
                    console.log(stats.toString());

                    var bundlesPath = self._get("bundlesPath");

                    return [
                      stats,

                      fs.readFile(
                        path.resolve(bundlesPath, "styles.js")
                      ),

                      fs.readFile(
                        path.resolve(bundlesPath, "jsx.js")
                      )
                    ];
                  }
    ).then(
      promises => Promise.all(promises)

    ).then(
      (resolvedPromises) => {
                              self._styleHTML  = resolvedPromises[1];
                              self._scriptHTML = resolvedPromises[2];

                              // pass webpackStats through, since our other return values (HTML) are already exposed on self
                              return resolvedPromises[0];
                            }
    ).catch(
      function (error) {
        console.error("Error packing bundles with Webpack:");
        console.error(error.stack);
      }
    );
  }
};

Ambidex.prototype._initStack = function () {
  var self = this;

  self.stack = new mach.stack();
  self.stack.use(mach.logger);
  self.stack.use(mach.gzip);
  self.stack.use(mach.charset, "utf-8");

// TODO: favicon.ico

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
  var self = this;

  var settings              = self._get("settings");

  return function (connection) {
    var bundlesURL = self._webpackSettings.output.publicPath;

    var routes                = self._get("routes");
    var refluxDefinitions     = self._get("refluxDefinitions");
    var actionsForRouterState = self._get("refluxActionsForRouterState");

    var HandlerWithAmbidexContext = createHandlerWithAmbidexContext(
      {
        "reflux":   Boolean(self._get("refluxDefinitionsPath"))
      }
    );

    // mach won't wait for a result unless we return a promise,
    // so make sure we have one
    var routerRan = new Promise(
      (resolve, reject) => {
        try {
          ReactRouter.run(
            routes,
            connection.location.path,
            (Handler, routerState) => resolve([Handler, routerState])
          );

        } catch (error) {
          reject(error);
        }
      }
    );

    return Promise.all(
      [
        routerRan,
        self._webpackRan
      ]
    ).then(
      // V8 doesn't seem to like resolving multiple values, so we have to wrap them in an extra array =\
      ([[Handler, routerState]], webpackStats) => {
        // Running ReactRouter against the <html> element is buggy, so we only
        // render <body> with ReactRouter and do the rest as static markup with
        // <Scaffold>

        var scaffoldProps = {
          "title":      "",
          "favIconSrc": settings.FAV_ICON_URL,
          "style":      {},
          "script":     {},
          "body":       {},
        };

        if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
          scaffoldProps["style"].src  = bundlesURL + "styles.js";
          scaffoldProps["script"].src = bundlesURL + "jsx.js";

        } else {
          // Inline the source if we aren't using Hot Module Replacement to reduce
          // unneccesary requests
          scaffoldProps["style"].__html  = self._styleHTML;
          scaffoldProps["script"].__html = self._scriptHTML;
        }

        // Anything that changes here probably needs to change in render.client.js too

        var reflux;
        var maybeWaitingForReflux = Promise.resolve(null);

        if (refluxDefinitions) {
          reflux = new Reflux(refluxDefinitions);

          Lazy(reflux.stores).each(
            store => store.settings = settings

            // could also have stores that opt-in automatically backed by memcached here
          );

          if (actionsForRouterState) {
            maybeWaitingForReflux = callActionsForRouterState(
              {
                reflux,
                actionsForRouterState,
                routerState,
              }
            );
          }
        }

        return maybeWaitingForReflux.then(
          () => {
            // There's no React lifecycle hook that fires on the server post-render
            // so we (sadly) have to fake one here to get titles to work properly.
            var serverDidRenderCallback;

            scaffoldProps["body"].__html = React.renderToString(
              <HandlerWithAmbidexContext
                setTitle                  = {
                                              function (title) {
                                                scaffoldProps["title"] = title;
                                              }
                                            }

                listenForServerDidRender  = {
                                              function (callback) {
                                                serverDidRenderCallback = callback;
                                              }
                                            }

                { ...{Handler, settings, reflux} }
              />
            );

            if (serverDidRenderCallback)
              serverDidRenderCallback();

            if (reflux)
              scaffoldProps["storeStateByName"] = reflux.dehydrate();

            return connection.html(
              [
                "<!DOCTYPE html>",

                React.renderToStaticMarkup(
                  <self._Scaffold
                    { ...scaffoldProps }
                  />
                )
              ].join("\n")
            );
          }
        );
      }
    ).catch(
      error => {
        console.error(error.stack);

        return {
          "status":   error.httpStatus || 500,
          "content": "ReactRouter errored."
        };
      }
    )
  }
};

Ambidex.prototype._startServing = function () {
  var self = this;

  return Promise.all(
    [
      self._startServingWebpack(),
      self._startServingStack(),
    ]
  );
};

Ambidex.prototype._startServingStack = function () {
  var self      = this;
  var settings  = self._get("settings");

  // mach.serve isn't async, but we make a promise anyway because Webpack is, and we want to be consistent.
  return new Promise(
    function (resolve, reject) {

      try {
        mach.serve(
          self.stack,
          settings.VM_PORT || settings.PORT
        );

        resolve();

      } catch (error) {
        reject(error);
      }
    }
  );
};

Ambidex.prototype._startServingWebpack = function () {
  var self      = this;
  var settings  = self._get("settings");

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    WebpackDevServer.prototype.listen = Promise.promisify(WebpackDevServer.prototype.listen);

    self.webpackDevServer = new WebpackDevServer(
      self.webpack,
      {
        "hot":        true,
        "publicPath": self._webpackSettings.output.publicPath
      }
    );

    /*  The function below reloads the server's copies of user-supplied code
     *  whenever HMR is triggered.
     *
     *  There are many ways we could do this:
     *
     *  One approach would be to listen for "done" and purge whatever modules
     *  were built (or cached) by Webpack, but that leads to instability in
     *  modules like ReactRouter and Mach that aren't designed to be reloaded
     *  in the same process.
     *
     *  Another approach would be to just erase everything in require.cache.
     *  Not only is that inefficient, but it also creates a memory leak that
     *  locks up Node.
     *
     *  Therefore, the approach we're using is to erase anything in the
     *  user-supplied basePath that isn't a node module.  If the user is editing
     *  code in multiple modules, they'll have to restart the server for the time
     *  being, but for the general case, this provides HMR for server-rendered
     *  code (not just the client-rendered HMR we get out-of-the-box with
     *  Webpack) in a safe and reliable way.
     */

    self.webpack.plugin(
      "compile",
      // should probably be "watch-run", but if we listen for that
      // watching stops happening after the first pass

      function () {
        var basePath = self._get("basePath");

        Object.keys(require.cache).forEach(
          path => {
            if (path.contains(basePath)) {
              if (path.replace(basePath, "").indexOf("node_modules") === -1) {
                delete require.cache[path]
              }
            }
          }
        );

        self._reloadExternalModules();
      }
    );


    return self.webpackDevServer.listen(
      settings.WEBPACK_PORT,
      settings.HOST
    ).then(
      function (result) {
        console.info("Started Webpack Dev Server on " + settings.HOST + ":" + settings.WEBPACK_PORT + "…");
      }
    );
  } else {
    return null;
  }
};

module.exports = Ambidex;
