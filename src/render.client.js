require("./polyfills.js");

var React                   = require("react/addons");
var ReactRouter             = require("react-router");
var injectTapEventPlugin    = require("react-tap-event-plugin");

var HandlerWithAmbidexContext = require("./HandlerWithAmbidexContext.jsx");


var containerSelector = "body";


injectTapEventPlugin();

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return false;

  } else {
    ReactRouter.run(
      require(__ambidexRoutesPath),
      ReactRouter.HistoryLocation,

      Handler =>  React.render(
                    <HandlerWithAmbidexContext
                      Handler   = { Handler }
                      settings  = { __ambidexSettings }

                      setTitle  = {
                                    title => {
                                      document.title = title
                                    }
                                  }
                    />,

                    container
                  )
    );

    return true;
  }
};

if (!mountReact()) {
  window.addEventListener(
    "DOMContentLoaded",
    mountReact
  );
}
