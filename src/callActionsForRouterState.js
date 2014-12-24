var callActionsForRouterState = function (
  {
    routerState,
    reflux,
    actionsForRouterState
  }
) {
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
