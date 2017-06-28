var path = require('path');
var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var concat = require('gulp-concat')
var source = require('vinyl-source-stream');
var bundle = require('gulp-bundle-assets');
var bulk = require('bulk-require');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var jpegtran = require('imagemin-jpegtran');
var liquify = require('./gulp-liquify');
var data = require('gulp-data');

var axios = require('axios');

var files = {
  html: {
    src: 'theme/layout.html',
    dist: 'dist/'
  },
  data: {
    src: 'data/*.json',
    dist: 'dist/data/'
  },
  css: {
    src: 'theme/*.scss',
    dist: 'dist/'
  },
  fonts: {
    src: 'src/fonts/*',
    dist: 'dist/fonts/'
  },
  images: {
    src: 'src/img/*',
    dist: 'dist/img/'
  },
  foundationJs: {
    src: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/what-input/dist/what-input.js',
      'node_modules/foundation-sites/dist/js/foundation.min.js',
      'src/vendor/js/*.js'
    ],
    dist: 'dist/js/'
  },
  appJs: {
    src: 'src/js/app.js',
    dist: 'dist/js/'
  }
}


// Static Server + watching scss/html files
gulp.task('serve', ['liquify', 'fonts', 'sass', 'images'], () => {
    browserSync.init({
        server: './dist/'
    });
    gulp.watch(files.css.src, ['sass']);
    // gulp.watch(files.images.src, ['images']);
    // gulp.watch(files.fonts.src, ['fonts']);
    gulp.watch([files.html.src, files.data.src], ['liquify']);
    // gulp.watch('src/js/*.js', ['script-watch']);
    gulp.watch('dist/*.html').on('change', browserSync.reload);
});

// Fonts
gulp.task('fonts', () => {
  return gulp.src(files.fonts.src)
    .pipe(gulp.dest(files.fonts.dist))
    .pipe(browserSync.stream());
});

// Images
gulp.task('images', () => {
  return gulp.src(files.images.src)
    .pipe(
      imagemin(
        {
            progressive: true,
            use: [pngquant(), jpegtran()]
        }
      )
    )
    .pipe(gulp.dest(files.images.dist))
    .pipe(browserSync.stream());
});

// gulp.task('data', () => {
//   return gulp.src(files.data.src)
//     .pipe(gulp.dest(files.data.dist));
//
// });

// Data
var getJsonData = function(file) {
  delete require.cache[require.resolve('./data/locals.json')]
  return require('./data/locals.json');
};


// Swig Templates
// gulp.task('templates', () => {
//     gulp.src('theme/layout.html')
//       .pipe(data(getJsonData))
//       .pipe(swig({defaults: { cache: false }}))
//       .pipe(gulp.dest(files.html.dist))
//       .pipe(browserSync.reload({stream:true}))
//       .on('error', (error) => {
//         console.log('Templates: ', error.toString());
//       });
// });

gulp.task("liquify", function() {

  // {
  //   page_title: "Fred",
  //   content_for_header: "hallo warld"
  // };
  gulp.src(files.html.src)
    .pipe(liquify(getJsonData()))
    .pipe(gulp.dest('./dist/'))
});

// gulp.task('data-watch', ['templates'], (done) => {
//   browserSync.reload();
//   done();
// });

// // Compile sass into CSS & auto-inject into browsers
gulp.task('sass', () => {
  return gulp.src(files.css.src)
    .pipe(sass())
    .pipe(gulp.dest(files.css.dist))
    .pipe(browserSync.stream());
});
//
// gulp.task('foundation-scripts', () => {
//   return gulp.src(files.foundationJs.src)
//     .pipe(concat('foundation-scripts.js'))
//     .pipe(gulp.dest(files.foundationJs.dist));
// });
//
// gulp.task('app-scripts', () => {
//   return browserify(files.appJs.src)
//     .bundle()
//     //Pass desired output filename to vinyl-source-stream
//     .pipe(source('app.js'))
//     // Start piping stream to tasks!
//     .pipe(gulp.dest(files.appJs.dist));
// });
//
// gulp.task('script-watch', ['foundation-scripts', 'app-scripts'], (done) => {
//   browserSync.reload();
//   done();
// });


gulp.task('default', ['serve']);
