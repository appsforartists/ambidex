// The client and server need different implementations to access settings.
// To ensure the API is the same across both, each on uses this method to
// create its own instance of `getFromSettings`.

function getGetFromSettings (getSettings) {
  return function getFromSettings (path) {
    //  If you want to get your instance's copy of `settings.FILESYSTEM_PATHS["ROUTES"]`,
    //  call `getFromSettings(["FILESYSTEM_PATHS", "ROUTES"])`.

    if (!Array.isArray(path) && path.split)
      path = path.split(".");

    var value = global.settings || getSettings();

    while (path.length)
      value = value[path.shift()];

    return value;
  }
}

module.exports = getGetFromSettings;
