var path = require('path');
var gulp = require('gulp');
var del = require('del');
var merge = require('merge2');
var ts = require('gulp-typescript');
var runSequence = require('run-sequence');



gulp.task('clean', function () {
    return del([
        'lib/',
        'definitions/',
        './test/**/*.js',
        './src/**/*.js',
        './src/**/*.d.ts',
        './index.js'
    ]);

});


gulp.task('ts', ['clean'], function () {
    var tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    var tsResult = gulp.src(path.resolve('./src/**/*.ts')).pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest('definitions')),
        tsResult.js.pipe(gulp.dest(path.resolve('./')))
    ]);

});


gulp.task('build', function (done) {
    runSequence('ts', done);
});

gulp.task('default', ['build']);