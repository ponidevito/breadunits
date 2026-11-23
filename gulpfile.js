"use strict";

// ─── wPath ────────────────────────────────────────────────────────────────────
const projectFolder = "build";
const sourceFolder = "src";

const path = {
  build: {
    html: `${projectFolder}/`,
    css: `${projectFolder}/css/`,
    js: `${projectFolder}/js/`,
    img: `${projectFolder}/img/`,
    fonts: `${projectFolder}/fonts/`,
  },
  src: {
    // Top-level and nested pages: about.html -> about/index.html (uk),
    // en/about.html -> en/about/index.html, es/about.html -> es/about/index.html.
    html: [
      `${sourceFolder}/**/*.html`,
      `!${sourceFolder}/html/**/*.html`,       // include partials
      `!${sourceFolder}/components/**/*.html`, // unused template components
      `!${sourceFolder}/**/_*.html`,           // underscore-prefixed partials
      `!${sourceFolder}/**/google*.html`,      // GSC verification is copied verbatim by `misc`
    ],
    css: `${sourceFolder}/scss/style.scss`,
    js: `${sourceFolder}/js/scripts.js`,
    img: `${sourceFolder}/img/**/*.{png,jpg,jpeg,ico,svg,webp,gif}`,
    fonts: `${sourceFolder}/fonts/**/*.{woff,woff2,ttf,eot,svg}`,
    // static files copied to the site root: favicon, robots.txt, sitemap.xml, manifest,
    // Google Search Console verification file (google*.html, served verbatim at root)
    misc: [`${sourceFolder}/*.{txt,xml,webmanifest,png,ico}`, `${sourceFolder}/google*.html`],
  },
  watch: {
    html: `${sourceFolder}/**/*.html`,
    css: `${sourceFolder}/scss/**/*.scss`,
    js: `${sourceFolder}/js/**/*.js`,
    img: `${sourceFolder}/img/**/*.{png,jpg,jpeg,ico,svg,webp,gif}`,
    fonts: `${sourceFolder}/fonts/**/*.{woff,woff2,ttf,eot,svg}`,
    misc: [`${sourceFolder}/*.{txt,xml,webmanifest,png,ico}`, `${sourceFolder}/google*.html`],
  },
  clean: `./${projectFolder}/`,
};

// ─── Plugins ──────────────────────────────────────────────────────────────────
const { src, dest, watch, series, parallel } = require("gulp");
const browsersync = require("browser-sync").create();
const fileinclude = require("gulp-file-include");
const del = require("del");
const sass = require("gulp-sass")(require("sass"));
const autoprefixer = require("gulp-autoprefixer");
const cleanCss = require("gulp-clean-css");
const rename = require("gulp-rename");
const terser = require("gulp-terser");
const imagemin = require("gulp-imagemin");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const { Transform } = require("stream");
const { execFileSync } = require("child_process");
const fs = require("fs");
const nodePath = require("path");
const { createLocalizeStream } = require("./tools/localize-html");

// ─── helper ─────────────────────────────────────────────────
const onError = (taskName) =>
  plumber({
    errorHandler: notify.onError({
      title: `Gulp: помилка в ${taskName}`,
      message: "<%= error.message %>",
      sound: false,
    }),
  });

// ─── Browser Sync ─────────────────────────────────────────────────────────────
function browserSync() {
  browsersync.init({
    server: { baseDir: `./${projectFolder}/` },
    port: 3000,
    notify: false,
    open: true,
  });
}

function generateSeo() {
  execFileSync(process.execPath, [nodePath.join(__dirname, "tools", "generate-seo.js")], { stdio: "inherit" });
  return Promise.resolve();
}

// ─── HTML ─────────────────────────────────────────────────────────────────────
// index.html -> build/index.html (Ukrainian, default)
// en.html    -> build/en/index.html   (clean URL /en/)
// es.html    -> build/es/index.html   (clean URL /es/)
function inlineCriticalCss() {
  let critical = "";
  try { critical = fs.readFileSync(nodePath.join(__dirname, projectFolder, "css", "style.min.css"), "utf8"); } catch (e) { return new Transform({ objectMode: true, transform(f, _, cb) { cb(null, f); } }); }
  return new Transform({
    objectMode: true,
    transform(file, _, cb) {
      if (file.isBuffer() && /\.html$/.test(file.path)) {
        let htmlStr = file.contents.toString("utf8");
        if (htmlStr.includes("/* __CRITICAL_CSS__ */")) {
          htmlStr = htmlStr.replace("/* __CRITICAL_CSS__ */", () => critical);
          file.contents = Buffer.from(htmlStr, "utf8");
        }
      }
      cb(null, file);
    },
  });
}

