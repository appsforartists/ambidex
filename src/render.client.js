require("./polyfills.js");

var React                = require("react/addons");
var ReactRouter          = require("react-router");
var Reflux               = require("isomorphic-reflux");
var injectTapEventPlugin = require("react-tap-event-plugin");

var callActionsForRouterState       = require("./callActionsForRouterState.js");
var createHandlerWithAmbidexContext = require("./createHandlerWithAmbidexContext.jsx");

if (__ambidexPaths.refluxActionsForRouterState)
  var actionsForRouterState = require(__ambidexPaths.refluxActionsForRouterState);

var HandlerWithAmbidexContext = createHandlerWithAmbidexContext(
  // enable/disable features based on what settings the developer has passed in
  {
    "reflux":   Boolean(__ambidexPaths.refluxDefinitions)
  }
);

var containerSelector = "body";


injectTapEventPlugin();

if (__ambidexPaths.refluxDefinitions) {
  var reflux = new Reflux(
    require(__ambidexPaths.refluxDefinitions)
  );

  // not using Lazy to keep the byte-count small for those who aren't using it elsewhere
  Object.keys(reflux.actions).forEach(
    actionName => {
      reflux.actions[actionName].sync = true;
    }
  );

  Object.keys(reflux.stores).forEach(
    storeName => {
      reflux.stores[storeName].settings = __ambidexSettings;
    }
  );

  reflux.hydrate(__ambidexStoreStateByName);
}

var initialRenderComplete;

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return initialRenderComplete = false;

  } else {
    ReactRouter.run(
      require(__ambidexPaths.routes),
      ReactRouter.HistoryLocation,

      // Anything that changes here needs to change in Ambidex.server.js too
      (Handler, routerState) => {
        var render = function () {
          React.render(
            <HandlerWithAmbidexContext
              settings  = { __ambidexSettings }
              setTitle  = {
                            title => {
                              document.title = title
                            }
                          }

              { ...{Handler, reflux} }
            />,

            container
          );
        };

        if (actionsForRouterState && initialRenderComplete) {
          callActionsForRouterState(
            {
              reflux,
              actionsForRouterState,
              routerState,
            }
          ).then(render);
        }

        render();
      }
    );

    return initialRenderComplete = true;
  }
};

if (!mountReact()) {
  window.addEventListener(
    "DOMContentLoaded",
    mountReact
  );
}
