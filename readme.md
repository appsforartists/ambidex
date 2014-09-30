Ambidex is a [Mach server](https://github.com/mjackson/mach) that will serve 
your React-based JavaScript app on both the client and the server.  The initial 
request is handled by the server, and subsequent requests are rendered by the 
browser with [ReactRouter](https://github.com/rackt/react-router).
   
Instantiate Ambidex like this:

```javascript
var ambidex = new Ambidex(
  {
    "settings":                 {
                                  "NAME":                           "My Awesome App",
                                  "SHORT_NAME":                     "my_awesome_app",
                                  "STATIC_URL":                     "/static/",
                                  "FAV_ICON_URL":                   "/static/logo.svg",
                                  "HOST":                           "example.appspot.com",
                                  "PORT":                           "80",                   // the port that goes in your browser's address bar
                                  "VM_PORT":                        "8080",                 // the port that the LB requests from the VM (optional)
                                  "ENABLE_HOT_MODULE_REPLACEMENT":  true,
                                  
                                  "FILESYSTEM_PATHS":               {
                                                                      "BASE":     __dirname,              // the path all these others are relative to
                                                                      "ROUTES":           "Routes.jsx",
                                                                      "STYLES":           "styles.scss",
                                                                      "BUNDLES":          "../bundles/",  // where your concatenated scripts and styles will be stored


                                                                      // For the time being, in order to prevent React or ReactRouter from
                                                                      // being imported twice, you have to tell us where your copies live.
                                                                      //
                                                                      // TODO:
                                                                      // This is a really gross hack that I'd like to remove in the future.
                                                                      
                                                                      "MODULES":          "../node_modules/",


                                                                      // This is the template that renders the HTML page that contains
                                                                      // your app.  If you omit it, Ambidex will use its default.
                                                                      //
                                                                      // Custom scaffolds probably won't be much more useful than 
                                                                      // [the default](./blob/master/src/Scaffold.jsx) until there
                                                                      // are hooks to customize Webpack Settings

                                                                      "SCAFFOLD":         "Scaffold.jsx"
                                                                    },

                                  "GLOBAL_CONSTANTS":               {
                                                                      "SHARED":   {
                                                                                    "SERVER_IP":    require("my-local-ip")(),
                                                                                  },

                                                                      "SERVER":   {
                                                                                    "IN_BROWSER":   false,
                                                                                  },

                                                                      "CLIENT":   {
                                                                                    "IN_BROWSER":   true,
                                                                                  }
                                                                    },

                                  "SERVER_ONLY_MODULE_NAMES":       [
                                                                      "jsdom"
                                                                    ]
                                },

    "middlewareInjector":       // Use this if you want to inject other middleware onto the stack
                                // before Ambidex's route handler

                                function (stack) {
                                  stack.use(
                                    myCustomMiddleware
                                  )
                                },

    "shouldServeImmediately":   // This controls whether Ambidex tries to serve itself or 
                                // simply returns a reference for you to serve with mach.serve.
                                // It defaults to true.
                                false
  }
);   


// If you disable shouldServeImmediately, you can start the server like this:
mach.serve(
  ambidex.stack,
  settings.VM_PORT || settings.PORT
);

// And if you need to access the Webpack instance, find it here:
ambidex.webpack;

// Finally, if settings.ENABLE_HOT_MODULE_REPLACEMENT and shouldServeImmediately are true,
// you can programatically access the Webpack Dev Server instance here:
ambidex.webpackDevServer;
```
