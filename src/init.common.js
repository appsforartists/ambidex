function AmbidexModule () {
  throw new Error("Ambidex must be instantiated with require(\"ambidex\").forModule(module);");
};

AmbidexModule.forModule = function (parentModule) {
  var modulesFromParent = require("./loadModulesFromParent")(parentModule);

  return {
    "Ambidex":        require("./Ambidex.server.js")(modulesFromParent),
    "AmbidexRoutes":  require("./AmbidexRoutes.jsx")(modulesFromParent),
  };
};

module.exports = AmbidexModule;
