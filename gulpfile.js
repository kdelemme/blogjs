var gulp = require('gulp');

var concat = require('gulp-concat');

var paths = {
  scripts: ['app/js/**/*.js']
};

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  return gulp.src(paths.scripts)
    .pipe(concat('blog.js'))
    .pipe(gulp.dest('app/js'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts']); 

gulp.task('ci', ['scripts', 'watch']);