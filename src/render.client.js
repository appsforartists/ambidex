require("babel-polyfill");

var Ambidex              = require("ambidex");
var React                = require("react");
var ReactDOM             = require("react-dom");
var Immutable            = require("immutable");

var injectTapEventPlugin = require("react-tap-event-plugin")

var {
  Router,
  browserHistory,
} = require("react-router");

// var {
//   Reactor
// } = require("experimental-nuclear-js");

var createAmbidexContextController = require("./createAmbidexContextController");

injectTapEventPlugin();

var containerSelector = "#ambidexContainer";

var AmbidexContextContoller = createAmbidexContextController(
  // enable/disable features based on what settings the developer has passed in
  {
    // "nuclear":  Boolean(__ambidexPaths.nuclearDefinitions)
  }
);

// var reactor;

// if (__ambidexPaths.nuclearDefinitions) {
//   function createReactor () {
//     // Anything that changes here needs to change in Ambidex.server.js too

//     var result = new Reactor(
//       {
//         "debug":      NODE_ENV !== "production",
//         "ambidex":    require("./nuclearDefinitions"),

//         ...require(__ambidexPaths.nuclearDefinitions),
//       }
//     );

//     result.ambidex.actions.redirect = function (
//       {
//         path,
//         routeName,
//         params        = {},
//         query         = {},
//         clearReactor  = false,
//       }
//     ) {
//       // path = path || router.makePath(
//       //   routeName,
//       //   params,
//       //   query
//       // );

//       // if (path === router.getCurrentPath())
//       //   return;

//       // if (clearReactor) {
//       //   reactor.dispatch = Ambidex.addons.utilities.noOp;
//       //   reactor = createReactor();
//       // }

//       // router.transitionTo(path);
//     };

//     result.ambidex.actions.requireAuthentication = function (
//       {
//         routeName = "login",
//         params    = {},
//         query     = {},
//         next,
//       } = {}
//     ) {
//       // if (next || !query.next)
//       //   query.next = router.getCurrentPath();


//       // result.ambidex.actions.redirect(
//       //   {
//       //     routeName,
//       //     params,
//       //     query,
//       //     "clearReactor": true,
//       //   }
//       // );
//     };

//     result.ambidex.actions.loadSettings(
//       {
//         "settings":   __ambidexSettings
//       }
//     );

//     return result;
//   };

//   reactor = createReactor();
// }

var initialRenderComplete;

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return initialRenderComplete = false;

  } else {
    // if (reactor) {
    //   if (initialRenderComplete) {
    //     reactor.ambidex.actions.routerStateChanged(
    //       {
    //         routerState
    //       }
    //     );

    //   } else {
    //     reactor.deserialize(window.__ambidexStoreStateByName);
    //   }
    // }

    // Anything that changes here needs to change in Ambidex.server.js too
    ReactDOM.render(
      <AmbidexContextContoller
        settings  = { __ambidexSettings }
        setTitle  = {
                      title => {
                        document.title = title
                      }
                    }

        // { ...{reactor} }
      >
        <Router
          routes  = { require(__ambidexPaths.routes) }
          history = { browserHistory }
        />
      </AmbidexContextContoller>,

      container
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
