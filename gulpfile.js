import gulp from "gulp";
import browserSync from "browser-sync";
import watch from "gulp-watch";
import gulpSass from "gulp-sass";
import sass from "sass";
import autoprefixer from "gulp-autoprefixer";
import rename from "gulp-rename";
import concat from "gulp-concat";
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import zip from "gulp-zip";
//import uglify from "gulp-uglify";

let gs = gulpSass(sass);

let styleFiles = ["popup", "result"];

gulp.task("browser-sync-start", function (done) {
	browserSync.init({
		notify: false,
		open: false,
		server: {
			baseDir: "./src",
		},
	});

	gulp.watch(["src/**/*.+(html|htm)"], gulp.parallel(["browser-sync-reload"]));
	done();
});

gulp.task("browser-sync-reload", function () {
	browserSync.reload();
	gulp.watch(["src/**/*.+(html|htm)"], gulp.parallel(["browser-sync-reload"]));
});

gulp.task("styles", function () {
	styleFiles.forEach((styleFile) => {
		gulp.src("src/assets/scss/" + styleFile + ".scss")
			.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
			.pipe(gs())
			.pipe(rename({ dirname: "" }))
			.pipe(concat(styleFile + ".css"))
			// .pipe(
			// 	autoprefixer({
			// 		browsers: ["last 10 versions"],
			// 		cascade: true,
			// 	})
			// )
			.pipe(gulp.dest("src"))
			.pipe(browserSync.reload({ stream: true }));
	});

	gulp.watch("src/assets/scss/*.scss", gulp.parallel(["styles"]));
});

gulp.task("default", gulp.parallel("browser-sync-start", "styles"), function () {
	return true;
});

// BUILD

gulp.task("build", () => {
	const ignoredFiles = [
		".DS_Store",
		".git",
		"dist/**",
		"src/assets/**",
		"node_modules/**",
		".gitignore",
		"gulpfile.js",
		"package-lock.json",
		"package.json",
	];

	return gulp
		.src([".*", "*", "*/**"], { base: "./", ignore: ignoredFiles })
		.pipe(zip("build.zip"))
		.pipe(gulp.dest("./dist"))
		.on("end", () => console.log("👌 Проект собран"));
});
