This is an evolving document collecting the code style that the eBay Mobile Innovations team has found creates the most readible, least error-prone codebases.

### Core Principles ###

 - Arbitrary code style changes are distracting.  They also make a codebase look sloppy (which pulls into question the quality of the codebase itself).  The codebase should **appear to have been authored by a single person**, regardless of how many actually contributed.

 - Optimize for readability.  You will may encounter edge cases where strictly following these rules does not increase overall readability.  Feel free to deviate from these guidelines _if doing so will improve readability for someone who's used to following them_.

### Summary ###

 - Indentation counts - use it to show structure.
 - Align open/closing tags and characters (except the opening `{` of a function definition or `(` of a function call).
 - Use whitespace between lines and around special characters to improve readability.
 - Make your code look consistent with the rest of the codebase.
 - Put each prop, list item, key/value pair, and argument on its own line.

#### JavaScript and JSX ####

##### Language Version #####

We take advantage of language enhancements like [JavaScript Harmony](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla) when it's convenient to do so.  For client-side code, we use [jsx-loader](https://github.com/petehunt/jsx-loader) with Webpack and for server-side code we use [node-jsx](https://github.com/petehunt/node-jsx).  Both packages provide [these JS Harmony features](https://github.com/facebook/jstransform/tree/master/visitors).

You'll often find a small file called `init.js` in the root of a package's source tree.  Its purpose is to pass all our modules through node-jsx, so we can use Harmony throughout our codebase.  Its implementation looks something like this:

```javascript
// Runs all app code through node-jsx, so we can use conveniences like fat-arrow lambdas

require("node-jsx").install(
  {
    "extension":  ".js",
    "harmony":    true
  }
);

module.exports = require("./ActualMainFile.js");
```


##### Naming #####

We follow the conventions set by JavaScript's standard library and best practices established by the ecosystem:

