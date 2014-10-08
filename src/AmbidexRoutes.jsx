/**
 * @jsx React.DOM
 */

module.exports = function getWithModulesFromParent (modulesFromParent) {
  var { React, ReactRouter } = modulesFromParent;
  
  var AmbidexRoutes = React.createClass(
    {
      "render":             function () {
                              var propsForRoutes = this.props;

                              // makes sure we use the history API for isomorphic URLs (rather than the default "#!") 
                              if (!propsForRoutes["location"])
                                propsForRoutes["location"] = "history";  
                              
                              if (!propsForRoutes["handlerProps"])
                                propsForRoutes["handlerProps"] = {};

                              // on the server, these are passed in by Ambidex
                              // on the client, they are the global `__ambidexSettings`
                              if (!propsForRoutes["handlerProps"]["settings"])
                                propsForRoutes["handlerProps"]["settings"] = global.__ambidexSettings;

                              return ReactRouter.Routes(
                                propsForRoutes,
                                this.props.children
                              );
                            },

      // pass these through so we can get them from within Webpack
      "_modulesFromParent": modulesFromParent,
    }
  );


  return AmbidexRoutes;
};
