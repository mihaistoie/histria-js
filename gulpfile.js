let path = require('path');
let gulp = require('gulp');
let del = require('del');
let merge = require('merge2');
let tslint = require('gulp-tslint');
let ts = require('gulp-typescript');



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


gulp.task('ts', ['tslint'], function () {
    let tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    let tsResult = gulp.src(['./src/**/*.ts', '!./src/test/**']).pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest('definitions')),
        tsResult.js.pipe(gulp.dest(path.resolve('./')))
    ]);

});

gulp.task('test', ['ts'], function () {
    let tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    let tsResult = gulp.src(['./src/test/**/*.ts']).pipe(tsProject());
    tsResult.js.pipe(gulp.dest(path.resolve('./test')))
});

gulp.task('tslint', ['clean'], () => {
    return gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
});




gulp.task('build', ['test']);
gulp.task('default', ['build']);