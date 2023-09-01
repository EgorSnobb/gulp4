const { src, dest, parallel, series, watch } = require('gulp');

const browserSync   = require('browser-sync').create();
const concat        = require('gulp-concat');
const uglify        = require('gulp-uglify-es').default;
const scss          = require('gulp-sass')(require('sass'));
const autoprefixer  = require('gulp-autoprefixer');
const clean         = require('gulp-clean');
const imagemin      = require('gulp-imagemin');
const changed       = require('gulp-changed');
const fonter        = require('gulp-fonter');
const ttf2woff2     = require('gulp-ttf2woff2');
const include       = require('gulp-include');

function browsersync() {
  browserSync.init ({
    server: { baseDir: 'app/' },
    notify: false,
    online: true,
  });
}

function pages() {
  return src('app/pages/*.html')
  .pipe(include({
    includePaths : 'app/parts/'
  }))
  .pipe(dest('app'))
  .pipe(browserSync.stream())
}

function scripts() {
  return src('app/js/app.js')
  .pipe(concat('app.min.js'))
  .pipe(uglify())
  .pipe(dest('app/js/'))
  .pipe(browserSync.stream())
}

function styles() {
  return src('app/scss/style.scss')
  .pipe(autoprefixer({ overrideBrowserlist: ['last 10 version'] }))
  .pipe(concat('app.min.css'))
  .pipe (scss({ outputStyle: 'compressed' }))
  .pipe(dest('app/css/'))
  .pipe(browserSync.stream())
}

function startwatch() {
  watch ('app/scss/style.scss', styles);
  watch ('app/images/src/**/*', images);
  watch (['app/**/*.js','!app/**/*.min.js'], scripts);
  watch (['app/components/*','app/pages/*'], pages);
  watch ('app/**/*.html').on('change', browserSync.reload)
}

function cleanDist() {
  return src('dist')
  .pipe(clean())
}

function images() {
	return src(['app/images/src/**/*'])
		.pipe(changed('app/images/dist'))
		.pipe(imagemin())
		.pipe(dest('app/images/dist'))
		.pipe(browserSync.stream())
}

function fonts() {
  return src('app/fonts/src/*.*')
  .pipe(fonter({
    formats: ['woff', 'ttf']
  }))
  .pipe(src('app/fonts/*.ttf'))
  .pipe(ttf2woff2())
  .pipe(dest('app/fonts'))
}

function building() {
  return src([
    'app/css/app.min.css',
    'app/images/**/*.*',
    '!app/images/src/**/*',
    'app/fonts/*.*',
    'app/js/app.min.js',
    'app/**/*.html'
  ], { base : 'app' } )
  .pipe(dest('dist'))
}


exports.browsersync = browsersync;
exports.scripts     = scripts;
exports.styles      = styles;
exports.images      = images;
exports.fonts       = fonts;
exports.building    = building;
exports.pages       = pages;

exports.build       = series(cleanDist, images, building);
exports.default     = parallel(styles, scripts, images, pages, browsersync, startwatch);