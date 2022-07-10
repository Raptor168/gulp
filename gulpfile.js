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
const webp = require('gulp-webp');
const avif = require('gulp-avif');

const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const webpackStream = require('webpack-stream');


// Path
const sourceFolder = './src';
const buildFolder = './app';
const path = {
	srcpartialsHtml: `${sourceFolder}/partials`,
	srcScss: `${sourceFolder}/scss/**/*.scss`,
	buildCssFolder: `${buildFolder}/css`,
	resFolder: `${sourceFolder}/resources`,
	srcAllJs: `${sourceFolder}/js/**/*.js`,
	srcMainJs: `${sourceFolder}/js/main.js`,
	buildJsFolder: `${buildFolder}/js`,
	srcImgFolder: `${sourceFolder}/img`,
	buildImgFolder: `${buildFolder}/img`,
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

const resources = () => {
	return src(`${path.resFolder}/**`)
	.pipe(dest(buildFolder))
}

const scripts = () => {
	return src(path.srcMainJs)
	.pipe(plumber(
		notify.onError({
			title: "JS",
			message: "Error: <%= error.message %>"
		})
	))
	.pipe(webpackStream({
		// mode: isProd ? 'production' : 'development',
		mode: 'development',
		output: {
			filename: 'main.js',
		},
		module: {
			rules: [{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				options: {
					presets: [
						['@babel/preset-env', {
							targets: "defaults"
							}]
						]
					}
				}
			}]
		},
		// devtool: !isProd ? 'source-map' : false
	}))
	.on('error', function (err) {
		console.error('WEBPACK ERROR', err);
		this.emit('end');
	})
	.pipe(dest(path.buildJsFolder))
	.pipe(browserSync.stream());
}

const webpImages = () => {
	return src([`${path.srcImgFolder}/**/**.{jpg,jpeg,png}`])
	  .pipe(webp())
	  .pipe(dest(path.buildImgFolder))
  };
  
  const avifImages = () => {
	return src([`${path.srcImgFolder}/**/**.{jpg,jpeg,png}`])
	  .pipe(avif())
	  .pipe(dest(path.buildImgFolder))
  };

const watchFiles = () => {
	browserSync.init({
		server: {
		baseDir: `${buildFolder}`,
		},
		// tunnel: 'true',
		watch: true,
	});
	watch(`${path.srcpartialsHtml}/*.html`, htmlInclude);
	watch(`${path.srcpartialsHtml}/**/*.html`, htmlInclude);
	watch(`${sourceFolder}/*.html`, htmlInclude);
	watch(`${path.srcScss}`, styles);
	watch(`${path.srcAllJs}`, scripts);
	watch(`${path.resFolder}/**`, resources);
}


exports.default = series(clear, htmlInclude, styles, resources, scripts, webpImages, avifImages, watchFiles);