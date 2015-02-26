var React = require("react");
                                                              
var Scaffold = React.createClass(
  {
    "propTypes":                  {
                                    "title":                React.PropTypes.string.isRequired,

                                    "style":                React.PropTypes.shape(
                                                              {
                                                                "src":      React.PropTypes.string,
                                                                "__html":   React.PropTypes.string,
                                                              }
                                                            ).isRequired,

                                    "script":               React.PropTypes.shape(
                                                              {
                                                                "src":      React.PropTypes.string,
                                                                "__html":   React.PropTypes.string,
                                                              }
                                                            ).isRequired,

                                    "body":                 React.PropTypes.shape(
                                                              {
                                                                "__html":   React.PropTypes.string.isRequired,
                                                              }
                                                            ).isRequired,

                                    "favIconSrc":           React.PropTypes.string,
                                    "storeStateByName":     React.PropTypes.object,
                                  },

    "getDefaultProps":            function () {
                                    return {
                                      "storeStateByName":   {},
                                    }
                                  },

    "render":                     function () {
                                    // use Webpack's bundles for dev, but inline for production
                                    var styleTag = this.props.style.hasOwnProperty("src")
                                      ? <script
                                          src = { this.props.style.src }
                                        ></script>
                                      : <script
                                          dangerouslySetInnerHTML = { this.props.style }
                                        />;
                                                                      
                                    var scriptTag = this.props.script.hasOwnProperty("src")
                                      ? <script
                                          src = { this.props.script.src }
                                          defer
                                        ></script>
                                      : <script
                                          dangerouslySetInnerHTML = { this.props.script }
                                        />;

                                    return  <html>
                                              <head>
                                                <title>
                                                  { this.props.title }
                                                </title>
                                                                      
                                                {/* This is the magic viewport.  Don't touch it!  
                                                  * It opts us in to Chrome's GPU accelerated fast-path:
                                                  * https://www.youtube.com/watch?v=3Bq521dIjCM&feature=youtu.be&t=23m50s 
                                                  */}
                                                <meta
                                                  name    = "viewport"
                                                  content = "
                                                              width=device-width,
                                                              minimum-scale=1.0,
                                                              initial-scale=1.0,
                                                              user-scalable=yes
                                                            "
                                                />
                                                                      
                                                <link
                                                  rel  = "icon"
                                                  href = { this.props.favIconSrc }
                                                />
                                                                      
                                                { styleTag }
                                              </head>
                                                                      
                                              <body
                                                dangerouslySetInnerHTML = { this.props.body }
                                              />
                                                
                                              <script
                                                dangerouslySetInnerHTML = { 
                                                                            {
                                                                              "__html":   `window.__ambidexStoreStateByName = ${ JSON.stringify(this.props.storeStateByName) }` 
                                                                            }
                                                                          }
                                              />
                                                      
                                              { scriptTag }
                                            </html>;
                                  }
  }
);
                                                              
module.exports = Scaffold;
