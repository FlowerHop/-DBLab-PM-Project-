var gulp = require ('gulp');
var sourcemaps = require ('gulp-sourcemaps');
var babel = require ('gulp-babel');


gulp.task ("es6Transform", function () {
  return gulp.src ("src/*.js")
  .pipe (sourcemaps.init ())
  .pipe (babel ())
  .pipe (gulp.dest (""));
});