var ambidexRoutes = require(ROUTES_PATH);

if (!ambidexRoutes._modulesFromParent)
  throw new Error("settings.FILESYSTEMS_PATHS[\"ROUTES\"] must be an instance of <AmbidexRoutes>.  It's a drop-in replacement for ReactRouter's <Routes>.");

var {
  React,
  injectTapEventPlugin
}                       = ambidexRoutes._modulesFromParent;

injectTapEventPlugin();

var containerSelector = "body";

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return false;

  } else {
    React.renderComponent(
      ambidexRoutes,
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
