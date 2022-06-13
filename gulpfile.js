const gulp = require('gulp');
const { parallel, watch, series } = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const gp = gulpLoadPlugins();
const spritesmith = require('gulp.spritesmith');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const image = require('gulp-image');
const del = require('del');

// var global
let fileNameWatch = '*';

// get base folder
let gulpRanInThisFolder = process.cwd();
let baseArray = gulpRanInThisFolder.split("\\");
let baseFolder = gulpRanInThisFolder+'/app';


// set config
let dev = true;
let config = {
    tmp: {
        img: 'app/assets/images',
        css: '.tmp/assets/css',
        js: '.tmp/assets/js',
        html: '.tmp',
        font: '.tmp/assets/fonts',
        webpack: './webpack.dev.js'
    },
    dist: {
        img: 'dist/assets/images',
        css: 'dist/assets/css',
        js: 'dist/assets/js',
        html: 'dist',
        font: 'dist/assets/fonts',
        webpack: './webpack.prod.js'
    }

};


function removeDevMode(cb) {
    dev = false;
    cb();
}
function setDevMode(cb) {
    dev = true;
    cb();
}

function reloadBrowser(cb) {
    browserSync.reload();
    cb();
};

function css() {
    return gulp.src(`app/assets/css/*.scss`)
    .pipe(gp.plumber())
    .pipe(gp.sassGlob())
    .pipe(gp.if(dev, gp.sourcemaps.init()))
    .pipe(gp.sass.sync({
        outputStyle: "expanded",
        precision: 10,
        includePaths: ['.', 'node_modules'],
    }).on('error', gp.sass.logError))
    .pipe(gp.autoprefixer({ Browserslist: ['> 1%', 'last 5 versions', 'Firefox ESR'] }))
    .pipe(gp.if(dev, gp.sourcemaps.write('.'), gp.cssnano({ safe: true, autoprefixer: false })))
    .pipe(gp.if(dev, gulp.dest(config.tmp.css), gulp.dest(config.dist.css)))
    .pipe(gp.plumber.stop())
    .pipe(reload({
        stream: true
    }))
}

function js() {
    if(dev == true) {
        return gulp.src('app/assets/js/*.js')
        .pipe(gp.plumber())
        .pipe(webpackStream(require(config.tmp.webpack), webpack))
        .pipe(gulp.dest(config.tmp.js))
        .pipe(gp.plumber.stop())
    } else {
        return gulp.src('app/assets/js/*.js')
        .pipe(gp.plumber())
        .pipe(webpackStream(require(config.dist.webpack), webpack))
        .pipe(gulp.dest(config.dist.js))
        .pipe(gp.plumber.stop())
    }

};

function html() {
    return gulp.src('app/*.twig')
    .pipe(gp.plumber())
    .pipe(gp.data(function(file) {
        fileNameWatch = path.basename(file.path, '.twig');
        return JSON.parse(fs.readFileSync('app/_data/build/'+ fileNameWatch +'.json'));
    }))
    .pipe(gp.twig({
        base:baseFolder,
        functions:[
            {
                name: "__",
                func: function (string,theme) {
                    return string;
                }
            },
            {
                name: "parseFloat",
                func: function (string) {
                    return parseFloat(string);
                }
            }
        ],
        filters: [
            {
                name: "resize",
                func: function (value) {
                    return value;
                }
            }
        ]
    }))
    .pipe(gp.if(dev, gulp.dest(config.tmp.html), gulp.dest(config.dist.html)))
    .pipe(gp.plumber.stop())
};

function mergeData() {
    return gulp.src(['app/*.twig'])
    .pipe(gp.plumber())
    .pipe(gp.tap(function(file, t) {
        fileNameWatch = path.basename(file.path, '.twig');
        let tempDataFiles = ['app/_data/global/*.json'];
        // console.log(fileNameWatch);
        if (fs.existsSync('app/_data/pages/'+ fileNameWatch +'.json')) {
            tempDataFiles.push('app/_data/pages/'+ fileNameWatch +'.json');
        }
        return gulp.src(tempDataFiles)
        .pipe(gp.mergeJson({
            fileName: fileNameWatch+'.json',
            mergeArrays: false
        }))
        .pipe(gulp.dest('app/_data/build/'));
    }))
    .pipe(gp.plumber.stop())
}

function fonts() {
    return gulp.src('app/assets/fonts/**/*')
    .pipe(gp.plumber())
    .pipe(gp.if(dev, gulp.dest(config.tmp.font), gulp.dest(config.dist.font)))
    .pipe(gp.plumber.stop());
}

