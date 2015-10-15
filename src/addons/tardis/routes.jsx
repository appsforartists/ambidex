var React       = require("react");
var ReactRouter = require("react-router");

var Route  = ReactRouter.Route;

module.exports =  <Route
                    path      = "/*"
                    component = { require("./components/TardisGallery.jsx") }
                  />;
