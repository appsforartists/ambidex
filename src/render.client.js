require("babel/polyfill");

var Ambidex              = require("ambidex");
var React                = require("react/addons");
var ReactRouter          = require("react-router");
var Immutable            = require("immutable");
var injectTapEventPlugin = require("react-tap-event-plugin");

var {
  Reactor
} = require("experimental-nuclear-js");

var createHandlerWithAmbidexContext = require("./createHandlerWithAmbidexContext.jsx");


injectTapEventPlugin();

var containerSelector = "body";

var HandlerWithAmbidexContext = createHandlerWithAmbidexContext(
  // enable/disable features based on what settings the developer has passed in
  {
    "nuclear":  Boolean(__ambidexPaths.nuclearDefinitions)
  }
);

var reactor;
var router = ReactRouter.create(
  {
    "routes":   require(__ambidexPaths.routes),
    "location": ReactRouter.HistoryLocation,
  }
);

if (__ambidexPaths.nuclearDefinitions) {
  function createReactor () {
    // Anything that changes here needs to change in Ambidex.server.js too

    var result = new Reactor(
      {
        "debug":      NODE_ENV !== "production",
        "ambidex":    require("./nuclearDefinitions"),

        ...require(__ambidexPaths.nuclearDefinitions),
      }
    );

    result.ambidex.actions.redirect = function (
      {
        path,
        routeName,
        params        = {},
        query         = {},
        clearReactor  = false,
      }
    ) {
      if (clearReactor) {
        reactor.dispatch = Ambidex.addons.utilities.noOp;
        reactor = createReactor();
      }

      if (path) {
        router.transitionTo(path);

      } else {
        router.transitionTo(
          routeName,
          params,
          query
        );
      }
    };

    result.ambidex.actions.requireAuthentication = function (
      {
        routeName = "login",
        params    = {},
        query     = {},
        next,
      } = {}
    ) {
      if (next || !query.next)
        query.next = router.getCurrentPath();

      result.ambidex.actions.redirect(
        {
          routeName,
          params,
          query,
          "clearReactor": true,
        }
      );
    };

    return result;
  };

  reactor = createReactor();
}

var initialRenderComplete;

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return initialRenderComplete = false;

  } else {
    router.run(
      (Handler, routerState) => {
        if (reactor) {
          if (initialRenderComplete) {
            reactor.ambidex.actions.routerStateChanged(
              {
                routerState
              }
            );

          } else {
            reactor.deserialize(window.__ambidexStoreStateByName);
          }
        }

        // Anything that changes here needs to change in Ambidex.server.js too
        React.render(
          <HandlerWithAmbidexContext
            settings  = { __ambidexSettings }
            setTitle  = {
                          title => {
                            document.title = title
                          }
                        }

            { ...{Handler, reactor} }
          />,

          container
        );
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
