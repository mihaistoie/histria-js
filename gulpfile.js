let path = require('path');
let gulp = require('gulp');
let del = require('del');
let merge = require('merge2');
let ts = require('gulp-typescript');
let sourcemaps = require('gulp-sourcemaps');
let tslint = require('gulp-tslint');

gulp.task('clean', () => {
    return del([
        'definitions/',
        'test/',
        'lib/',
        './test/**/*.js',
        './src/**/*.js',
        './src/**/*.d.ts',
        './index.d.ts',
        './index.d.ts.map',
        './index.js',
        './index.js.map'
    ]);

});

gulp.task('tslint', () => {
    return gulp.src("src/**/*.ts")
        .pipe(tslint({
            formatter: "verbose"
        }))
        .pipe(tslint.report())
});


gulp.task('ts', () => {
    const tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    const tsResult = gulp.src(['./src/**/*.ts', '!./src/test/**'])
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js
            .pipe(sourcemaps.mapSources(function (sourcePath, file) {
                let len = sourcePath.split('/').length - 1;
                let a = [];
                for (let i = 0; i < len; i++) {
                    a.push('..');
                }
                prefix = a.join('/');
                if (!prefix) prefix = '.';
                return prefix + '/src/' + sourcePath;
            }))
            .pipe(sourcemaps.write('.', { includeContent: false }))
            .pipe(gulp.dest(path.resolve('./')))
    ]);

});

gulp.task('test-compile', () => {
    const tsProject = ts.createProject(path.resolve('./tsconfig.json'));
    const tsResult = gulp.src(['./src/**/*.ts', '!./src/lib/**', '!./src/index.ts'])
        .pipe(sourcemaps.init())
        .pipe(tsProject());
    return tsResult.js
        .pipe(sourcemaps.mapSources(function (sourcePath, file) {
            let len = sourcePath.split('/').length - 1;
            let a = [];
            for (let i = 0; i < len; i++) {
                a.push('..');
            }
            prefix = a.join('/');
            if (!prefix) prefix = '.';
            return prefix + '/src/' + sourcePath;
        }))
        .pipe(sourcemaps.write('.', { includeContent: false }))
        .pipe(gulp.dest(path.resolve('./')));
});

gulp.task('test', gulp.series('test-compile'));
gulp.task('build', gulp.series('clean', 'tslint', 'ts', 'test'));
gulp.task('default', gulp.series('build'));