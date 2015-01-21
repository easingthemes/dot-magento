module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);
    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    var xpath = require('xpath'),
    dom = require('xmldom').DOMParser;
    // Configurable paths
    var config = {
        package: 'new-package', // choose package name
        theme: 'default',
        fallbackTheme: 'rwd/default',
        host: 'localhost',
        root: '/home/limafil/git/dot-magento/magento',
        magentoRoot: '../magento', // relative from this file
        dist: 'dist',
        //end of settings
        packageApp: 'app/design/frontend/<%= config.package %>',
        packageSkin: 'skin/frontend/<%= config.package %>',
        themeApp: '<%= config.packageApp %>/<%= config.theme %>',
        themeSkin: '<%= config.packageSkin %>/<%= config.theme %>',
        magApp: '<%= config.magentoRoot %>/app/design/frontend/<%= config.fallbackTheme %>',
        magSkin: '<%= config.magentoRoot %>/skin/frontend/<%= config.fallbackTheme %>',
        tmp: '<%= config.dist %>/<%= config.themeSkin %>/.tmp',
        globalJs: []
    };
    // Directories scaffolding
    grunt.registerTask('init', function() {
        var magApp = config.magentoRoot+'/app/design/frontend/'+config.fallbackTheme;
        var themeApp = config.dist+'/app/design/frontend/'+config.package+'/'+config.theme;
        var themeSkin = config.dist+'/skin/frontend/'+config.package+'/'+config.theme;
        var bowerrc = '{ \n  "directory" : "'+themeSkin+'/bower_components"\n}';
        var xml =  grunt.file.read(magApp + '/layout/page.xml');
        var doc = new dom().parseFromString(xml);
        var globalScripts = xpath.select("//default/block[@name='root']/block[@name='head']/action[@method='addJs']/script", doc);
        var skinScripts = xpath.select("//default/block[@name='root']/block[@name='head']/action[@method='addItem']/type[text()='skin_js']/following-sibling::name", doc);
        var removeGlobalJs = '';
        //var globalJs = grunt.option('globalJs');
        //var globalJs = [];
        for (var i = 0; i < globalScripts.length; i++) {
          removeGlobalJs = removeGlobalJs + '    <action method="removeItem"><type>js</type><name>'+globalScripts[i].firstChild.data+'</name></action>\n';
          config.globalJs.push(globalScripts[i].firstChild.data);
        };
        console.log(config.globalJs)
        var removeSkinJs = '';
        for (var i = 0; i < skinScripts.length; i++) {
          removeSkinJs = removeSkinJs + '    <action method="removeItem"><type>skin_js</type><name>'+skinScripts[i].firstChild.data+'</name></action>\n';
        };
        var localxml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<layout>\n' +
        '<default>\n' +
        '  <reference name="head">\n' +
        '    <block type="core/text" name="livereload">\n' +
        '      <action method="setText"><text><![CDATA[<script src="http://localhost:35729/livereload.js"></script>]]></text></action>\n' +
        '    </block>\n' +
        removeGlobalJs + removeSkinJs +
        '    <action method="addJs"><script>global.min.js</script></action>\n' +
        '    <action method="addItem"><type>skin_js</type><name>js/skin.min.js</name></action>\n' +
        '    <!-- bower:js -->\n      <!-- endbower -->\n' +
        '    <!-- bower:css -->\n      <!-- endbower -->\n' +
        '  </reference>\n' +
        '</default>\n' +
        '</layout>\n';
        var themexml = '<?xml version="1.0" encoding="UTF-8"?>\n<theme>\n  <parent>rwd/default</parent>\n</theme>\n';
        var mode = 0775;
        grunt.file.write('.bowerrc', bowerrc);
        //grunt.file.mkdir(themeSkin+'/scss' ,mode);
        grunt.file.write(''+themeApp+'/layout/local.xml', localxml);
        grunt.file.write(''+themeApp+'/etc/theme.xml', themexml);
        grunt.file.write(''+themeSkin+'/scss/_custom.scss', '// Custom scss file');
    });
    grunt.initConfig({

        // Project settings
        config: config,

        // Empties folders to start fresh
        clean: {
          dist: {
            files: [{
              dot: true,
              src: [
                '<%= config.dist %>/*',
                '!<%= config.dist %>/.git*'
              ]
            }]
          }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
          options: {
            //jshintrc: '.jshintrc',
            reporter: require('jshint-stylish')
          },
          all: [
            'Gruntfile.js'
            //'<%= config.app %>/scripts/{,*/}*.js',
            //'!<%= config.app %>/scripts/vendor/*',
            //'test/spec/{,*/}*.js'
          ]
        },
        // Symlink to Magento installation
        symlink: {
          // Enable overwrite to delete symlinks before recreating them
          options: {
            overwrite: false
          },
          app: {
            src: '<%= config.dist %>/<%= config.packageApp %>',
            dest: '<%= config.root %>/<%= config.packageApp %>'
          },
          skin: {
            src: '<%= config.dist %>/<%= config.packageSkin %>',
            dest: '<%= config.root %>/<%= config.packageSkin %>'
          }
        },
       
        // Automatically inject Bower components into the local.xml file
        wiredep: {
            app: {
                ignorePath: /^\/|\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/skin\/frontend\/new-package\/default\//,
                src: ['<%= config.dist %>/<%= config.themeApp %>/layout/local.xml'],
                exclude: [
                  'bower_components/jquery/dist/jquery.js'
                ],
                fileTypes: {
                    xml: {
                      block: /(([ \t]*)<!--\s*bower:*(\S*)\s*-->)(\n|\r|.)*?(<!--\s*endbower\s*-->)/gi,
                      detect: {
                        css: /<action method=\"addItem\"><type>skin_css<\/type><name>*<\/name><params\/><\/action>/gi,
                        js: /<action method=\"addItem\"><type>skin_js<\/type><name>*<\/name><params\/><\/action>/gi
                      },
                      replace: {
                        js: '<action method="addItem"><type>skin_js</type><name>{{filePath}}</name><params/></action>',
                        css: '<action method="addItem"><type>skin_css</type><name>{{filePath}}</name><params/></action>'
                      }
                    }
                }
            }
        },
        // Copies style.scss and var.scss from rwd theme.
        copy: {
            dist: {
              expand: true,
              dot: true,
              cwd: '<%= config.magSkin %>/scss',
              dest: '<%= config.dist %>/<%= config.themeSkin %>/scss',
              src: [
                '_var.scss',
                'styles.scss'
              ]
            }
        },

        file_append: {
            default_options: {
              files: [
                {
                  append: "@import \"custom\";",
                  //prepend: "text to prepend",
                  input: '<%= config.dist %>/<%= config.themeSkin %>/scss/styles.scss',
                  output: '<%= config.dist %>/<%= config.themeSkin %>/scss/styles.scss'
                }
              ]
            }
        },
        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
          options: {
            compass: true,
            style: 'compressed',
            update: true,
            loadPath: ['bower_components', '<%= config.magSkin %>/scss']
            },
          dist: {
            files: [{
              expand: true,
              cwd: '<%= config.dist %>/<%= config.themeSkin %>/scss',
              src: ['*.{scss,sass}'],
              dest: '<%= config.dist %>/<%= config.themeSkin %>/css',
              ext: '.css'
            }]
          }
        },
        // Add vendor prefixed styles
        autoprefixer: {
          options: {
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1']
          },
          dist: {
            files: [{
              expand: true,
              cwd: '<%= config.tmp %>/css/',
              src: '{,*/}*.css',
              dest: '<%= config.tmp %>/css/'
            }]
          }
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
          bower: {
            files: ['bower.json'],
            tasks: ['wiredep']
          },
          js: {
            files: ['<%= config.dist %>/<%= config.themeSkin %>/js/{,*/}*.js'],
            tasks: ['jshint'],
            options: {
              livereload: true
            }
          },
          gruntfile: {
            files: ['Gruntfile.js']
          },
          sass: {
            files: ['<%= config.dist %>/<%= config.themeSkin %>/scss/{,*/}*.{scss,sass}'],
            tasks: ['sass']
          },
          livereload: {
            options: { livereload: true },
            files: [
            '<%= config.dist %>/<%= config.themeSkin %>/css/**/*.css',
            '<%= config.dist %>/<%= config.themeSkin %>/images/{,*/}*'
            ]
          }
        },
        // Run some tasks in parallel to speed up build process
        concurrent: {
          styles: [
            'watch:sass',
            'watch:css'
          ]
        },
        uglify: {
          dist: {
            files: {
              'dest/global.min.js': '<%= config.globalJs %>'
            }
          }
        }
    });

    grunt.registerTask('install', [
        'clean',
        'jshint',
        'init',
        'symlink',
        'copy',
        'file_append'
    ]);
    grunt.registerTask('bower', [
        'jshint',
        'wiredep'
    ]);    
    grunt.registerTask('ap', [
        'concurrent'
    ]);
};