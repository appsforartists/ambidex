[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/appsforartists/Ambidex?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Introduction ##

**Ambidex** lets you render the exact same [React.js](https://github.com/facebook/react) app on both the client and the server.  It abstracts away the [differences](#mix-ins) between them, so you can focus your creativity where it matters most: _on your product._

[![eBay Open Source](https://raw.githubusercontent.com/raptorjs/optimizer/ba5b56a3361f95d4ab6be5d6a6d53590315c3428/images/ebay.png)](https://github.com/eBay/)  
_Ambidex is being incubated in the [eBay](https://github.com/eBay/) Mobile Innovations lab._


## Presentations ##

 -  [**The Ultimate Workflow:** _Tweak your page in real time without leaving the comfort of your editor_](https://www.youtube.com/watch?v=yaymfLj5tjA)  
    _Presented at [React.js Conf 2015](http://conf.reactjs.com)_

    - [Slides](http://goo.gl/ZYoyRZ)
    - [Video](https://www.youtube.com/watch?v=yaymfLj5tjA)


## Ingredients ##

Ambidex brings together the best of a bunch other fantastic projects, including:

 - [**React**](https://github.com/facebook/react/) _by [Facebook](https://github.com/facebook/)_
 - [**React Router**](https://github.com/rackt/react-router/) _by [Ryan Florence](https://github.com/rpflorence/) and [Michael Jackson](https://github.com/mjackson/)_
 - [**React Hot Loader**](https://github.com/gaearon/react-hot-loader/) _by [Dan Abramov](https://github.com/gaearon/)_
 - [**Webpack**](https://github.com/webpack/webpack/) _by [Tobias Koppers](https://github.com/sokra)_
 - [**Reflux**](https://github.com/spoike/refluxjs/) _by [Mikael Brassman](https://github.com/spoike/)_
 - [**Mach**](https://github.com/mjackson/mach/) _by [Michael Jackson](https://github.com/mjackson/)_


## Requirements ##

Ambidex has been tested on 

 - `node v0.11.13`
 - `npm  v2. 2. 0`

We intend to move to io.js as soon as practicable.  This is currently being blocked by [node-sass](https://github.com/sass/node-sass/issues/627).  We intend to changing the default styling [from SASS to inline styles](http://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html) to enable this upgrade.


## Stability ##

Ambidex is a work-in-progress.  It is the foundation of our web-centric work in the eBay Mobile Innovation lab, but it has not yet been deployed in production.

It is being developed in the open so we, as a community, can share ideas and best practices around being insanely productive with React.  When you see something you'd like to improve, please [start an issue](https://github.com/appsforartists/Ambidex/issues/new) or [send us a message](https://gitter.im/appsforartists/Ambidex?utm_source=readme&utm_medium=readme&utm_campaign=pr-readme&utm_content=readme).


## How it works ##

Ambidex renders the initial request on the server and subsequent requests in the browser.  Rendering on the server is beneficial for [SEO](http://en.wikipedia.org/wiki/Search_engine_optimization), [time-to-glass](https://www.youtube.com/watch?v=Il4swGfTOSM), and supporting clients that don't speak JavaScript (like robots).  Rendering on the client saves bandwidth, reduces server load, and makes your app feel more responsive (because changes happen instantly).  Ambidex brings you the benefits of both.

It is designed to be used in conjunction with a [Service-Oriented Architecture](http://en.wikipedia.org/wiki/Service-oriented_architecture).  This means your data layer should be provided as a [RESTful](http://en.wikipedia.org/wiki/Representational_state_transfer) API that functions independently of your web app.

This architecture has two advantages:

1. Your data platform is capable of supporting any client, including native mobile apps or those of third parties.

2. Your app can access data directly from the browser, so it doesn't waste server cycles requesting largely-redundant HTML on every page load.


## Getting Started ##

_(Dive right in by perusing our [sample application](https://github.com/appsforartists/ambidex-example--bike-index/tree/master/application).)_

Here's how you instantiate Ambidex:

```javascript
new Ambidex(
  {
    "settings":             require(`./settings.${ process.env["NODE_ENV"] }.js`),

    "middlewareInjector":   function (stack) {
                              // If you want to edit your Mach stack (for instance, 
                              // to serve static files with mach.file) do that here.
                            }
  }
).then(
  (ambidex) => {

  }
);
```

Notice that the Ambidex constructor returns a promise.  This promise will be resolved when your app is serving as expected.

Each `Ambidex` instance has three public properties:

 - `ambidex.stack`: the [Mach](https://github.com/mjackson/mach/) stack that is serving your app,
 - `ambidex.webpack`: the [Webpack](https://github.com/webpack/webpack/) instance that bundles your files, and
 - `ambidex.webpackDevServer`: the [Webpack Dev Server](https://github.com/webpack/webpack-dev-server/) instance that serves your files when `ENABLE_HOT_MODULE_REPLACEMENT` is `true`.

### Settings ###

Each instance of Ambidex starts with a `settings` dictionary.  Here are the individual settings supported:

#### `settings["NAME"]` ####
The name your app will be referred to in the logs, `"My Awesome App"`.

#### `settings["SHORT_NAME"]` ####
A variation of that name without spaces or capital letters - your app will appear in process monitors like `top` under this name, `"my_awesome_app"`


#### `settings["HOST"]` ####
The hostname that your app will be made available at, `"example.appspot.com"`.

#### `settings["PORT"]` ####
The port that goes in your browser's address bar, `"80"`.

#### `settings["VM_PORT"]` ####
If your app is behind a load balancer, this is the port that Ambidex should serve your app so the load balancer can find it, `"8080"`. _(optional)_

#### `settings["BASE_URL"]` ####
If your app is behind displayed inside a `TardisGallery`, mount its route tree here.  This allows you to serve different variations of your app alongside one another; for instance, you might serve version A at `"/A/"` and version B at `/B/`. _(optional)_

#### `settings["ENABLE_HOT_MODULE_REPLACEMENT"]` ####
If this is `true`, you'll be able to edit your app live with [**react-hot-loader**](https://github.com/gaearon/react-hot-loader).  This should be `true` for whatever environment(s) you're developing on.

#### `settings["TITLE_SEPARATOR"]` ####
This string gets put in between [section titles](#ambidexmixinstitle), `" - "`.

#### `settings["FAV_ICON_URL"]` ####
For instance, `"/static/logo.svg"`.

#### `settings.FILESYSTEM_PATHS` ####
In order to make your app Ambidextrous, we need to know where certain files are kept.  The values in this dictionary answer that question.

#### `settings.FILESYSTEM_PATHS["BASE"]` ####
All the other `FILESYSTEM_PATHS` are relative to this one.  If you set this to `__dirname` (no quotes), they will be relative to your settings file.

#### `settings.FILESYSTEM_PATHS["ROUTES"]` ####
The module at this path should export the root `<Route>` of your route tree.

#### `settings.FILESYSTEM_PATHS["STYLES"]` ####
_**Deprecated!**_

In early versions of Ambidex, this was a hook to circumvent [sass-loader#31](https://github.com/jtangelder/sass-loader/issues/31) and support SASS stylesheets.  The more we work with React (especially in light of React Native), the more appealing purely [inline styles](http://blog.vjeux.com/2014/javascript/react-css-in-js-nationjs.html) have become.

In the coming months, this feature will be dropped to ease the transition from node to io.js.

#### `settings.FILESYSTEM_PATHS["REFLUX_DEFINITIONS"]` ####
This module should export a dictionary of Reflux definitions, e.g.:

```javascript
module.exports = {
  "CurrentBike":  require("./CurrentBike.js"),
  "Bikes":        require("./Bikes.js"),
}
```

For more information, see the [Reflux section](#ambidexmixinsreflux).

#### `settings.FILESYSTEM_PATHS["REFLUX_ACTIONS_FOR_ROUTER_STATE"]` ####
This module should export your `actionForRouterState`.  For more information, see the [Reflux section](#ambidexmixinsreflux).

#### `settings.FILESYSTEM_PATHS["BUNDLES"]` ####
When `"ENABLE_HOT_MODULE_REPLACEMENT"` is `false` (e.g. in production), Ambidex will run Webpack on all your files and serve the results inline in every response.  To do so, it need to be able to cache them on the filesystem.

`"BUNDLES"` should resolve to a folder where it can store these files.  Each instance of Ambidex needs its own unique bundles folder.

                                    
#### `settings["SERVER_ONLY_MODULE_NAMES"]` ####
This is an array of module names that should be ignored by Webpack because they are not compatible with the browser (and will only ever run on the server).  For instance, `["jsdom"]`.


#### `settings["CUSTOM_SETTINGS"]` ####
`settings` is just a dictionary - you can put any values inside it that you find useful.  For instance, you might add `"STATIC_URL"` so your components know which CDN hosts your static assets.  

However, as Ambidex evolves, so too will the available settings.  To ensure new features don't collide with your app-specific inclusions, put any settings that Ambidex won't consume in `settings.CUSTOM_SETTINGS`.

Remember, because your routes need to be compiled to JavaScript source code to be run on the client, anything you put in here needs to survive JSON serialization.

### Organizing your `settings` files ###

Of course, you'll need different settings for your production server than you will for your local machine, but nobody wants to maintain the same information in many places.  Therefore, it's a common pattern to have a separate `settings` file for each environment you'll need, and one more that holds everything that they all share.  

For instance, a professional project that utilizes many environments might be organized like this:

 - [`settings.common.js`](https://github.com/appsforartists/ambidex-example--bike-index/blob/master/application/settings.common.js)
 - [`settings.local.js`](https://github.com/appsforartists/ambidex-example--bike-index/blob/master/application/settings.local.js)
 - `settings.development.js`
 - `settings.integration.js`
 - `settings.qa.js`
 - `settings.production.js`

Each of those will include and extend (or even override) [`settings.common.js`](https://github.com/appsforartists/ambidex-example--bike-index/blob/master/application/settings.common.js).  They should be very small files that describe only what is unique about that environment.

### Mix-ins ###

There are subtle differences between the ways the client and server operate.  We need to abstract them out to make your app Ambidextrous.  That's what these mix-ins are for. 

#### `Ambidex.mixins.Title` ####

Any [route handler](https://github.com/rackt/react-router/blob/master/docs/api/components/RouteHandler.md) can include the `Title` mix-in.

When your route tree renders, Ambidex will check each handler for a section title:

 - If your title is _static_, [declare it as `sectionTitle`](https://github.com/appsforartists/ambidex-example--bike-index/blob/6548ca987e7549c33c1ce6251a8b888a3fb87b52/application/bike-index/components/Main.jsx#L17).  
 
 - If your title is _dynamic_, [return it from `getSectionTitle()`](https://github.com/appsforartists/ambidex-example--bike-index/blob/6548ca987e7549c33c1ce6251a8b888a3fb87b52/application/bike-index/components/BikeDetails.jsx#L15-19).  

[`settings["TITLE_SEPARATOR"]`](#settingstitle_separator) will be interspersed between each section title.  The result will be returned in the `<title>` tag when rendered on the server, or set on the client with `document.title`.


#### `Ambidex.mixins.Reflux` ####

The biggest difference between running your app on the server and running it on the client is how you load data when someone clicks a link:

 - The server only gets to respond once, so it must wait until every piece of data has loaded before responding.

 - The client doesn't have this limitation, and users expect it to respond immediately.  The best strategy here is to change pages immediately (even though your stores are probably empty) and to fill the component with new data as it arrives.

_(Note: Our data loading paradigm is currently prototyped with [Reflux](https://github.com/spoike/refluxjs/).  This could change to a more functionally reactive library like [RxJS](https://github.com/Reactive-Extensions/RxJS) or [Bacon](https://baconjs.github.io/) as we progress, but the architecture should remain the same.)_

The first challenge to overcome is knowing which data needs to be loaded for a particular page to be rendered.  The server only knows which page to show by inspecting the URL; it can also use the URL determine which data to load.

You can [create named parameters in ReactRouter](https://github.com/rackt/react-router/blob/master/docs/guides/overview.md#dynamic-segments) by placing a colon before the parameter name. For example, this route has a single named parameter, `bikeID`:

```javascript
<Route
  path    = "/bikes/:bikeID/edit/"
  name    = "editBike"
  handler = { require('./bike-index/components/BikeDetails.jsx') }
/>
```

When Ambidex renders a route, it receives a [`routerState`](https://github.com/rackt/react-router/blob/master/docs/api/run.md#state) object from ReactRouter.  It uses this to filter the entries in [`actionsForRouterState`](#settingsfilesystem_pathsreflux_actions_for_router_state).  Any entry that doesn't have a `parameterName` property will be included on every request.  Additionally, any entry whose `parameterName` matches on in the currently active route will also be included.

For instance, this entry would match the `<Route />` example above:

```javascript
{
  "parameterName":  "bikeID",
  "actionName":     "viewBike",
  "storeName":      "CurrentBike",
  "isReady":        Ambidex.addons.utilities.hasContent,
},
```

Ambidex iterates over each matching `actionForRouterState`, passing the value of the named parameter to the action declared in `actionName`.  For instance, a request to `/bikes/1035/edit/` would cause this action to be called:

```javascript
viewBike(1035);
```

Ambidex listens for the store specified by `storeName` (`CurrentBike`) to `trigger`.  If `actionForRouterState` does not have an `isReady` callback, Ambidex will presume the store is ready the first time it `trigger`s.

You'll usually want to check the store's value before presuming it's ready to be rendered; this is what `isReady` is for.  When the store `trigger`s, Ambidex will pass the store's `state` to `isReady`.  If `isReady` returns `true`, Ambidex knows the store is ready to be rendered.

Ambidex provides two helpers that can be used for `isReady`:
 
 - **`Ambidex.addons.utilities.hasValue`**: tests that the value is neither `null` nor `undefined`.
 - **`Ambidex.addons.utilities.hasContent`**: If the value is an Array or a dictionary, test that it contains values.  Otherwise, fall back to `hasValue`.

Following up on the example, as soon as `CurrentBike` `trigger`s with a bike model in its `state`, Ambidex will consider it ready.  When all the filtered `actionsForRouterState` are ready, Ambidex will render the route and serve the results.

You may be wondering "OK, how do I define an action or a store?"  For now, the best answer is to [read this comment](https://github.com/spoike/refluxjs/issues/144#issuecomment-68023326) and [explore the example](https://github.com/appsforartists/ambidex-example--bike-index/tree/master/application/bike-index/reflux).

-----

Now that you've sorted out what data needs to be loaded, you need to pass it to your React components.  

The best way is with `Ambidex.mixinCreators.connectStoresToLocalState`.  It will take the value of your store's `state` and mirror it on your component's `state`.  For instance, [this call](https://github.com/appsforartists/ambidex-example--bike-index/blob/6548ca987e7549c33c1ce6251a8b888a3fb87b52/application/bike-index/components/BikeDetails.jsx#L8-L10) tells Ambidex to take the value of `CurrentBike.state` and put it in `<BikeDetails />.state.currentBike`.  Whenever the store updates, your component will too.

`connectStoresToLocalState` accepts its arguments in many formats:

 - `("CurrentBike")` - connect the `CurrentBike` store to `currentBike` on the component state.
 - `("CurrentBike", "current")` - connect the `CurrentBike` store to `current` on the component state.
 - `(["CurrentBike", "Bikes"])` - connect the `CurrentBike` and `Bikes` stores to `currentBike` and `bikes` on the component state.
 - `({"CurrentBike": "current", "Bikes": "all"})` - connect the `CurrentBike` and `Bikes` stores to `current` and `all` on the component state.

If you'd rather do it manually, you can instead use `Ambidex.mixins.Reflux`, which adds `getRefluxAction` and `getRefluxStore` methods to your components.

#### `Ambidex.mixins.Settings` ####

It can be really useful to access the combined [`settings` dictionary](#settings) from your components.  Simply [mix in `Settings`](https://github.com/appsforartists/ambidex-example--bike-index/blob/6548ca987e7549c33c1ce6251a8b888a3fb87b52/application/bike-index/components/Main.jsx#L13) and call [`this.getAmbidexSettings()` from inside your component](https://github.com/appsforartists/ambidex-example--bike-index/blob/6548ca987e7549c33c1ce6251a8b888a3fb87b52/application/bike-index/components/Main.jsx#L26).
