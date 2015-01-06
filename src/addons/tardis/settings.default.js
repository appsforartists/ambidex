module.exports = {
  "NAME":                           "TARDIS Gallery",
  "SHORT_NAME":                     "tardis_gallery",
  "HOST":                           "tardis.local",
  "PORT":                           "8080",
  "WEBPACK_PORT":                   "8078",

  "ENABLE_HOT_MODULE_REPLACEMENT":  NODE_ENV === "local",

  "FILESYSTEM_PATHS":               {
                                      "ROUTES":   `${ __dirname }/routes.jsx`,
                                      "STYLES":   `${ __dirname }/styles.scss`,
                                      "BUNDLES":  `${ __dirname }/bundles/`,
                                    },

  "SERVER_ONLY_MODULE_NAMES":       [
                                    ],

  // TARDIS-specific settings:

  "APPEND_PATH_TO_URLS":            true
};
