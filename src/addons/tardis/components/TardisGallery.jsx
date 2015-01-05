var React       = require("react/addons");
var ReactRouter = require("react-router");
var Ambidex     = require("Ambidex");

var Tardis = require("./Tardis.jsx");

var TardisGallery = React.createClass(
  {
    "mixins":                     [
                                    Ambidex.mixins.Settings,
                                    Ambidex.mixins.Title,
                                    ReactRouter.State
                                  ],

    "getSectionTitle":            function () {
                                    return this.getAmbidexSettings().NAME;
                                  },

    "render":                     function () {
                                    var settings = this.getAmbidexSettings();

                                    // forward any path the user types into the gallery on to each TARDIS
                                    var path = settings.APPEND_PATH_TO_URLS
                                      ? this.getPath()
                                      : "";

                                    var tardises = settings.URLS.map(
                                      (url) => {
                                        url = url.indexOf("//") === -1
                                          ? "//" + url
                                          : url;

                                        return  <Tardis 
                                                  url = { url + path } 
                                                  key = { url + path } 
                                                />
                                      }
                                    );

                                    return  <div>
                                              { tardises } 
                                            </div>
                                  }
  }
);

module.exports = TardisGallery;
