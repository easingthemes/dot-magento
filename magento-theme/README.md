# dot-magento
Magento one page app

1. Magento
2. Angular
3. MySql
4. PHP
5. jQuery
6. Bower
7. Grunt
8. Sass

- Minimize js / css
- Concate js / css
- Compile Sass
- Create package structure

## Grunt and Bower setup

####1. NODE: Install node modules

`npm install`

####3. GRUNT: Scaffold directories and base files

Configure Grunt with your package and theme name and install your theme:

 `grunt install` // run only once

Tasks list:

1. jshint: check js files
2. clean: Delete all folders to start fresh
3. init: Create directories structure and basic files:
 `.bowerrc` file to install components in skin directory
 `local.xml` file with `wiredep` code
 `custom.scss`
4. copy: Copy `var.scss` and `style.scss` from **rwd** package to new package.
5. file_append: Include `custom.scss` in `style.scss`
6. symlink: Symlink to Magento installation

####4. BOWER: Install bower components

`bower install`

1. Change bower.json to include new components, then run `bower install`
2. Or install component with `bower install nivo-slider --save`
3. Add new bower components to `local.xml` with wiredep

`grunt bower` // run every whenever new bower component is added

####5. SASS: Compile sass files

1. Add fallback theme import path,
2. Add compass
3. Compile to css

####6. WATCH: Watch changes

1. sass: compile on change
2. livereload: soft livereload on css change
3. js: jshint and livereload on change

####7. PRODUCTION:
1. `autoprefixer`
2. uglify
3. `concat`
4. imagemin
5. cssmin