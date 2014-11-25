var React = require("react");
                                                              
var Scaffold = React.createClass(
  {
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
                                                  TODO: make titles work
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
                                                                      
                                                { scriptTag }
                                              </head>
                                                                      
                                              <body
                                                dangerouslySetInnerHTML = { this.props.body }
                                              />
                                            </html>;
                                  }
  }
);
                                                              
module.exports = Scaffold;
