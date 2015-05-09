require("babel/polyfill");

var React                = require("react/addons");
var ReactRouter          = require("react-router");
var Funx                 = require("funx");
var Immutable            = require("immutable");
var injectTapEventPlugin = require("react-tap-event-plugin");

var createHandlerWithAmbidexContext = require("./createHandlerWithAmbidexContext.jsx");

var HandlerWithAmbidexContext = createHandlerWithAmbidexContext(
  // enable/disable features based on what settings the developer has passed in
  {
    "funx":   Boolean(__ambidexPaths.funxDefinitions)
  }
);

var containerSelector = "body";


injectTapEventPlugin();

if (__ambidexPaths.funxDefinitions) {
  var funxDefinitions = Funx.addons.addRouterStateStoreToFunxDefinitions(
    require(__ambidexPaths.funxDefinitions)
  );

  funxDefinitions.mixin = Object.assign(
    {
      "settings": __ambidexSettings
    },

    funxDefinitions.mixin
  );

  funxDefinitions.serializedStoreState = __ambidexStoreStateByName;

  var funx = new Funx(funxDefinitions);
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
        React.render(
          <HandlerWithAmbidexContext
            settings  = { __ambidexSettings }
            setTitle  = {
                          title => {
                            document.title = title
                          }
                        }

            { ...{Handler, funx} }
          />,

          container
        );

        if (initialRenderComplete) {
          funx.actions.routerStateChanged(
            {
              "routerState":  Immutable.fromJS(routerState.params)
            }
          );
        }
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
