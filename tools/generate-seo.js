"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const htmlDir = path.join(srcDir, "html");

function loadGlobal(file, name) {
  const code = fs.readFileSync(path.join(srcDir, "js", file), "utf8");
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox, { filename: file });
  if (!sandbox.window[name]) throw new Error(`Missing window.${name} in ${file}`);
  return sandbox.window[name];
}

const I18N = loadGlobal("i18n.js", "BUC_I18N");
const FOODS = loadGlobal("foods.js", "BUC_FOODS");
const TABLE_TEMPLATE = fs.readFileSync(path.join(htmlDir, "_food-table.html"), "utf8");

const TABLE_URLS = {
  uk: "https://breadunits.top/tablytsia-khlibnykh-odynyts/",
  en: "https://breadunits.top/en/bread-unit-table/",
  es: "https://breadunits.top/es/tabla-unidades-de-pan/",
};

const PREVIEW_IDS = [
  "white-bread",
  "rye-bread",
  "borodino-bread",
  "bran-bread",
  "crispbread",
  "buckwheat-dry",
  "rice-dry",
  "rice-cooked",
  "oatmeal-dry",
  "potato-boiled",
  "potato-jacket",
  "mashed-potato",
  "french-fries",
  "apple",
  "pear",
  "banana",
  "orange",
  "milk",
  "kefir",
  "plain-yogurt",
];

const PAGES = {
  uk: {
    htmlLang: "uk",
    ogLocale: "uk_UA",
    root: "",
    homeUrl: "https://breadunits.top/",
    file: path.join(srcDir, "tablytsia-khlibnykh-odynyts", "index.html"),
  },
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    root: "/en",
    homeUrl: "https://breadunits.top/en/",
    file: path.join(srcDir, "en", "bread-unit-table", "index.html"),
  },
  es: {
    htmlLang: "es",
    ogLocale: "es_ES",
    root: "/es",
    homeUrl: "https://breadunits.top/es/",
    file: path.join(srcDir, "es", "tabla-unidades-de-pan", "index.html"),
  },
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(value) {
  return Number(Number(value).toFixed(1)).toString();
}

function giBand(gi) {
  if (gi == null || isNaN(gi)) return null;
  if (gi <= 55) return "low";
  if (gi <= 69) return "mid";
  return "high";
}

function buildRows(lang, t, ids, homeUrl) {
  const carbsUnit = t("calc.carbs.suffix");
  const weightUnit = t("calc.weight.suffix").split("/")[1].trim();

  return ids.map((id) => {
    const food = FOODS.filter((item) => item.id === id)[0];
    if (!food) throw new Error(`Unknown food id in table preview: ${id}`);
    const amount = fmt((100 * 12) / food.carbs);
    const name = esc(food.name[lang]);
    const cat = esc(t("cat." + food.cat));
    const band = giBand(food.gi);
    const bandLabel = band ? esc(t("gi." + band)) : "";
    const giCell = band
      ? `<span class="gi-badge gi-badge--${band}" title="${food.gi} · ${bandLabel}" aria-label="${food.gi} · ${bandLabel}">${food.gi}</span>`
      : `<span class="gi-badge gi-badge--na">${esc(t("table.gi.noData"))}</span>`;
    const pieceLine = food.piece
      ? `<span class="food-table__piece">${esc(
          t("table.piece")
            .replace("{bu}", fmt((food.piece * food.carbs) / 100 / 12))
            .replace("{g}", String(food.piece)),
        )}</span>`
      : "";
    const unit = food.liquid ? weightUnit : carbsUnit;
    const action = homeUrl
      ? `<a class="link-btn" href="${esc(homeUrl)}?food=${encodeURIComponent(food.id)}#calculator">${esc(t("table.use"))}</a>`
      : `<button type="button" class="link-btn" data-use="${esc(food.id)}">${esc(t("table.use"))}</button>`;

    return [
      `        <tr data-food="${esc(food.id)}" data-cat="${esc(food.cat)}" data-gi="${band || "na"}">`,
      `          <td class="food-table__product" data-label="${esc(t("table.col.product"))}" data-cat-label="${cat}">${name}${pieceLine}</td>`,
      `          <td data-label="${esc(t("table.col.amount"))}">${amount} ${esc(unit)}</td>`,
      `          <td data-label="${esc(t("table.col.carbs"))}">${food.carbs} ${esc(carbsUnit)}</td>`,
      `          <td data-label="${esc(t("table.col.gi"))}">${giCell}</td>`,
      `          <td class="food-table__action">${action}</td>`,
      "        </tr>",
    ].join("\n");
  }).join("\n");
}

