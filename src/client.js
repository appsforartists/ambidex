var React = require("react");

require("react-tap-event-plugin")();

var containerSelector = "body";

var mountReact = function() {
  var container = document.querySelector(containerSelector);

  if (!container) {
    return false;

  } else {
    React.renderComponent(
      require("./routes.jsx"),
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
