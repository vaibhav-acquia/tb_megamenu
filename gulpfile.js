const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const size = require('gulp-size');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const sass = require('gulp-sass');
const sassLint = require('gulp-sass-lint');
const cached = require('gulp-cached');
const esLint = require('gulp-eslint');
const options = {};

// The root paths are used to construct all the other paths in this
// configuration. The "project" root path is where this gulpfile.js is located.
options.rootPath = {
  project: __dirname + '/',
  theme: __dirname + '/',
};

options.theme = {
  root: options.rootPath.theme,
  scss: options.rootPath.theme + 'scss/',
  es6: options.rootPath.theme + 'es6/',
  css: options.rootPath.theme + 'css/compiled/',
  js: options.rootPath.theme + 'js/',
};

// Define the node-scss configuration.
options.scss = {
  // importer: importOnce,
  outputStyle: 'expanded',
  lintIgnore: [],
  sourceComments: true,
  includePaths: [
    // options.rootPath.project + "node_modules/foundation-sites/scss",
  ],
};

var scssFiles = [
  options.theme.scss + '**/*.scss',
  // Do not open scss partials as they will be included as needed.
  '!' + options.theme.scss + '**/_*.scss',
];

const jsScripts = [options.theme.es6 + '**/*.es6.js'];

// Clean the dist directory.
gulp.task('clean:dist', () => del([options.rootPath.theme + 'vendors']));

// Clean CSS
gulp.task('clean:css', () => del([options.theme.css + '**/*.css']));

// Clean JS
gulp.task('clean:js', () => del([options.theme.js + '**/*.js']));

// Copy vendor files from node_modules to the /dist directory.
gulp.task('vendorcopy', (done) => {
  // gulp
  //   .src(options.rootPath.theme + "node_modules/foundation-sites/dist/**/*")
  //   .pipe(gulp.dest(options.rootPath.theme + "dist/vendors/foundation"));

  // gulp
  //   .src(options.rootPath.theme + "node_modules/what-input/dist/**/*")
  //   .pipe(gulp.dest(options.rootPath.theme + "dist/vendors/what-input"));

  done();
});

// A task to clean up and copy vendor files.
gulp.task('vendorfiles', gulp.series('clean:dist', 'vendorcopy'));

// Lint Sass.
gulp.task('lint:scss', () =>
  gulp
    .src(options.theme.scss + '**/*.scss')
    // Use gulp-cached to check only modified files.
    .pipe(
      sassLint({
        files: {
          include: cached('sassLint'),
          ignore: options.scss.lintIgnore,
        },
      })
    )
    .pipe(sassLint.format())
);

// Lint JavaScript.
gulp.task('lint:js', () =>
  gulp.src(jsScripts).pipe(esLint()).pipe(esLint.format())
);

// Compile SCSS
gulp.task(
  'scss',
  gulp.series('clean:css', 'lint:scss', () =>
    gulp
      .src(scssFiles)
      .pipe(sourcemaps.init())
      // Allow the options object to override the defaults for the task.
      .pipe(sass(options.scss).on('error', sass.logError))
      .pipe(autoprefixer(options.autoprefixer))
      .pipe(rename({ dirname: '' }))
      .pipe(size({ showFiles: true }))
      .pipe(sourcemaps.write('./maps'))
      .pipe(gulp.dest(options.theme.css))
  )
);

// Transpile ES6
gulp.task(
  'es6',
  gulp.series('clean:js', 'lint:js', () =>
    gulp
      .src(jsScripts)
      .pipe(
        babel({
          presets: ['@babel/env'],
        })
      )
      // Strip .es6 from file names.
      .pipe(
        rename(function (path) {
          path.basename = path.basename.substr(0, path.basename.length - 4);
        })
      )
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(options.theme.js))
  )
);

// Watch task.
// gulp.task("watch", () => {
//   gulp.watch(options.theme.scss + "**/*.scss", gulp.series("scss"));
//   gulp.watch(jsScripts, gulp.series("es6"));
//   return;
// });
gulp.task('watch', () => {
  gulp.watch(options.theme.scss + '**/*.scss', gulp.series('scss'));
  // gulp.watch(jsScripts, gulp.series("es6"));
  return;
});

// Build task.
// gulp.task("build", gulp.parallel("scss", "es6", "vendorfiles"));
gulp.task('build', gulp.parallel('scss'));

// The default task.
gulp.task('default', gulp.series('build'));
