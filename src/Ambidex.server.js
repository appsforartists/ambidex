// Adds `Promise.promisify`
require('prfun');

var fs                = require("fs");

fs = {
  "exists":           // Can't use Promisify because fs.exists doesn't have an error callback
                      (path) => {
                        return new Promise(
                          (resolve) => {
                            return require("fs").exists(path, resolve);
                          }
                        );
                      },

  "readFile":         Promise.promisify(fs.readFile)
};

var path              = require("path");

var Funx              = require("funx");
var Immutable         = require("immutable");
var Lazy              = require("lazy.js");
var mach              = require("mach");
var React             = require("react/addons");
var ReactRouter       = require("react-router");
var Webpack           = require("webpack");
var WebpackDevServer  = require("webpack-dev-server");

var toCamelCase       = require("to-camel-case");

if (WebpackDevServer)
  WebpackDevServer.prototype.listen = Promise.promisify(WebpackDevServer.prototype.listen);

var createWebpackSettings           = require("./createWebpackSettings");
var createHandlerWithAmbidexContext = require("./createHandlerWithAmbidexContext");
var utilities                       = require("./addons/utilities");

function Ambidex (
  {
    settings,
    middlewareInjector
  }
) {
  var  rejectInitializationPromise;
  var resolveInitializationPromise;

  var initializationPromise = new Promise(
    (resolve, reject) => {
      rejectInitializationPromise = (error) => {
        console.error(error.stack);
        reject(error);
      };

      resolveInitializationPromise = resolve;
    }
  );

  initializationPromise.ambidexInProgress = this;

  try {
    if (this === global)
      throw new Error("You forgot the `new` in `new Ambidex(…).then(ambidex => …)`");

    if (!settings)
      throw new Error("Ambidex requires a settings dictionary to be passed in:\n\t`new Ambidex({\"settings\": {…}}).then(ambidex => …)`");

    this._set("settings",           settings);
    this._set("middlewareInjector", middlewareInjector);


    if (settings.SHORT_NAME)
      process.title = settings.SHORT_NAME;

    this._verifyPaths(

    ).then(
      () => {
        this._initStack();
        this._initWebpack();

        return this._startServing().then(
          () => resolveInitializationPromise(this)
        );
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

Ambidex.prototype._verifyPaths = function () {
  /*  - Converts all FILESYSTEM_PATHS to absolute,
   *  - Makes sure they all exist,
   *  - Stores them on this with `this._set("routesPath", FILESYSTEM_PATHS["ROUTES"])`, and
   *  - `this.set("routes, require(ROUTES_PATH))`
   */

  var settings  = this._get("settings");
  var paths     = settings.FILESYSTEM_PATHS;

  paths["STYLES"] = paths["STYLES"] || __dirname + "/defaults/styles/init.css";

  [
    "BASE",
    "BUNDLES",
  ].forEach(
    (key) => {
      if (paths[key]) {
        paths[key] = paths[key].endsWith("/")
          ? settings.FILESYSTEM_PATHS[key]
          : settings.FILESYSTEM_PATHS[key] + "/";
      }
    }
  );

  var basePath  = paths["BASE"];

  return Promise.all(
    Lazy(paths).omit(["BASE"]).map(
      (path, name) => {
        path = path.startsWith("/")
          ? path
          : basePath + path;

        return fs.exists(path).then(
          pathIsValid =>  {
            if (pathIsValid) {
              this._set(toCamelCase(name) + "Path", path);

            } else {
              throw new Error("Ambidex could not find `" + path + "`.  Make sure routes.FILESYSTEM_PATHS[\"BASE\"] and [\"" + name + "\"] are set correctly.");
            }
          }
        );
      }
    ).toArray()

  ).then(
    () => {
      this._set("basePath", basePath);

      this._reloadExternalModules();
    }
  );
};

Ambidex.prototype._reloadExternalModules = function () {
  this._set(
    "Scaffold",
    require(this._get("scaffoldPath") || __dirname + "/defaults/Scaffold.jsx")
  );

  this._set(
    "routes",

    require(this._get("routesPath"))
  );

  // optional paths go here:
  [
    "funxDefinitions",
  ].forEach(
    objectName => {
      var path = this._get(objectName + "Path");

      if (path) {
        this._set(
          objectName,
          require(path)
        );
      }
    }
  );
};

Ambidex.prototype._initWebpack = function () {
  var settings = this._get("settings");

  var webpackSettingsOptions  = {
    "paths":  {
                "JSX":      __dirname + "/render.client.js",
                "STYLES":   this._get("stylesPath"),
                "BUNDLES":  this._get("bundlesPath"),
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
                              "funxDefinitions",
                            ]
                          ).map(
                            key => [key, JSON.stringify(this._get(key + "Path")) || "null"]
                          ).toObject()
  }

  // Make sure everything in `settings` is JSON-safe, so we fail consistently if we're passed unJSONifyable data
  settings = this._set("settings", JSON.parse(webpackSettingsOptions.constants.__ambidexSettings));

  this._webpackSettings = createWebpackSettings(webpackSettingsOptions);

  this.webpack      = new Webpack(this._webpackSettings);
  this.webpack.run  = Promise.promisify(this.webpack.run);

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {
    this.stack.use(
      app => request => request.call(app).then(
                          (response) => {
                            response.headers["Access-Control-Allow-Origin"] = request.protocol + "//" + settings.HOST + ":" + settings.WEBPACK_PORT;
                            return response;
                          }
                        )
    );

    // There's no need to manually wait for Webpack to be finshed if the dev server
    // is handling requests, so put a no-op Promise here.
    this._webpackRan = Promise.resolve(null);

  } else {
    this._webpackRan = this.webpack.run().then(
      (stats) => {
        console.log(stats.toString());

        var bundlesPath = this._get("bundlesPath");

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
        this._styleHTML  = resolvedPromises[1].toString();
        this._scriptHTML = resolvedPromises[2].toString();

        // pass webpackStats through, since our other return values (HTML) are already exposed on this
        return resolvedPromises[0];
      }
    ).catch(
      (error) => {
        console.error("Error packing bundles with Webpack:");
        console.error(error.stack);
      }
    );
  }
};

Ambidex.prototype._initStack = function () {
  var settings = this._get("settings");

  this.stack = new mach.stack();
  this.stack.use(mach.logger);
  this.stack.use(mach.gzip);
  this.stack.use(mach.charset, "utf-8");

  var middlewareInjector = this._get("middlewareInjector");
  if (middlewareInjector) {
    middlewareInjector(this.stack);
  }

  if (settings.FAV_ICON_URL) {
    this.stack.get(
      "/favicon.ico",
      connection => connection.redirect(
                      301,
                      settings.FAV_ICON_URL
                    )
    );
  }

  this.stack.route(
    "*",
    this._getRequestProcessor()
  );
};

// mach will hijack the `this` binding of a request processor
// so we return a closure to preserve access to `this`
Ambidex.prototype._getRequestProcessor = function () {
  var settings            = this._get("settings");
  var Scaffold            = this._get("Scaffold");
  var funxDefinitionsPath = this._get("funxDefinitionsPath");

  if (funxDefinitionsPath) {
    var funxDefinitions = Funx.addons.addRouterStateStoreToFunxDefinitions(
      require(funxDefinitionsPath)
    );

    funxDefinitions.mixin = Object.assign(
      {
        settings
      },

      funxDefinitions.mixin
    );

    console.assert(
      funxDefinitions.storeDefinitions.ephemeral.readyToRender,
      "You must define a 'readyToRender' Funx store so Ambidex knows when your data has loaded."
    );
  }

  return (connection) => {
    var bundlesURL = this._webpackSettings.output.publicPath;

    // mach won't wait for a result unless we return a promise,
    // so make sure we have one
    var routerRan = new Promise(
      (resolve, reject) => {
        try {
          ReactRouter.run(
            this._get("routes"),
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
        this._webpackRan
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
          scaffoldProps["style"].__html  = this._styleHTML;
          scaffoldProps["script"].__html = this._scriptHTML;
        }

        // Anything that changes here probably needs to change in render.client.js too

        var maybeWaitingForReadyToRender = Promise.resolve(null);

        var HandlerWithAmbidexContext = createHandlerWithAmbidexContext(
          {
            "funx":   Boolean(funxDefinitionsPath)
          }
        );

        if (funxDefinitions) {
          var funx = new Funx(funxDefinitions);

          funx.actions.routerStateChanged(
            {
              "routerState":  Immutable.fromJS(routerState.params)
            }
          );

          maybeWaitingForReadyToRender = utilities.promiseFromTruthyObservable(funx.stores.readyToRender);
        }

        return maybeWaitingForReadyToRender.then(
          () => {
            // There's no React lifecycle hook that fires on the server post-render
            // so we (sadly) have to fake one here to get titles to work properly.
            var serverDidRenderCallback;

            scaffoldProps["body"].__html = React.renderToString(
              <HandlerWithAmbidexContext
                setTitle                  = {
                                              title => {
                                                scaffoldProps["title"] = title;
                                              }
                                            }

                listenForServerDidRender  = {
                                              callback => {
                                                serverDidRenderCallback = callback;
                                              }
                                            }

                { ...{Handler, settings, funx} }
              />
            );

            if (serverDidRenderCallback)
              serverDidRenderCallback();

            if (funx)
              scaffoldProps["storeStateByName"] = funx.getSerializedStoreState();

            return connection.html(
              [
                "<!DOCTYPE html>",

                React.renderToStaticMarkup(
                  <Scaffold
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
          "content": "An error has occurred.  Check your server logs."
        };
      }
    )
  }
};

Ambidex.prototype._startServing = function () {
  return Promise.all(
    [
      this._startServingWebpack(),
      this._startServingStack(),
    ]
  );
};

Ambidex.prototype._startServingStack = function () {
  var settings = this._get("settings");


  // mach.serve isn't async, but we make a promise anyway because Webpack is, and we want to be consistent.
  return new Promise(
    (resolve, reject) => {
      var isAlreadyBeingServed = Boolean(
            this._isBeingServedExternally

        ||  (
                 this.stack.nodeServer
              && this.stack.nodeServer.address()
            )
      );

      try {
        if (!isAlreadyBeingServed) {
          var port = settings.VM_PORT || settings.PORT;

          console.info(`Starting mach for ${ settings.NAME } on ${ settings.HOST }:${ port }…`);

          this.stack.nodeServer = mach.serve(
            this.stack,
            settings.VM_PORT || settings.PORT
          );
        }

        resolve();

      } catch (error) {
        reject(error);
      }
    }
  );
};

Ambidex.prototype._startServingWebpack = function () {
  var settings = this._get("settings");

  if (settings.ENABLE_HOT_MODULE_REPLACEMENT) {

    this.webpackDevServer = new WebpackDevServer(
      this.webpack,
      {
        "hot":        true,
        "publicPath": this._webpackSettings.output.publicPath
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

    var firstCompileCompleted;

    this.webpack.plugin(
      "after-compile",

      (compilation, callWhenFinished) => {
        if (firstCompileCompleted) {
          // Don't crash the server trying to reload a malformed module
          if (compilation.errors.length === 0) {
            var basePath = this._get("basePath");

            Object.keys(require.cache).forEach(
              path => {
                if (path.includes(basePath)) {
                  if (path.replace(basePath, "").indexOf("node_modules") === -1) {
                    delete require.cache[path]
                  }
                }
              }
            );

            this._reloadExternalModules();
          }
        } else {
          firstCompileCompleted = true;
        }

        callWhenFinished();
      }
    );

    return this.webpackDevServer.listen(
      settings.WEBPACK_PORT
    ).then(
      (result) => {
        console.info(`Starting Webpack Dev Server for ${ settings.NAME } on ${ settings.HOST }:${ settings.WEBPACK_PORT }…`);
      }
    );
  } else {
    return null;
  }
};

module.exports = Ambidex;