function renderTable(lang, t, fullPage, homeUrl) {
  const more = fullPage
    ? ""
    : [
        '  <div class="table-more" data-reveal>',
        `    <a class="table-full-link" href="${TABLE_URLS[lang]}" data-i18n-attr="aria-label:table.viewFull">`,
        `      <span data-i18n="table.viewFull">${esc(t("table.viewFull"))}</span>`,
        '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"',
        '        stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13m-5-5 5 5-5 5"/></svg>',
        "    </a>",
        "  </div>",
      ].join("\n");

  const leadKey = fullPage ? "table.lead" : "table.leadPreview";
  const ids = fullPage ? FOODS.map((food) => food.id) : PREVIEW_IDS;

  return TABLE_TEMPLATE
    .split("@@FULL_ATTR@@").join(fullPage ? "data-table-full" : "")
    .split("@@WRAP_REVEAL_ATTR@@").join(fullPage ? "" : " data-reveal")
    .split("@@LEAD_KEY@@").join(leadKey)
    .split("@@LEAD@@").join(esc(t(leadKey)))
    .split("@@ROWS@@").join(buildRows(lang, t, ids, fullPage ? homeUrl : ""))
    .split("@@EMPTY@@").join(esc(t("table.empty")))
    .split("@@MORE@@").join(more);
}

