Ambidex is a [Mach server](https://github.com/mjackson/mach) that will serve 
your React-based JavaScript app on both the client and the server.  The initial 
request is handled by the server, and subsequent requests are rendered by the 
browser with [ReactRouter](https://github.com/rackt/react-router).
   
Instantiate Ambidex like this:

```javascript
var ambidex = new Ambidex({
  // You can follow convention and pass in a reference to the location of 
  // settings.js, Routes.jsx, and Scaffold.jsx

  "localPath":                _dirname,


  // or you can specify them individually:

  "settings":                 {
                                "NAME":                           "My Awesome App",
                                "SHORT_NAME":                     "my_awesome_app",
                                "STATIC_URL":                     "/static/",
                                "FAV_ICON_URL":                   "/static/logo.svg",
                                "HOST":                           "example.appspot.com",
                                "PORT":                           "80",                   // port that goes in your browser's address bar
                                "VM_PORT":                        "8080",                 // port that the LB requests from the VM (optional)
                                "ENABLE_HOT_MODULE_REPLACEMENT":  true
                              },

  "routes":                   <Routes
                                location = "history"
                              >
                                <Route
                                  path    = "/"
                                  handler = { require('./Main.jsx') }
                                >
                                  <Route
                                    path    = "/"
                                    name    = "home"
                                    handler = { require('./Home.jsx') }
                                  />
                                </Route>
                              </Routes>,

  "scaffold":                 // This is the template that renders the HTML page that contains
                              // your app.  If you'd like to override it with your own, pass
                              // it in here.  For a sample, look at [Scaffold.jsx](./blob/master/src/Scaffold.jsx).

                              require("./Scaffold.jsx"),


  "middlewareInjector":       // Use this if you want to inject other middleware onto the stack
                              // before Ambidex is added

                              function (stack) {
                                stack.use(
                                  myCustomMiddleware
                                )
                              },

  "shouldServeImmediately":   // This controls whether Ambidex tries to serve itself or 
                              // simply returns a reference for you to serve with mach.serve.
                              // It defaults to true.
                              false
});   


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
