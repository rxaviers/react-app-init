// Share paths between Development browsing via AMD, and Production build via
// Gruntfile.

(function (root, factory) {
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
      "react": "../bower_components/react/react-with-addons",
      "JSXTransformer": "../bower_components/react/JSXTransformer",
      "jsx": "../bower_components/requirejs-react-jsx/jsx",
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