function images() {
    return gulp.src([
        `app/assets/images/**/*`,
        `!app/assets/images/sprites-retina`,
        `!app/assets/images/sprites`,
        `!app/assets/images/sprites-retina/**`,
        `!app/assets/images/sprites/**`,
    ])
    .pipe(gp.plumber())
    .pipe(gulp.dest(config.dist.img))
    .pipe(gp.plumber.stop());
}

function imagemin() {
    return gulp.src([
        `app/assets/images/**/*`,
        `!app/assets/images/sprites-retina`,
        `!app/assets/images/sprites`,
        `!app/assets/images/sprites-retina/**`,
        `!app/assets/images/sprites/**`,
        `!app/assets/images/spritesSVG/*`
    ])
    //.pipe(gp.plumber())
    .pipe(gp.tap(function(file, t) {
        var distFilePath = file.path.replace('app','dist');
        //console.log(file.path);
        if (fs.existsSync(distFilePath)) {
            //console.log('exist');
        } else {
            // console.log('no-exist');
            // console.log(distFilePath.replace(gulpRanInThisFolder+'\\dist\\assets\\images\\',''));
            // console.log(path.dirname(file.path));
            return gulp.src(file.path)
            .pipe(image({
                jpegRecompress: ['--strip', '--quality', 'veryhigh', '--min', 40, '--max', 90],
                mozjpeg: false
            }))
            .pipe(gulp.dest(config.dist.img + path.dirname(file.path).replace('app','dist').replace(gulpRanInThisFolder+'\\dist\\assets\\images','')))
        }
    }))
    //.pipe(gp.plumber.stop());
}

function sprite(cb) {
    let spriteData = gulp.src(`app/assets/images/sprites/*.png`).pipe(spritesmith({
        retinaSrcFilter: [`app/assets/images/sprites/*@2x.png`],
        imgName: '../images/sprites.png',
        retinaImgName: '../images/sprites@2x.png',
        cssName: '_sprites.scss',
    }));

    let imgStream = spriteData.img
        .pipe(gulp.dest(`app/assets/images/`));

    let cssStream = spriteData.css
        .pipe(gulp.dest(`app/assets/css/`));

    cb();
}

function spriteSVG(cb) {
    return gulp.src('app/assets/images/spritesSVG/*.svg')
        .pipe(gp.svgSprites({
            selector: "svg-%f",
            cssFile: "css/_spritesSVG.scss",
            svg: {
                sprite: "images/spritesSVG.svg"
            },
            preview: false
        }))
        .pipe(gulp.dest(`app/assets`));
    cb();
}

function removeCompressedSprites(cb) {
    return del([
        `dist/assets/images/sprites.png`,
        `dist/assets/images/sprites@2x.png`,
        `dist/assets/images/spritesSVG.svg`
    ])
}

function serve(cb) {
    browserSync.init({
        notify: true,
        port: 9000,
        reloadDelay: 100,
        logLevel: 'info',
        online: true,
        open: 'external',
        server: {
            baseDir: ['.tmp', 'app'],
            directory: true,
            routes: {
                '/node_modules': 'node_modules',
            },
        },
    })
    watchFiles();
    cb();
}

function watchFiles() {
    watch('app/assets/css/**/*.scss', css );
    watch('app/assets/js/**/*.js', jsWatch );
    watch(['app/assets/images/**/*'], reloadBrowser );
    watch('app/assets/images/spritesSVG/*.svg', spriteSVG );
    watch('app/**/*.twig').on('add', mergeDataWatch );
    watch('app/**/*.twig').on('change', htmlWatch );
    watch(['app/_data/global/*.json', 'app/_data/pages/*.json'], mergeDataWatch );
}


// function webpacktest() {
//     console.log('run webpack');
//     css();
// }

function jsWebpack(done) {
    if(dev) {
        webpack(require(config.tmp.webpack)).run(onBuild(done));
    } else {
        webpack(require(config.dist.webpack)).run(onBuild(done));
    }
}
function onBuild(done) {
    return function(err, stats) {
        if (err) {
            console.log('Error', err);
            if (done) {
                done();
            }
        } else {
            Object.keys(stats.compilation.assets).forEach(function(key) {
                console.log('Webpack: output '+ key);
            });
            console.log('Webpack: finished ' + stats.compilation.name)
            if (done) {
                done();
            }
        }
    }
}

const jsWatch = series(js,reloadBrowser);
const htmlWatch = series(html,reloadBrowser);
const mergeDataWatch = series(mergeData,html,reloadBrowser);

exports.serve = series(setDevMode,parallel(mergeData, spriteSVG, js, fonts), css, html, serve);
exports.build = series(removeDevMode, removeCompressedSprites, parallel(mergeData, spriteSVG, images, js, fonts/*, imagemin*/), css, html);
exports.js = js;
exports.jsWebpack = jsWebpack;
exports.sprite = sprite;
exports.spriteSVG = spriteSVG;
exports.css = css;
