var React = require(MODULES_PATH + "react");

require(MODULES_PATH + "react-tap-event-plugin")();

var containerSelector = "body";

var initReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return false;

  } else {
    React.renderComponent(
      require(ROUTES_PATH),
      container
    );

    return true;
  }
};

if (!initReact()) {
  window.addEventListener(
    "DOMContentLoaded",
    mountReact
  );
}
