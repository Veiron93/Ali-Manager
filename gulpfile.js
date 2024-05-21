import gulp from "gulp";
import browserSync from "browser-sync";
import watch from "gulp-watch";
import gulpSass from "gulp-sass";
import sass from "sass";
import autoprefixer from "gulp-autoprefixer";
//import rename from "gulp-rename";
import concat from "gulp-concat";
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import zip from "gulp-zip";
import uglify from "gulp-uglify";

import replace from "gulp-replace";
import { deleteAsync } from "del";
import ftp from "vinyl-ftp";
import gutil from "gulp-util";

import ftpConfig from "./ftp.js";

let gs = gulpSass(sass);

import { Client } from "basic-ftp";

// gulp.task("test", function (done) {
// 	console.log(ftpConfig());
// });

const PUBLIC_PATH = "./public";
const TEMP_PATH = "./temp";

// JS
const JS_FILES_POPUP = [
	"./src/popup/HelpersPopup.js",
	"./src/popup/LoaderPopup.js",
	"./src/popup/AuthLoginPopup.js",
	"./src/popup/ConfirmationPopup.js",
	"./src/popup/SearchOrdersPopup.js",
	"./src/popup/Popup.js",
];

const JS_FILES = ["./src/background.js", "./src/dates.js", "./src/orders.js", "./src/order-ru.js", "./src/tracking-number.js"];

// Styles
const STYLE_FILES_POPUP = "./src/popup/*.scss";

////////////////////////////
/////// DEV TASKS /////////
//////////////////////////

// server
gulp.task("browser-sync-start", function (done) {
	browserSync.init({
		notify: false,
		open: false,
		server: {
			baseDir: "./src",
		},
	});

	done();
});

// scripts
gulp.task("scripts-dev", () => {
	gulp.src(JS_FILES_POPUP).pipe(concat("popup.js")).pipe(gulp.dest(TEMP_PATH));
	gulp.src(JS_FILES).pipe(gulp.dest(TEMP_PATH));

	gulp.watch(JS_FILES_POPUP, gulp.parallel(["scripts-dev"]));
	gulp.watch(JS_FILES, gulp.parallel(["scripts-dev"]));
});

// styles
gulp.task("styles-dev", (done) => {
	gulp.src(STYLE_FILES_POPUP)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(gs())
		.pipe(concat("popup.css"))
		.pipe(gulp.dest(TEMP_PATH))
		.pipe(browserSync.reload({ stream: true }));

	gulp.watch("./src/popup/*.scss", gulp.parallel(["styles-dev"]));

	done();
});

gulp.task("default", gulp.parallel("browser-sync-start", "scripts-dev", "styles-dev"), () => {
	return true;
});

////////////////////////////
////// BUILD TASKS ////////
//////////////////////////

// replace
gulp.task("replace", (done) => {
	gulp.src("./src/popup.html")
		.pipe(replace("/temp/popup.css", "/public/popup.min.css"))
		.pipe(replace("/temp/popup.js", "/public/popup.min.js"))
		.pipe(gulp.dest(PUBLIC_PATH));

	gulp.src("./manifest.json").pipe(replace("src/background.js", "/background.js")).pipe(gulp.dest(PUBLIC_PATH));

	done();
});

// scripts
gulp.task("scripts-build", (done) => {
	gulp.src(JS_FILES_POPUP)
		.pipe(concat("popup.min.js"))
		.pipe(replace("this.DEV_API_HOST", "this.PUBLIC_API_HOST"))
		.pipe(uglify())
		.pipe(gulp.dest(PUBLIC_PATH));

	gulp.src(JS_FILES).pipe(replace('api.get("DEV_API_HOST")', 'api.get("PUBLIC_API_HOST")')).pipe(uglify()).pipe(gulp.dest(PUBLIC_PATH));

	done();
});

// styles
gulp.task("styles-build", (done) => {
	gulp.src(STYLE_FILES_POPUP)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(gs())
		.pipe(concat("popup.min.css"))
		.pipe(autoprefixer())
		.pipe(gulp.dest(PUBLIC_PATH));

	done();
});

// FTP
gulp.task("upload", async (done) => {
	const client = new Client();
	await client.access(ftpConfig());

	try {
		await client.ensureDir("/www/alimanager.ru");
		await client.uploadFrom(PUBLIC_PATH + "/build.zip", "build.zip");
	} catch (error) {
		console.log(error);
	}

	client.close();

	done();
});

gulp.task(
	"build",
	gulp.parallel("replace", "scripts-build", "styles-build", (done) => {
		gulp.src(PUBLIC_PATH + "/**/**/*")
			.pipe(zip("build.zip"))
			.pipe(gulp.dest(PUBLIC_PATH));

		done();
	})
);
