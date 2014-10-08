var React = require("react/addons");

function curryRoutesWithSettings (routes, settings) {
  var handlerProps = routes.props.handlerProps || {};
  handlerProps["settings"] = settings;

  return React.addons.cloneWithProps(
    routes,
    {
      "location":       "history",    // Use isomorphic History API instead of client-only "#!"s
      "handlerProps":   handlerProps
    }
  );
}

module.exports = curryRoutesWithSettings;
