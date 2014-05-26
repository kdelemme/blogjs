var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');

var paths = {
    scripts: ['app/js/**/*.js'],
    styles: ['app/css/style.less'] 
};

gulp.task('scripts', function() {
    // concat and copy all JavaScript
    return gulp.src(paths.scripts)
        .pipe(concat('blog.js'))
        .pipe(gulp.dest('app/dist/js'));
});

gulp.task('styles', function() {
	return gulp.src(paths.styles)
		.pipe(less())
		.pipe(gulp.dest('app/dist/css'));
})

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts', 'styles']); 
