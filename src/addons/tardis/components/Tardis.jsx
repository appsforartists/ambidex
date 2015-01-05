var React       = require("react/addons");

var Tardis = React.createClass(
  {
    "render":                     function () { 
                                            // iOS will ignore the width/height of an iframe, 
                                            // but we can wrap it in an explicitly-sized div
                                    return  <div className = "Tardis">
                                              <iframe src = { this.props.url } />
                                            </div>;
                                  }
  }
);

module.exports = Tardis;
