module.exports = function(grunt) {

  "use strict";

  var async = require("async");
  var extend = require("util")._extend;
  var fs = require("fs");
  var path = require("path");
  var pkg = require("./package.json");

  function mountFolder(connect, _path) {
    return connect.static(path.resolve(_path));
  }

  function replaceConsts(content) {
    return content

      // Replace Version
      .replace(/@VERSION/g, pkg.version)

      // Replace Date yyyy-mm-ddThh:mmZ
      .replace(/@DATE/g, (new Date()).toISOString().replace(/:\d+\.\d+Z$/, "Z"));
  }

  grunt.initConfig({
    pkg: pkg,
    connect: {
      options: {
        port: 9001,
        hostname: "localhost"
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, "."),
              mountFolder(connect, "test/client")
             ];
          }
        }
      }
    },
    jshint: {
      source: {
        src: ["src/**/*.js", "tmp/jsx/**/*.js"],
        options: {
          jshintrc: ".jshintrc"
        }
      },
      grunt: {
        src: ["Gruntfile.js"],
        options: {
          jshintrc: ".jshintrc"
        }
      }
    },
    mocha: {
      all: {
        options: {
          urls: ["http://localhost:<%= connect.options.port %>/index.html"]
        }
      }
    },
    react: {
      source: {
        files: [{
          expand: true,
          cwd: "src",
          src: ["**/*.jsx"],
          dest: "tmp/jsx",
          ext: ".js"
        }]
      }
    },
    globalize: {
      options: {
        locales: ["en", "pt"],
        dest: "dist/i18n-{locale}.js",
        processContent: function(locale, content) {
          return content.replace( /define\( \[/, "define(\"compiled-i18n-data\", [" );
        }
      }
    },
    requirejs: {
      options: extend(
        [extend({}, require("./src/config"))].reduce(function(unused, config) {
          // This prevents duplicating requirejs config in here (Gruntfile), and
          // to allow the slight changes below.
          config.paths.almond = "../bower_components/almond/almond";
          config.paths["globalize-runtime"] = "../bower_components/globalize/dist/globalize-runtime";
          config.paths["compiled-i18n-data"] = "../dist/i18n-en";
          return config;
        }, {}), {
        map: {
          "*": {
            "globalize": "globalize-runtime"
          }
        },
        dir: "tmp/.build",
        appDir: "src",
        baseUrl: ".",
        optimize: "none",
        skipDirOptimize: true,
        skipSemiColonInsertion: true,
        skipModuleInsertion: true,
        findNestedDependencies: true,
        stubModules : ["libs", "text"],
        onBuildWrite: function (id, path, contents) {
          return contents
            .replace(/"globalize"/g, "\"globalize-runtime\"")
            .replace(/"globalize\//g, "\"globalize-runtime\/")
            .replace(/jsx!/g, "");
        }
      }),
      bundles: {
        options: {
          modules: [{
            name: "app",
            include: ["production"],
            exclude: ["libs", "jsx", "compiled-i18n-data"],
            create: true
          }, {
            name: "libs",
            include: ["almond", "libs"],
            exclude: ["jsx"],
            create: true
          }]
        }
      }
    },
    copy: {
      options: {
        processContent: function(content, filename) {
          var module_id = path.basename(filename).split(".")[0];

          content = content

            // Remove unused define created during rjs build.
            .replace(new RegExp("define\\(\"" + module_id + ".*"), "");

          // Embed VERSION and DATE
          return replaceConsts(content);
        }
      },
      dist: {
        expand: true,
        cwd: "tmp/.build/",
        src: [ "app.js", "libs.js" ],
        dest: "dist/"
      }
    },
    uglify: {
      app: {
        src: "dist/app.js",
        dest: "dist/app.min.js"
      },

      i18n: {
        expand: true,
        cwd: "dist/",
        src: "i18n-*.js",
        dest: "dist/",
        rename: function(dest, filename) {
          return path.join(dest, filename.replace( /\.js$/, ".min.js" ));
        }
      },

      libs: {
        src: "dist/libs.js",
        dest: "dist/libs.min.js"
      }
    },
    compare_size: {
      files: [
        "dist/app.min.js",
        "dist/i18n-*.min.js",
        "dist/libs.min.js"
      ],
      options: {
        compress: {
          gz: function(fileContents) {
            return require("gzip-js").zip(fileContents, {}).length;
          }
        }
      }
    },
    clean: {
      dist: [
        "dist"
      ],
      tmp: [
        "tmp"
      ]
    }
  });

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  /*
  grunt.registerTask("test", [
    "connect:test",
    "mocha"
  ]);
  */

  grunt.registerTask("globalize", function() {
    var GlobalizeCompiler = require("./bower_components/globalize/tool/compiler");
    var requirejs = require("requirejs");
    var config = require("./src/config");

    var done = this.async();
    var options = this.options({
      processContent: function(locale, content) {
        return content;
      }
    });

    config.nodeRequire = require;
    config.baseUrl = __dirname + "/src";
    requirejs.config(config);

    var App = requirejs("jsx!app");
    var Globalize = requirejs("globalize");
    var products = requirejs("fixtures/products");
    var React = requirejs("react");

    async.each(options.locales, function(locale, callback) {
      requirejs("i18n-data")(locale, function(error) {
        if (error) {
          return callback(error);
        }

        // Have react to render all passed components, therefore any formatters in
        // use will be created.
        React.renderToString(React.createElement(App, {
          locale: locale,
          products: products
        }));

        // Compile all generated formatters.
        grunt.file.mkdir("dist");
        fs.writeFileSync(
          options.dest.replace(/{locale}/, locale),
          options.processContent(locale, GlobalizeCompiler(Globalize.cache))
        );

        Globalize.cache = {};

        callback();
      });
    }, function(error) {
      if (error) {
        grunt.log.error(error);
        return done(error);
      }
      done();
    });
  });

  grunt.registerTask("default", [
    "clean:tmp",
    "react",
    "jshint",
    //"test",
    "clean:dist",
    "globalize",
    "requirejs",
    "copy",
    "uglify",
    "compare_size"
  ]);

};
