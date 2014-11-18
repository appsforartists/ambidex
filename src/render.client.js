var React                   = require("react/addons");
var injectTapEventPlugin    = require("react-tap-event-plugin");
var curryRoutesWithSettings = require("./curryRoutesWithSettings.js");

var routes = curryRoutesWithSettings(
  require(__ambidexRoutesPath),
  __ambidexSettings
)

var containerSelector = "body";

injectTapEventPlugin();

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return false;

  } else {
    React.renderComponent(
      routes,
      container
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
