const {
	src,
	dest,
	series,
	watch
  } = require('gulp');
const gulp = require('gulp');
const browserSync = require('browser-sync');
const del = require('del');
const fileInclude = require('gulp-file-include');
const sass = require('sass');
const gulpSass = require('gulp-sass');
const mainSass = gulpSass(sass);


// Path
const sourceFolder = './src';
const buildFolder = './app';
const path = {
	srcpartialsHtml: `${sourceFolder}/partials`,
	srcScss: `${sourceFolder}/scss/**/*.scss`,
	buildCssFolder: `${buildFolder}/css`,
}

const clear = () => {
	return del([buildFolder])
}

const htmlInclude = () => {
	return src([`${sourceFolder}/*.html`])
	.pipe(fileInclude({
		prefix: '@',
		basepath: '@file'
	}))
	.pipe(dest(buildFolder))
	.pipe(browserSync.stream());
}
const styles = () => {
	return src(path.srcScss)
	.pipe(mainSass())
	.pipe(dest(path.buildCssFolder))
	.pipe(browserSync.stream());
}

const watchFiles = () => {
	browserSync.init({
		server: {
		baseDir: `${buildFolder}`,
		},
		tunnel: 'true',
		watch: true,
	});
	// watch(`${path.sourceFolder}/**`)
	watch(`${path.srcpartialsHtml}/*.html`, htmlInclude);
	watch(`${path.srcpartialsHtml}/**/*.html`, htmlInclude);
	watch(`${sourceFolder}/*.html`, htmlInclude);
	watch(path.srcScss, styles);
}


exports.default = series(clear, htmlInclude, styles, watchFiles);