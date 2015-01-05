var React       = require("react/addons");
var ReactRouter = require("react-router");

var Route  = ReactRouter.Route;

module.exports =  <Route
                    path    = "/*"
                    handler = { require("./components/TardisGallery.jsx") }
                  />;
