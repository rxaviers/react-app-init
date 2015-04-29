require([
  "react",
  "fixtures/products",
  "jsx!./app",
  "compiled-i18n-data"
], function(React, products, App) {

  /* globals locale, document */
  React.render(
    React.createElement(App, {locale: locale, products: products}),
    document.body
  );

});