function html() {
  return src(path.src.html)
    .pipe(onError("html"))
    .pipe(fileinclude({ prefix: "@@", basepath: "@file" }))
    .pipe(createLocalizeStream())
    .pipe(
      rename((file) => {
        if (file.basename !== "index" && file.extname === ".html") {
          file.dirname = file.dirname === "." ? file.basename : `${file.dirname}/${file.basename}`;
          file.basename = "index";
        }
      }),
    )
    .pipe(inlineCriticalCss())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

// ─── CSS$7 ──────────────────────────────────────────────────────────────────────
function css() {
  return src(path.src.css)
    .pipe(onError("css"))
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(
      autoprefixer({
        cascade: false,
        overrideBrowserslist: ["last 3 versions", "> 1%", "not dead"],
      }),
    )
    .pipe(dest(path.build.css))
    .pipe(cleanCss({ level: 2 }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

// ─── JavaScript ───────────────────────────────────────────────────────────────
function js() {
  return src(path.src.js)
    .pipe(onError("js"))
    .pipe(sourcemaps.init())
    .pipe(fileinclude({ prefix: "@@", basepath: "@file" }))
    .pipe(dest(path.build.js))
    .pipe(
      terser({
        compress: { drop_console: false },
        format: { comments: false },
      }),
    )
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(dest(path.build.js)) // мінімізований + sourcemap
    .pipe(browsersync.stream());
}

// ─── Images  ────────────────────────────────────────
function images() {
  return src(path.src.img, { encoding: false })
    .pipe(onError("images"))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

// ─── Images ────────────────────────────────────────────────
function imgOptimize() {
  return src(path.src.img, { encoding: false })
    .pipe(onError("imgOptimize"))
    .pipe(
      imagemin(
        [
          imagemin.gifsicle({ interlaced: true }),
          imagemin.mozjpeg({ quality: 80, progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
          imagemin.svgo({
            plugins: [
              { name: "removeViewBox", active: false },
              { name: "cleanupIDs", active: false },
            ],
          }),
        ],
        { verbose: true },
      ),
    )
    .pipe(dest(path.build.img));
}

// ─── Fonts ────────────────────────────────────────────────────────────────────
function fonts() {
  return src(path.src.fonts, { encoding: false })
    .pipe(dest(path.build.fonts))
    .pipe(browsersync.stream());
}

// ─── Misc (favicon, robots.txt, sitemap.xml, manifest, og-image) ───────────────
function misc() {
  return src(path.src.misc, { encoding: false, allowEmpty: true })
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

// ─── Clean ───────────────────────────────────────────────────────────────────
function clean() {
  return del(path.clean);
}

// ─── Watch ───────────────────────────────────────────────────────────────────
function watchFiles() {
  watch(path.watch.html, html);
  watch(path.watch.css, css);
  watch(path.watch.js, js);
  watch(path.watch.img, images);
  watch(path.watch.fonts, fonts);
  watch(path.watch.misc, misc);
  watch([
    `${sourceFolder}/js/foods.js`,
    `${sourceFolder}/js/i18n.js`,
    `${sourceFolder}/html/_food-table.html`,
    "tools/generate-seo.js",
  ], series(generateSeo, html));
}

// ─── Експорт задач ───────────────────────────────────────────────────────────

function fixBrand() {
  const buildDir = nodePath.join(__dirname, projectFolder);
  function walk(dir) {
    let results = [];
    for (const f of fs.readdirSync(dir)) {
      const p = nodePath.join(dir, f);
      const s = fs.statSync(p);
      if (s.isDirectory()) results.push(...walk(p));
      else if (p.endsWith(".html")) results.push(p);
    }
    return results;
  }
  for (const f of walk(buildDir)) {
    let h = fs.readFileSync(f, "utf8");
    if (h.includes("Diabetes Calculator")) {
      h = h.split("Diabetes Calculator").join("BreadUnits");
      fs.writeFileSync(f, h, "utf8");
    }
  }
  return Promise.resolve();
}

const build = series(clean, generateSeo, css, parallel(html, js, images, fonts, misc), fixBrand);
const buildProd = series(clean, generateSeo, css, parallel(html, js, imgOptimize, fonts, misc), fixBrand);
const dev = parallel(build, watchFiles, browserSync);

exports.generateSeo = generateSeo;
exports.html = series(generateSeo, html);
exports.css = css;
exports.js = js;
exports.images = images;
exports.imgOptimize = imgOptimize;
exports.fonts = fonts;
exports.misc = misc;
exports.clean = clean;
exports.build = build;
exports.fixBrand = fixBrand;
exports.prod = buildProd;
exports.watch = dev;
exports.default = dev;
