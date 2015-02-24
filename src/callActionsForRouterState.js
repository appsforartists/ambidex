var callActionsForRouterState = function (
  {
    routerState,
    reflux,
    actionsForRouterState
  }
) {
  // TODO: add a filter for actionsForRouterState[n].routeName
  return Promise.all(
    actionsForRouterState.map(
      function (
        {
          storeName,
          actionName,
          parameterName,
          isReady
        }
      ) {
        console.assert(storeName && actionName, `Each actionForRouterState requires both a storeName and an actionName, but they weren't found in ${ JSON.stringify(arguments[0]) }`);

        if (
             !parameterName
          || routerState.params[parameterName]
        ) {
          return new Promise(
            (resolve, reject) => {
              try {
                var store = reflux.stores[storeName];

                if (store === undefined)
                  throw new Error("Could not find store: " + storeName);

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
              } catch (error) {
                reject(error);
              }
            }
          );

        } else {
          return null;
        }
      }
    )
  );
};

module.exports = callActionsForRouterState;
