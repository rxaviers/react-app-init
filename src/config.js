// Share paths between Development browsing via AMD, and Production build via
// Gruntfile.

(function(root, factory) {
  // Node. Build compilation by Gruntfile.
  if (typeof exports === "object") {
    module.exports = factory();
  // Global
  } else {
    root.requirejs = factory();
  }
}(this, function() {

  return {
    paths: {
      "cldr": "../bower_components/cldrjs/dist/cldr",
      "cldr-data": "../bower_components/cldr-data/",
      "globalize": "../bower_components/globalize/dist/globalize",
      "json": "../bower_components/requirejs-plugins/src/json",
      "jsx": "../bower_components/requirejs-react-jsx/jsx",
      "JSXTransformer": "../bower_components/react/JSXTransformer",
      "react": "../bower_components/react/react-with-addons",
      "react-globalize": "../bower_components/react-globalize/index",
      "text": "../bower_components/requirejs-text/text"
    },
    shim: {
      "react": {
        "exports": "React"
      },
      "JSXTransformer": "JSXTransformer"
    },

    jsx: {
      fileExtension: ".jsx",
      transformOptions: {
        harmony: false,
        stripTypes: false,
        inlineSourceMap: false
      },
      usePragma: false
    }
  };

}));
