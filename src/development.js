require([
  "fixtures/products",
  "i18n-data",
  "react",
  "jsx!app"
], function(products, i18nData, React, App) {

  var locale = "en";

  i18nData(locale, function(error) {
    if (error) {
      return console.error(error);
    }

    /* globals console:false, document:false */
    console.log("start");
    React.render(React.createElement(App, {locale: locale, products: products}), document.body);
  });

});
