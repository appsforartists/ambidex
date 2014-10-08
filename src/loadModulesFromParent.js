module.exports = function loadModulesFromParent (parentModule) {
  return {
    "React":                parentModule.require("react/addons"),
    "ReactRouter":          parentModule.require("react-router"),
    "injectTapEventPlugin": parentModule.require("react-tap-event-plugin"),
  };
};
