var React = require("react/addons");

var TitleMixin = require("./Title.jsx");

var TitleContextMixin = {
  "propTypes":                  {
                                  "settings":   React.PropTypes.object.isRequired,
                                  "setTitle":   React.PropTypes.func.isRequired,


                                  // Since there are no post-render lifecycle hooks that fire on the 
                                  // server, we fake one here.

                                  "listenForServerDidRender":   React.PropTypes.func,
                                },

  "getInitialState":            function () {
                                  return {
                                    "titledComponents":   []
                                  }
                                },

  "childContextTypes":          TitleMixin.contextTypes,

  "getChildContext":            function () {
                                  return {
                                    "ambidexRegisterTitledComponent":   this._registerTitledComponent,
                                  }
                                },

  "componentWillReceiveProps":  function () {
                                  // clear titledComponents between renders
                                  this.setState(
                                    {
                                      "titledComponents":   []
                                    }
                                  );
                                },

  "componentWillMount":         function () {
                                  if (this.props.listenForServerDidRender) {
                                    this.props.listenForServerDidRender(this._updateTitle);
                                  }
                                },

  "componentDidMount":          function () {
                                  this._updateTitle();
                                },

  "componentDidUpdate":         function () {
                                  this._updateTitle();
                                },

  "_registerTitledComponent":   function (newTitledComponent) {
                                  var titledComponents = this.state.titledComponents;

                                  if (titledComponents.indexOf(newTitledComponent) === -1)
                                    titledComponents.push(newTitledComponent);
                                },

  "_updateTitle":               function () {
                                  this.props.setTitle(
                                    this.state.titledComponents.map(
                                      titledComponent => titledComponent.sectionTitle || titledComponent.getSectionTitle()

                                    ).join(
                                      this.props.settings.TITLE_SEPARATOR || " "
                                    )
                                  );
                                }
};

module.exports = TitleContextMixin;
