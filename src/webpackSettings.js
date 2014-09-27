var path    = require("path");

var Webpack = require("webpack");

module.exports = {
  "context":    __dirname,

  "entry":      {
                  "styles": [
                              "./styles.scss",
                            ],

                  "jsx":    [
                              "./client.js",
                            ],
                },

  "resolve":    {
                  "extensions": [
                    "",
                    ".js",
                    ".jsx",
                    ".scss"
                  ]
                },

  "module":     {
                  "loaders":  [
                                {
                                  "test":   /\.jsx$/,
                                  "loader": "jsx-loader?harmony"
                                },
                                {
                                  "test":   /\.scss$/,
                                  "loader": "style-loader!css-loader!autoprefixer-loader!sass-loader"
                                }
                              ]
                },

  "output":     {
                  "filename":       "[name].js",
                  "chunkFilename":  "chunk_[id].js",
                  "path":           path.join(__dirname, "../bundles/"),
                  "publicPath":     "/bundles/"
                },

  "plugins":    [
                  // DefinePlugin should be first so it's easy to access its `definitions` from server.js
                  new Webpack.DefinePlugin({
                                  // These are `eval`ed by Webpack, so strings have to be wrapped in quotes.  =(
                    "SERVER_IP":  '"' + SERVER_IP + '"',
                    "IN_BROWSER": true
                  }),
                  new Webpack.IgnorePlugin(/jsdom/),
                ],
};
