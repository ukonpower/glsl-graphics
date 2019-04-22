import gulp from 'gulp';
import minimist from 'minimist';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import webpackConfig from './webpack.config.js';
import browserSync from 'browser-sync';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import cssmin from 'gulp-cssmin';
import pug from 'gulp-pug';
import del from 'del';

const options = minimist(process.argv.slice(2), {
    default: {
        gl: '1',
        P: false,
    }
});

const srcBase = './src/gl' + options.gl + "/";

gulp.task("webpack", () => {
    let conf = webpackConfig;
    conf.entry.main = srcBase + '/js/main.js';
    conf.output.filename = 'main.js';

    if (options.P) {
        conf.mode = 'production';
    } else {
        conf.mode = 'development'
    }

    return webpackStream(conf, webpack).on('error', function (e) {
            this.emit('end');
        })
        .pipe(gulp.dest("./public/gl/js/"))
        .unpipe(browserSync.reload());
});

gulp.task('pug', () => {
    return gulp.src(['./src/pug/**/*.pug', '!./src/pug/**/_*.pug'])
        .pipe(plumber())
        .pipe(pug({
            pretty: true,
            locals: {
                title: 'gl' + options.gl,
            }
        }))
        .pipe(gulp.dest('./public/gl/'));
});

gulp.task("sass", () => {
    return gulp.src("./src/scss/style.scss")
        .pipe(plumber())
        .pipe(autoprefixer())
        .pipe(sass())
        .pipe(cssmin())
        .pipe(gulp.dest("./public/css/"))
        .pipe(browserSync.stream());
});

gulp.task('copy', (c) => {
    gulp.src([srcBase + 'assets/**/*']).pipe(gulp.dest('./public/gl/assets/'));
    c();
});

gulp.task('browser-sync', () => {

    browserSync.init({
        server: {
            baseDir: "public/",
            index: "index.html"
        },
        startPath: './gl/',
    });
});

gulp.task('reload', () => {
    browserSync.reload();
})

gulp.task('clean', (c) => {
    del([
        './public/',
    ], {
        force: true,
    }).then(paths => {
        // eslint-disable-next-line no-console
        c();
        console.log('Files and folders that would be deleted:\n', paths.join('\n'));
    });
});

gulp.task('watch', () => {
    gulp.watch(srcBase + 'js/**/*', gulp.series('webpack'));
    gulp.watch('./src/scss/*.scss', gulp.task('sass'));
    gulp.watch('./src/pug/**/*.pug', gulp.task('pug'));
    gulp.watch(srcBase + '**/*', gulp.task('copy'));
});

gulp.task('default', gulp.series(
    'clean',
    'copy',
    gulp.parallel(
        'webpack', 'sass', 'pug'
    ),
    gulp.parallel('browser-sync', 'watch'),
))