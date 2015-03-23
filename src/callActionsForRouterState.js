var callActionsForRouterState = function (
  {
    routerState,
    reflux,
    actionsForRouterState
  }
) {
  // Active routes by name for fast matching.
  var activeRoutesNames = [];
  routerState.routes.forEach(route => {
    if (typeof route.name != 'undefined') {
      activeRoutesNames[route.name] = route.name;
    }
  });

  // TODO: add a filter for actionsForRouterState[n].routeName
  return Promise.all(
    actionsForRouterState.map(
      function (
        {
          storeName,
          actionName,
          parameterName,
          isReady,
          routeName
        }
      ) {
        console.assert(storeName && actionName, `Each actionForRouterState requires both a storeName and an actionName, but they weren't found in ${ JSON.stringify(arguments[0]) }`);

        if (
          (!parameterName && !routeName)
          || routerState.params[parameterName]
          || (routeName in activeRoutesNames)
        ) {
          return new Promise(
            (resolve, reject) => {
              var store = reflux.stores[storeName];

              var finishListening = store.listen(
                state => {
                  if (isReady === undefined || isReady(state)) {
                    resolve([storeName, state]);
                    finishListening();
                  }
                }
              );

              var action = reflux.actions[actionName];

              if (parameterName) {
                action(routerState.params[parameterName]);

              } else {
                action();
              }
            }

            // TODO: catch errors
          );

        } else {
          return null;
        }
      }
    )
  );
};

module.exports = callActionsForRouterState;
