## Introduction ##

**Ambidex** is a [Mach server](https://github.com/mjackson/mach) that will serve 
your React-based JavaScript app on both the client and the server.  The initial 
request is handled by the server, and subsequent requests are rendered by the 
browser with [ReactRouter](https://github.com/rackt/react-router).
   
Instantiate Ambidex like this:

```javascript
new Ambidex(
  {
    "settings":                 {
                                  "NAME":                           "My Awesome App",
                                  "SHORT_NAME":                     "my_awesome_app",
                                  
                                  "HOST":                           "example.appspot.com",
                                  "PORT":                           "80",                   // the port that goes in your browser's address bar
                                  "VM_PORT":                        "8080",                 // the port that the LB requests from the VM (optional)

                                  "ENABLE_HOT_MODULE_REPLACEMENT":  true,

                                  "TITLE_SEPARATOR":                " - ",                  // the character(s) used to join the section titles into document.title
                                  "FAV_ICON_URL":                   "/static/logo.svg",
                                  
                                  "FILESYSTEM_PATHS":               {
                                                                      "BASE":     __dirname,              // the path all these others are relative to
                                                                      "ROUTES":           "routeTree.jsx",   
                                                                      "STYLES":           "styles.scss",
                                                                      "BUNDLES":          "../bundles/",  // where your concatenated scripts and styles will be stored
                                                                      

                                                                      // This is the template that renders the HTML page that contains
                                                                      // your app.  If you omit it, Ambidex will use its default.
                                                                      //
                                                                      // Custom scaffolds probably won't be much more useful than 
                                                                      // [the default](./blob/master/src/Scaffold.jsx) until there
                                                                      // are hooks to customize Webpack Settings

                                                                      "SCAFFOLD":         "Scaffold.jsx"
                                                                    },

                                  "SERVER_ONLY_MODULE_NAMES":       [
                                                                      "jsdom"
                                                                    ],

                                  "CUSTOM_SETTINGS":                {
                                                                      // Put whatever you like in here.  This is your own namespace to
                                                                      // pass application-specific data through Ambidex and back to your
                                                                      // React components.
                                                                      //
                                                                      // Remember, because your routes need to compile back to JavaScript
                                                                      // to be run on the client, anything you include here will need to
                                                                      // survive JSON serialization.
                                                                      
                                                                      "STATIC_URL":       "/static/"
                                                                    }
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
).then(
  (ambidex) => {
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
  }
);
```