function renderTablePage(lang, t) {
  const config = PAGES[lang];
  const q = (key) => esc(t(key));
  const faq = [1, 2, 3].map((n) => [
    "      <details>",
    `        <summary data-i18n="tablePage.faq${n}q">${q("tablePage.faq" + n + "q")}</summary>`,
    `        <p data-i18n="tablePage.faq${n}a">${q("tablePage.faq" + n + "a")}</p>`,
    "      </details>",
  ].join("\n")).join("\n");

  return [
    '<section class="container table-hero" aria-labelledby="page-title">',
    '  <ul class="breadcrumbs breadcrumbs__print-hide" aria-label="' + q("breadcrumb.home") + '">',
    `    <li><a href="${config.homeUrl}" data-i18n="breadcrumb.home">${q("breadcrumb.home")}</a></li>`,
    '    <li class="breadcrumbs__sep" aria-hidden="true">/</li>',
    `    <li aria-current="page">${q("tablePage.breadcrumb")}</li>`,
    "  </ul>",
    '  <div class="section-head">',
    `    <h1 id="page-title" data-i18n="tablePage.h1">${q("tablePage.h1")}</h1>`,
    `    <p data-i18n="tablePage.lead">${q("tablePage.lead")}</p>`,
    '    <div class="table-hero__actions">',
    `      <button class="btn print-button" id="table-print" type="button" data-i18n="tablePage.print">${q("tablePage.print")}</button>`,
    `      <a class="btn btn--ghost" href="${config.homeUrl}" data-i18n="tablePage.back">${q("tablePage.back")}</a>`,
    "    </div>",
    "  </div>",
    "</section>",
    "",
    renderTable(lang, t, true, config.homeUrl),
    "",
    '<section class="faq-container container" aria-labelledby="table-faq-title">',
    '  <div class="faq-layout">',
    '    <div class="section-head" data-reveal>',
    '      <h2 id="table-faq-title" data-i18n="faq.h2">' + q("faq.h2") + "</h2>",
    "    </div>",
    '    <div class="faq" data-reveal>',
    faq,
    "    </div>",
    "  </div>",
    "</section>",
    "",
  ].join("\n");
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function generateSitemap() {
  const groups = [
    { urls: ["/", "/en/", "/es/"], lastmod: "2026-11-22", changefreq: "monthly", priority: ["1.0", "0.9", "0.9"] },
    { urls: ["/about/", "/en/about/", "/es/about/"], lastmod: "2026-11-22", changefreq: "yearly", priority: ["0.4", "0.4", "0.4"] },
    { urls: ["/contact/", "/en/contact/", "/es/contact/"], lastmod: "2026-11-22", changefreq: "yearly", priority: ["0.3", "0.3", "0.3"] },
    { urls: ["/privacy/", "/en/privacy/", "/es/privacy/"], lastmod: "2026-11-22", changefreq: "yearly", priority: ["0.2", "0.2", "0.2"] },
    { urls: ["/disclaimer/", "/en/disclaimer/", "/es/disclaimer/"], lastmod: "2026-11-22", changefreq: "yearly", priority: ["0.3", "0.3", "0.3"] },
    {
      urls: [
        "/tablytsia-khlibnykh-odynyts/",
        "/en/bread-unit-table/",
        "/es/tabla-unidades-de-pan/",
      ],
      lastmod: "2026-11-23",
      changefreq: "monthly",
      priority: ["0.8", "0.8", "0.8"],
    },
  ];

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  groups.forEach((group) => {
    const alternates = group.urls.map((url) => "https://breadunits.top" + url);
    group.urls.forEach((url, index) => {
      lines.push("<url>", `  <loc>https://breadunits.top${url}</loc>`, `  <lastmod>${group.lastmod}</lastmod>`, `  <changefreq>${group.changefreq}</changefreq>`, `  <priority>${group.priority[index]}</priority>`);
      alternates.forEach((alternate, altIndex) => {
        const hreflang = ["uk", "en", "es"][altIndex];
        lines.push(`  <xhtml:link rel="alternate" hreflang="${hreflang}" href="${alternate}"/>`);
      });
      lines.push(`  <xhtml:link rel="alternate" hreflang="x-default" href="${alternates[0]}"/>`, "</url>");
    });
  });

  lines.push("</urlset>", "");
  write(path.join(srcDir, "sitemap.xml"), lines.join("\n"));
}

function main() {
  if (FOODS.length !== 167) {
    throw new Error(`Expected 167 foods, got ${FOODS.length}`);
  }

  Object.keys(PAGES).forEach((lang) => {
    const config = PAGES[lang];
    const t = (key) => I18N[lang][key];
    const includePath = path.relative(path.dirname(config.file), path.join(htmlDir, "_seo-document.html")).split(path.sep).join("/");

    write(path.join(htmlDir, `_food-table-${lang}.html`), renderTable(lang, t, false) + "\n");
    write(path.join(htmlDir, `_table-page-${lang}.html`), renderTablePage(lang, t));

    const params = [
      `"htmlLang":"${config.htmlLang}"`,
      `"ogLocale":"${config.ogLocale}"`,
      `"root":"${config.root}"`,
      `"canonical":"${TABLE_URLS[lang]}"`,
      `"metaTitle":${JSON.stringify(t("tablePage.title"))}`,
      `"metaDescription":${JSON.stringify(t("tablePage.description"))}`,
      `"appName":${JSON.stringify(t("hero.h1"))}`,
      `"altUk":"${TABLE_URLS.uk}"`,
      `"altEn":"${TABLE_URLS.en}"`,
      `"altEs":"${TABLE_URLS.es}"`,
      `"homeLabel":${JSON.stringify(t("breadcrumb.home"))}`,
      `"homeUrl":"${config.homeUrl}"`,
      `"breadcrumbLabel":${JSON.stringify(t("tablePage.breadcrumb"))}`,
      `"skipTarget":"#page-title"`,
    ].join(",");

    write(config.file, `@@include('${includePath}',{${params}})\n`);
  });

  generateSitemap();
  process.stdout.write(`[seo] generated 3 table pages, 3 table partials and sitemap.xml (${FOODS.length} foods)\n`);
}

main();
