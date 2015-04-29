define([
  "globalize",
  "globalize/message"
], function(Globalize) {

  return function(locale, callback) {
    require([
      "json!./i18n-messages/" + locale + ".json",
      "json!cldr-data/main/" + locale + "/ca-gregorian.json",
      "json!cldr-data/main/" + locale + "/timeZoneNames.json",
      "json!cldr-data/main/" + locale + "/numbers.json",
      "json!cldr-data/main/" + locale + "/currencies.json",
      "json!cldr-data/supplemental/currencyData.json",
      "json!cldr-data/supplemental/plurals.json",
      "json!cldr-data/supplemental/likelySubtags.json",
      "json!cldr-data/supplemental/timeData.json",
      "json!cldr-data/supplemental/weekData.json"
    ], function() {
      Globalize.loadMessages(arguments[0]);
      Globalize.load([].slice.call(arguments, 1));
      callback();
    }, callback);
  };

});
