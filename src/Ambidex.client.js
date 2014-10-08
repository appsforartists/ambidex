module.exports = function getWithModulesFromParent (modulesFromParent) {
  // Ambidex is a server, so if a client requests it, it gets null.
  return null
};

module.exports = getWithModulesFromParent;
