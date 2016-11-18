const gulp = require('gulp');
const del = require('del');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
// const useref = require('gulp-useref');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const cssmin = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
const replace = require('gulp-replace');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');

const config = {
    src: {
        img: 'images/',
        css: 'css/',
        js: 'js/',
        html: './index.html'
    },
    tmp: {
        js: 'tmp/js/'
    },
    dest: {
        img: 'dist/images/',
        css: 'dist/css/',
        js: 'dist/js/',
        html: 'dist/'
    }
};

var cfg = {
    protocol: 'http',
    hostname: 'localhost',
    port: '9001',
    version: Date.now(),
    socketServer: 'http://localhost:8080'
};

cfg.defaultUrl = `${cfg.protocol}://${cfg.hostname}:${cfg.port}`;
cfg.releaseUrl = `${cfg.protocol}://${cfg.hostname}:${cfg.port}`; //可修改为发布服务器地址



gulp.task('clean', function() {
    del(['dist', 'tmp']);
});

gulp.task('babel', function() {
    return gulp.src(`${config.src.js}**/*.js`)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['babel-preset-es2015'],
            plugins: ['transform-es2015-modules-umd']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.tmp.js));
});

gulp.task('sass', function() {
    return gulp.src(`${config.src.css}**/*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({
                outputStyle: 'expanded'
            })
            .on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest.css));
});

gulp.task('uglify', function() {
    return gulp.src(`${config.tmp.js}*.js`)
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(`${config.dest.js}`));
        // .pipe(browserSync.reload({
        //     stream: true
        // }));
});

// gulp.task('useref', function() {
//     return gulp.src('dist/index.html')
//     .pipe(useref())
//     .pipe(gulp.dest('dist'));
// });

gulp.task('concat', function() {
    // src: ['<%=config.tmp.js%>/global.js',
    //                 '<%=config.tmp.js%>/render.js',
    //                 '<%=config.tmp.js%>/parser.js',
    //                 '<%=config.tmp.js%>/game.js',
    //                 '<%=config.tmp.js%>/socket.js',
    //                 '<%=config.tmp.js%>/main.js'
    //             ],
    return gulp.src([`${config.dest.js}global.js`,
        `${config.dest.js}render.js`,
        `${config.dest.js}parser.js`,
        `${config.dest.js}game.js`,
        `${config.dest.js}socket.js`,
        `${config.dest.js}main.js`])
    .pipe(sourcemaps.init())
    .pipe(concat('main.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dest.js))
    .pipe(browserSync.reload({
        stream: true
    }));
})

gulp.task('imagemin', function() {
    return gulp.src(`${config.src.img}**/*.+(png|jpg|gif|svg)`)
        .pipe(imagemin())
        .pipe(gulp.dest(config.dest.img));
});

gulp.task('cssmin', function() {
    return gulp.src(`${config.dest.css}**/*.css`)
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest.css))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('copy', function() {
    return gulp.src('./index.html')
        .pipe(gulp.dest(config.dest.html));
});

gulp.task('replace', function() {
    var pattern = {
        baseUrl: './',
        version: cfg.version,
        baseUrl: cfg.baseUrl,
        socketServer: cfg.socketServer
    };
    return gulp.src(`${config.dest.html}/index.html`)
        .pipe(replace(/@@version/g, pattern.version))
        // .pipe(replace(/@@baseUrl/g, pattern.baseUrl))
        .pipe(replace(/@@socketServer/g, pattern.socketServer))
        .pipe(gulp.dest(config.dest.html))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    });
})

gulp.task('watch', ['browserSync'], function() {
    gulp.watch(`${config.src.css}**/*.scss`, function() {
        runSequence('sass', 'cssmin');
    });
    gulp.watch(`${config.src.js}**/*.js`, function() {
        runSequence('babel', 'uglify', 'concat');
    });
    gulp.watch(`${config.src.html}`, function() {
        runSequence('copy', 'replace');
    });
})


gulp.task('dev', function() {
    runSequence('clean', 'babel', 'sass', 'copy', ['uglify', 'imagemin', 'cssmin'],
        'concat',
        'replace'
    );
});

gulp.task('server', function() {
    runSequence('watch');
});