| Type                              | Example                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------ |
| Classes, Constructors, and Mixins | `var CapitalCamelCase = React.createClass`                                     |
| Instances                         | `var lowerCamelCase`                                                           |
| Instances (with acronyms)         | `var capitalizeHTML`                                                           |
| Functions (except constructors)   | `var lowerCamelCase = function () {`                                           |
| Constants                         | `var CAPITAL_SNAKE_CASE`                                                       |
| Files (source code)               | match the case of the thing they export (`Component.jsx` or `justAFunction.js`)|
| Files (assets)                    | `kebab-case.svg` ([because SEO](https://www.youtube.com/watch?v=AQcSFsQyct8))  |
| Folders and URLs                  | `/kebab-case/` ([because SEO](https://www.youtube.com/watch?v=AQcSFsQyct8))    |

Additionally, you may find that you need to write code that should only be run on the client or on the server.  Name it accordingly:

 - thing.client.js
 - thing.server.js
 - thing.common.js _(code here is shared by both thing.client.js and thing.server.js)_

We can then use the `FileNameReplacementPlugin` for Webpack and the [`browser` key in `package.json`](https://gist.github.com/defunctzombie/4339901) to make sure it's only loaded when it should be.

###### Variable Names ######

Explicit and readable is better than terse and arcane: `setAttribute` is better than `attr`.

###### Argument Organization ######

Use Named Parameters (via [JS Harmony's Object Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)) to make function calls easier to read.

[Example](#example-6)

###### `className`s ######

CSS `className`s serve two purposes:

 - describing what kind of thing it is (e.g. if it was a component, what would its name be) - use `UpperCamelCase` for these.

 - describing what state that thing is in (left or right side, open or closed, etc.) - use `lowerCamelCase` for these.

Use [`classSet`](http://facebook.github.io/react/docs/class-name-manipulation.html) or `[].join(" ")` to put each class on its own line:

```javascript
                                    return  <div
                                              className = {
                                                            classSet(
                                                              {
                                                                "CollapsableShingles":  true,
                                                                "collapsed":            !this.state.isRoot && this.state.collapsed
                                                              }
                                                            )
                                                          }
                                            >
```

```javascript
                                              <div
                                                className = {
                                                  [
                                                    this.props.side,
                                                    "Drawer"
                                                  ].join(" ")
                                                }
                                              >
```


##### Organization #####

Use [CommonJS modules](http://nodejs.org/docs/latest/api/modules.html) to break your code up into self-contained sections.  Each module will export a single thing (like a React class); however, when constructing a namespace, that single thing will be a dictionary of other things.

Use whitespace to break code into chunks and declare variables where you use them.

[Example](#example-1)

##### Whitespace #####

Use it, particularly:

 - around operators like `=, +, -, /, *`
 - between items in a list
 - inside the braces of a prop declaration
 - around the parens of a function declaration
 - around the fat arrow lambda, `=>`

In lists, dictionaries, and JSX expressions, each item/prop should exist on its own line.  Unless the {list,dictionary,JSX} is empty, the close (`], }, ), />`) should also be on its own line.

[Example](#example-5)

Add a line before the `} else {` of an if/else block.  Use two lines between different blocks of code (especially if the block itself contains empty lines).

[Example](#example-2)

##### Indentation #####

Use 2-space soft tabs.  This should be set for you automatically with [EditorConfig](http://editorconfig.org/).

2-space indentation has become commonplace in the community in recent years.  It also makes alignment for deeply-nested structures more sane.

##### Alignment #####

Dictionaries, variable declarations, and CSS property lists have two columns (keys and values).  Keep all the keys aligned in the left column and the values aligned in the right.

Match the indentation of your opening brace/paren/bracket/tag when closing it.  Exceptions can be made for the opening brace of a function declaration.

[Example](#example-5)

Adjacent blocks don't need to have aligned columns, but all the items within a block should be aligned.

Your columns in a React class should be wide enough to fit the key `"componentWillReceiveProps"`; put your keys in position 5 and your values in position 35.

[Example](#example-3)

Each leg in a ternary should be on its own line, indented from its condition.

[Example](#example-3)

##### Examples #####

###### Example #1 ######

Notice:

 - `var middlewareInjector` appears in the same block it's used in
 - each parameter in `stack.route()` gets its own line:

```javascript
Ambidex.prototype._initStack = function () {
  var self = this;

  self.stack = new mach.stack();
  self.stack.use(mach.logger);
  self.stack.use(mach.gzip);
  self.stack.use(mach.charset, "utf-8");

  var middlewareInjector = self._get("middlewareInjector");
  if (middlewareInjector) {
    middlewareInjector(self.stack);
  }

  self.stack.route(
    "*",
    self._getRequestProcessor()
  );
};
```

###### Example #2 ######

Notice:

 - The blank line above `} else {`
 - The comment is aligned with the column it describes.

```javascript
                                    if (this.props.linkTo) {
                                      LinkClass         = ReactRouter.Link;
                                      linkAttributes.to = this.props.linkTo;

                                    } else {
                                                            // React.DOM.a is now just "a"
                                      LinkClass           = "a";
                                      linkAttributes.href = this.props.href;
                                    }
```

-------------------------------------------------------------------------------

###### Example #3 ######

Notice:

 - Keys and values are each aligned in `propTypes` and in the `IconButton`'s props.  Each one gets its own line.
 - The `IconButton`'s `<` and `/>` are aligned.  The `a`'s `<`, `>`, and `</a>` are also aligned.
 - There are blank lines between each method definition.
 - The methods' bodys (including each closing `}`) are aligned in a column at position 35.
 - The legs of the ternary are each on their own indented line.
 - `<nav>` and `</nav>` are aligned with the end of `return `.
 - There are spaces around the `=`s and `()`s, and within the `{}`s.
 - Dictionary keys are quoted.

```javascript
var React = require("react/addons");

var IconButton = require("./IconButton.jsx");
var Silhouette = require("./Silhouette.jsx");

var AppBar = React.createClass(
  {
    "propTypes":                  {
                                    "imagesURL":          React.PropTypes.string.isRequired,
                                    "logoSrc":            React.PropTypes.string.isRequired,
                                    "actionButtons":      React.PropTypes.element,
                                    "shouldShowNavIcon":  React.PropTypes.bool,
                                    "showNavAction":      React.PropTypes.func,
                                    "makeLogoSilhouette": React.PropTypes.bool,
                                  },

    "getDefaultProps":            function () {
                                    return {
                                      "makeLogoSilhouette": false
                                    }
                                  },

    "render":                     function () {
                                    if (this.props.shouldShowNavIcon) {
                                      var maybeNavIcon =  <IconButton
                                                            src            = { this.props.imagesURL + "nav.svg" }
                                                            onTouchTap     = { this.props.showNavAction }
                                                            makeSilhouette = { true }
                                                          />
                                    }

                                    var ImageClass = this.props.makeLogoSilhouette
                                      ? Silhouette
                                      : "img";

                                    return  <nav className = "AppBar">
                                              { maybeNavIcon }

                                              <a
                                                href      = "/"
                                                className = "Logo"
                                              >
                                                <ImageClass src = { this.props.logoSrc } />
                                              </a>

                                              <div className = "ActionButtons">
                                                { this.props.actionButtons }
                                              </div>
                                            </nav>;
                                  }
  }
);

module.exports = AppBar;
```

-------------------------------------------------------------------------------

###### Example #4 ######

Notice how the argument (`domainName`) and the return value (`<Tardis />`) are each aligned to their own column in this lambda:

```javascript
                                    var tardises = domainNames.map(
                                      (domainName) => <Tardis
                                                        url = { "//" + domainName + path }
                                                        key = { "//" + domainName + path }
                                                      />
                                    );
```

-------------------------------------------------------------------------------

###### Example #5 ######

Notice:

 - The indentation of each item makes the structure of the whole clear.
 - Opening and closing braces/brackets/tags/parens are aligned, even in a deeply nested structure.
 - The closing brace for `onSelect` is aligned with the beginning of the function declaration (just before `lineage`) rather than its opening brace.
 - Usually, you'd want a newline after the first `{` in `onSelect`; however, defining the method on the same line as its name improves readability, so we omit the newline.

```javascript
                                    return  <Main
                                              { ...this.props }

                                              leftSideBar             = {
                                                                          <DrawerNavMenu
                                                                            items         = {
                                                                                              [
                                                                                                {
                                                                                                  "label":      "Search",
                                                                                                  "iconSrc":    STATIC_URL + "generic/images/search.svg",
                                                                                                  "component":  <SearchPane/>
                                                                                                },

                                                                                                {
                                                                                                  "label":      "Shop",
                                                                                                  "iconSrc":    STATIC_URL + "shopping/images/shirt.svg",
                                                                                                  "component":  <CollapsableShingles
                                                                                                                  model     = { self.state.categoryTreeModel }
                                                                                                                  onSelect  = { lineage => {
                                                                                                                                  self.navigation.go.toCategoryByLineage(lineage);
                                                                                                                                  NavActions.hide();
                                                                                                                                  return false;
                                                                                                                                }
                                                                                                                              }
                                                                                                                />
                                                                                                },

                                                                                                {
                                                                                                  "label":      "Help",
                                                                                                  "iconSrc":    STATIC_URL + "generic/images/help.svg",
                                                                                                  "component":  <div>
                                                                                                                  Help goes here!
                                                                                                                </div>
                                                                                                },
                                                                                              ]
                                                                                            }
                                                                            selectedIndex = { 1 }
                                                                          />
                                                                        }

                                              makeLogoSilhouette      = { false }
                                              logoSrc                 = { STATIC_URL + "example-merchant/images/logo.svg" }
                                              appBarActionButtons     = {
                                                                          <div>
                                                                            <IconButton
                                                                              src             = { STATIC_URL + "shopping/images/cart.svg" }
                                                                              onTouchTap      = { CartActions.show }
                                                                              makeSilhouette  = { true }
                                                                            />
                                                                          </div>
                                                                        }

                                              rightSideBar            = {
                                                                          <Cart />
                                                                        }
                                              rightSideBarHideAction  = { CartActions.hide }
                                              rightSideBarIsOpen      = { self.state.rightSideBarIsOpen }
                                            />;
```

-------------------------------------------------------------------------------

###### Example #6 ######

Notice:

 - Function arguments are wrapped in `{}` so callers may pass them in by name.

```javascript
function TardisGallery(
  {
    ambidexPromises,
    settings
  }
) {
  // ...
}
```

