module.exports = function(grunt) {

  "use strict";

  var path = require("path");
  var pkg = require("./package.json");
  var util = require("util");

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
    requirejs: {
      options: util._extend(
        [require("./src/config")].reduce(function(unused, config) {
          // We chose to avoid having the config json object present on the
          // built file. Therefore, we're using this hack to prevent duplicating
          // config (from src/app.js) in here (Gruntfile), and to allow the
          // slight changes below.
          config.paths.almond = "../bower_components/almond/almond";
          return config;
        }, {}), {
        dir: "dist/.build",
        appDir: "src",
        baseUrl: ".",
        optimize: "none",
        skipDirOptimize: true,
        skipSemiColonInsertion: true,
        skipModuleInsertion: true,
        findNestedDependencies: true,
        logLevel: 2,
        stubModules : ["config", "libs", "text"],
        onBuildWrite: function (id, path, contents) {
          return contents.replace(/jsx!/g, "");
        }
      }),
      bundles: {
        options: {
          modules: [{
            name: "app",
            include: ["main"],
            exclude: ["libs", "jsx"],
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
        cwd: "dist/.build/",
        src: [ "app.js", "libs.js" ],
        dest: "dist/"
      }
    },
    uglify: {
      app: {
        src: "dist/app.js",
        dest: "dist/app.min.js"
      },

      libs: {
        src: "dist/libs.js",
        dest: "dist/libs.min.js"
      }
    },
    compare_size: {
      files: [
        "dist/app.min.js",
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
  grunt.registerTask("default", [
    "clean:tmp",
    "react",
    "jshint",
    //"test",
    "clean:dist",
    "requirejs",
    "copy",
    "uglify",
    "compare_size"
  ]);

};
