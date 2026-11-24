"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { localizeHtml } = require("./localize-html");
const PRODUCTS = require("./product-config");
const PRODUCT_COPY = Object.assign(
  {},
  require("./product-copy-1"),
  require("./product-copy-2"),
  require("./product-copy-3"),
);

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

const PRODUCT_PATHS = { uk: "produkty", en: "foods", es: "alimentos" };
const PRODUCT_LAST_MOD = "2026-11-24";
const PRODUCT_BY_ID = PRODUCTS.reduce((map, product) => {
  map[product.id] = product;
  return map;
}, {});
const FOOD_BY_ID = FOODS.reduce((map, food) => {
  map[food.id] = food;
  return map;
}, {});

function productUrl(lang, id) {
  const product = PRODUCT_BY_ID[id];
  if (!product) throw new Error(`Unknown product page id: ${id}`);
  const prefix = lang === "uk" ? "" : `${lang}/`;
  return `https://breadunits.top/${prefix}${PRODUCT_PATHS[lang]}/${product.slug[lang]}/`;
}

const PRODUCT_UI = {
  uk: {
    home: "Головна",
    table: "Таблиця ХО",
    breadcrumbLabel: "Навігаційний ланцюжок",
    fileLabel: "Довідка про продукт",
    answerEyebrow: "Коротка відповідь",
    answerTitle: "Скільки ХО містить цей продукт",
    lead: "Довідкові цифри з бази BreadUnits: вуглеводи, хлібні одиниці та глікемічний індекс.",
    stat100: (liquid) => (liquid ? "ХО у 100 мл" : "ХО у 100 г"),
    statAmount: (liquid) => (liquid ? "мл напою на 1 ХО" : "г продукту на 1 ХО"),
    statPiece: "ХО в 1 шт.",
    pieceNote: (piece) => `1 шт ≈ ${piece} г`,
    dataTitle: "Дані продукту",
    colMetric: "Показник",
    colCarbs: (liquid) => (liquid ? "Вуглеводи / 100 мл" : "Вуглеводи / 100 г"),
    colAmount: "Кількість на 1 ХО",
    colGi: "Глікемічний індекс",
    colValue: "Значення",
    giNoData: "немає даних",
    giLow: "низький",
    giMid: "середній",
    giHigh: "високий",
    unit: "ХО",
    carbs: (food) => (food.liquid ? `${food.carbs} г / 100 мл` : `${food.carbs} г`),
    note: "Цифри довідкові й наближені: вони залежать від сорту, стиглості та способу приготування. 1 ХО = 12 г вуглеводів; якщо лікар рекомендує 10 г, виберіть цю норму у великому калькуляторі.",
    calcTitle: "Перевірте свою порцію",
    calcIntro: "Вкажіть вагу або об'єм порції — розрахунок оновиться для вибраної норми.",
    weightLabel: (liquid) => (liquid ? "Об'єм порції, мл" : "Вага порції, г"),
    normLabel: "1 ХО дорівнює",
    resultLabel: "Отримано",
    calcButton: "Відкрити у великому калькуляторі",
    articleTitle: (name) => `Як ${name} впливає на цукор: порції та поєднання`,
    faqTitle: "Питання про продукт",
    relatedTitle: "Схожі продукти",
    relatedMore: "Уся таблиця ХО",
    disclaimer: "Дані на сторінці довідкові й не замінюють консультацію лікаря.",
    disclaimerLink: "Медичне застереження",
    title: (name) => `${name}: скільки хлібних одиниць (ХО), вуглеводи, ГІ | BreadUnits`,
    description: (lang, food, unit, bu100, amount, giText) =>
      `${food.name.uk}: ${fmt(bu100, lang)} ХО на 100 ${unit}, ${fmt(amount, lang)} ${unit} на 1 ХО (12 г вуглеводів), ${food.carbs} г вуглеводів на 100 ${unit}. ГІ: ${giText}.`,
    h1: (loc, prep) => `Скільки хлібних одиниць ${prep} ${loc}`,
    faq: (lang, food, gen, loc, prep, unit, bu100, bu10, amount, giText, giBandLabel) => [
      {
        q: `Скільки ХО в 100 ${unit} ${gen}?`,
        a: `У 100 ${unit} ${gen} — ${food.carbs} г вуглеводів. Це ${fmt(bu100, lang)} ХО за норми 12 г або ${fmt(bu10, lang)} ХО за норми 10 г.`,
      },
      {
        q: `Скільки ${unit} ${gen} відповідає 1 ХО?`,
        a: `За норми 12 г вуглеводів 1 ХО відповідає ${fmt(amount, lang)} ${unit} ${gen}. За норми 10 г — ${fmt((10 * 100) / food.carbs, lang)} ${unit}.`,
      },
      {
        q: `Який глікемічний індекс ${prep} ${loc}?`,
        a: giBandLabel
          ? `ГІ цього продукту — ${food.gi} (${giBandLabel}). Показник є орієнтовним і не є індивідуальною рекомендацією.`
          : `Для цього продукту достовірне значення ГІ в базі відсутнє — у таблиці вказано «немає даних».`,
      },
    ],
  },
  en: {
    home: "Home",
    table: "BU table",
    breadcrumbLabel: "Breadcrumb",
    fileLabel: "Food reference",
    answerEyebrow: "Quick answer",
    answerTitle: "Bread units in this food",
    lead: "Reference figures from the BreadUnits food database: carbs, bread units and glycemic index.",
    stat100: (liquid) => (liquid ? "BU per 100 ml" : "BU per 100 g"),
    statAmount: (liquid) => (liquid ? "ml of drink per 1 BU" : "g of food per 1 BU"),
    statPiece: "BU per piece",
    pieceNote: (piece) => `1 piece ≈ ${piece} g`,
    dataTitle: "Food data",
    colMetric: "Metric",
    colCarbs: (liquid) => (liquid ? "Carbs / 100 ml" : "Carbs / 100 g"),
    colAmount: "Amount per 1 BU",
    colGi: "Glycemic index",
    colValue: "Value",
    giNoData: "no data",
    giLow: "low",
    giMid: "medium",
    giHigh: "high",
    unit: "BU",
    carbs: (food) => (food.liquid ? `${food.carbs} g / 100 ml` : `${food.carbs} g`),
    note: "The figures are approximate reference values and vary with variety, ripeness and preparation. 1 BU equals 12 g of carbs; if your doctor uses 10 g, select that norm in the full calculator.",
    calcTitle: "Check your portion",
    calcIntro: "Enter the portion weight or volume and the result updates for the selected norm.",
    weightLabel: (liquid) => (liquid ? "Portion volume, ml" : "Portion weight, g"),
    normLabel: "1 BU equals",
    resultLabel: "Result",
    calcButton: "Open in the full calculator",
    articleTitle: (subject, plural) => `How ${subject} ${plural ? "affect" : "affects"} blood sugar: portions and pairings`,
    faqTitle: "Questions about this food",
    relatedTitle: "Related foods",
    relatedMore: "Full BU table",
    disclaimer: "The figures on this page are for reference only and do not replace medical advice.",
    disclaimerLink: "Medical disclaimer",
    title: (name) => `${name}: Bread Units (BU), Carbs & GI | BreadUnits`,
    description: (lang, food, unit, bu100, amount, giText) =>
      `${food.name.en}: ${fmt(bu100, lang)} BU per 100 ${unit}, ${fmt(amount, lang)} ${unit} per 1 BU (12 g carbs), ${food.carbs} g carbs per 100 ${unit}. GI: ${giText}.`,
    h1: (subject) => `How many bread units in ${subject}`,
    faq: (lang, food, phrase, plural, unit, bu100, bu10, amount, giText, giBandLabel) => [
      {
        q: `How many BU are in 100 ${unit} of ${phrase}?`,
        a: `100 ${unit} of ${phrase} contains ${food.carbs} g of carbs. That is ${fmt(bu100, lang)} BU at the 12 g norm or ${fmt(bu10, lang)} BU at the 10 g norm.`,
      },
      {
        q: plural ? `How many ${phrase} make 1 BU?` : `How much ${phrase} makes 1 BU?`,
        a: `At the 12 g carb norm, 1 BU corresponds to ${fmt(amount, lang)} ${unit} of ${phrase}. At 10 g it is ${fmt((10 * 100) / food.carbs, lang)} ${unit}.`,
      },
      {
        q: `What is the glycemic index of ${phrase}?`,
        a: giBandLabel
          ? `The GI listed for this food is ${food.gi} (${giBandLabel}). It is an approximate reference value, not an individual recommendation.`
          : `A reliable GI value is not available for this food in our database — the table shows “no data”.`,
      },
    ],
  },
  es: {
    home: "Inicio",
    table: "Tabla de UP",
    breadcrumbLabel: "Ruta de navegación",
    fileLabel: "Ficha del alimento",
    answerEyebrow: "Respuesta rápida",
    answerTitle: "Unidades de pan en este alimento",
    lead: "Cifras de referencia de la base de alimentos BreadUnits: hidratos, unidades de pan e índice glucémico.",
    stat100: (liquid) => (liquid ? "UP por 100 ml" : "UP por 100 g"),
    statAmount: (liquid) => (liquid ? "ml de bebida por 1 UP" : "g de alimento por 1 UP"),
    statPiece: "UP por pieza",
    pieceNote: (piece) => `1 pieza ≈ ${piece} g`,
    dataTitle: "Datos del alimento",
    colMetric: "Dato",
    colCarbs: (liquid) => (liquid ? "Hidratos / 100 ml" : "Hidratos / 100 g"),
    colAmount: "Cantidad por 1 UP",
    colGi: "Índice glucémico",
    colValue: "Valor",
    giNoData: "sin datos",
    giLow: "bajo",
    giMid: "medio",
    giHigh: "alto",
    unit: "UP",
    carbs: (food) => (food.liquid ? `${food.carbs} g / 100 ml` : `${food.carbs} g`),
    note: "Las cifras son orientativas y dependen de la variedad, la maduración y la preparación. 1 UP equivale a 12 g de hidratos; si tu médico usa 10 g, elige esa norma en la calculadora completa.",
    calcTitle: "Comprueba tu ración",
    calcIntro: "Indica el peso o el volumen de la ración: el resultado se actualiza según la norma elegida.",
    weightLabel: (liquid) => (liquid ? "Volumen de la ración, ml" : "Peso de la ración, g"),
    normLabel: "1 UP equivale a",
    resultLabel: "Resultado",
    calcButton: "Abrir en la calculadora completa",
    articleTitle: (subject, plural) => `Cómo ${plural ? "influyen" : "influye"} ${subject} en el azúcar: raciones y combinaciones`,
    faqTitle: "Preguntas sobre este alimento",
    relatedTitle: "Alimentos similares",
    relatedMore: "Tabla completa de UP",
    disclaimer: "Los datos de esta página son orientativos y no sustituyen la consulta médica.",
    disclaimerLink: "Aviso médico",
    title: (name) => `${name}: unidades de pan (UP), carbohidratos e IG | BreadUnits`,
    description: (lang, food, unit, bu100, amount, giText) =>
      `${food.name.es}: ${fmt(bu100, lang)} UP por 100 ${unit}, ${fmt(amount, lang)} ${unit} por 1 UP (12 g de hidratos), ${food.carbs} g de hidratos por 100 ${unit}. IG: ${giText}.`,
    h1: (subject, plural) => `Cuántas unidades de pan ${plural ? "tienen" : "tiene"} ${subject}`,
    faq: (lang, food, phrase, plural, unit, bu100, bu10, amount, giText, giBandLabel) => [
      {
        q: `¿Cuántas UP hay en 100 ${unit} de ${phrase}?`,
        a: `100 ${unit} de ${phrase} aportan ${food.carbs} g de hidratos. Son ${fmt(bu100, lang)} UP con la norma de 12 g o ${fmt(bu10, lang)} UP con la de 10 g.`,
      },
      {
        q: plural ? `¿Cuántas ${phrase} equivalen a 1 UP?` : `¿Cuánto ${phrase} equivale a 1 UP?`,
        a: `Con la norma de 12 g de hidratos, 1 UP corresponde a ${fmt(amount, lang)} ${unit} de ${phrase}. Con 10 g, a ${fmt((10 * 100) / food.carbs, lang)} ${unit}.`,
      },
      {
        q: `¿Cuál es el índice glucémico de ${phrase}?`,
        a: giBandLabel
          ? `El IG indicado para este alimento es ${food.gi} (${giBandLabel}). Es una cifra orientativa, no una recomendación individual.`
          : `No hay un valor fiable de IG para este alimento en nuestra base de datos: la tabla indica «sin datos».`,
      },
    ],
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

function fmt(value, lang) {
  const numeric = Number(String(value).replace(",", "."));
  return numeric.toFixed(1).replace(".", lang === "en" ? "." : ",");
}

function giBand(gi) {
  if (gi == null || isNaN(gi)) return null;
  if (gi <= 55) return "low";
  if (gi <= 69) return "mid";
  return "high";
}

function buildRows(lang, t, ids, homeUrl) {
  const carbsUnit = t("calc.carbs.suffix");
  const liquidCarbsUnit = t("calc.carbs.liquid.suffix");
  const weightUnit = t("calc.weight.suffix").split("/")[1].trim();

  return ids.map((id) => {
    const food = FOODS.filter((item) => item.id === id)[0];
    if (!food) throw new Error(`Unknown food id in table preview: ${id}`);
    const amount = fmt((100 * 12) / food.carbs, lang);
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
            .replace("{bu}", fmt((food.piece * food.carbs) / 100 / 12, lang))
            .replace("{g}", String(food.piece)),
        )}</span>`
      : "";
    const unit = food.liquid ? weightUnit : carbsUnit;
    const carbsLabel = food.liquid ? t("table.col.carbs.liquid") : t("table.col.carbs");
    const carbsValue = food.liquid ? `${food.carbs} ${liquidCarbsUnit}` : `${food.carbs} ${carbsUnit}`;
    const action = homeUrl
      ? `<a class="link-btn" href="${esc(homeUrl)}?food=${encodeURIComponent(food.id)}#calculator">${esc(t("table.use"))}</a>`
      : `<button type="button" class="link-btn" data-use="${esc(food.id)}">${esc(t("table.use"))}</button>`;
    const nameHtml = PRODUCT_BY_ID[food.id]
      ? `<a class="food-table__link" href="${esc(productUrl(lang, food.id))}">${name}</a>`
      : name;

    return [
      `        <tr id="food-${esc(food.id)}" data-food="${esc(food.id)}" data-cat="${esc(food.cat)}" data-gi="${band || "na"}">`,
      `          <td class="food-table__product" data-label="${esc(t("table.col.product"))}" data-cat-label="${cat}">${nameHtml}${pieceLine}</td>`,
      `          <td data-label="${esc(t("table.col.amount"))}">${amount} ${esc(unit)}</td>`,
      `          <td data-label="${esc(carbsLabel)}">${esc(carbsValue)}</td>`,
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
    .split("@@ACTION@@").join(esc(t("table.col.action")))
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
    '<section class="container table-disclaimer">',
    `  <p><span data-i18n="tablePage.disclaimer">${q("tablePage.disclaimer")}</span> <a href="${config.root}/disclaimer/" data-i18n="tablePage.disclaimerLink">${q("tablePage.disclaimerLink")}</a></p>`,
    "</section>",
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

function lowerFirst(value) {
  return String(value).charAt(0).toLowerCase() + String(value).slice(1);
}

function ukPrep(loc) {
  return /^[аеєиіїоуюяАЕЄИІЇОУЮЯ]/.test(loc) ? "в" : "у";
}

function unitFor(lang, liquid) {
  if (!liquid) return lang === "uk" ? "г" : "g";
  return lang === "uk" ? "мл" : "ml";
}

function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

function relatedProducts(food) {
  const same = PRODUCTS.filter((p) =>
    p.id !== food.id && FOOD_BY_ID[p.id] && FOOD_BY_ID[p.id].cat === food.cat,
  );
  const rest = PRODUCTS.filter((p) =>
    p.id !== food.id && FOOD_BY_ID[p.id] && FOOD_BY_ID[p.id].cat !== food.cat,
  );
  return same.concat(rest).slice(0, 5);
}

function productFacts(lang, food, copy) {
  const ui = PRODUCT_UI[lang];
  const forms = food.forms;
  const required = [
    ["uk.loc", forms && forms.uk && forms.uk.loc],
    ["uk.gen", forms && forms.uk && forms.uk.gen],
    ["en.phrase", forms && forms.en && forms.en.phrase],
    ["en.subject", forms && forms.en && forms.en.subject],
    ["es.phrase", forms && forms.es && forms.es.phrase],
    ["es.subject", forms && forms.es && forms.es.subject],
  ];
  required.forEach(([key, value]) => {
    if (typeof value !== "string" || !value.trim()) throw new Error(`Missing explicit ${key} form for ${food.id}`);
  });
  if (!forms.en || typeof forms.en.plural !== "boolean") throw new Error(`Missing explicit en.plural form for ${food.id}`);
  if (!forms.es || typeof forms.es.plural !== "boolean") throw new Error(`Missing explicit es.plural form for ${food.id}`);

  const name = food.name[lang];
  const liquid = Boolean(food.liquid);
  const band = giBand(food.gi);
  const bandKey = band ? { low: "giLow", mid: "giMid", high: "giHigh" }[band] : null;
  const bandLabel = bandKey ? ui[bandKey] : "";
  const unit = unitFor(lang, liquid);
  const bu100 = fmt(food.carbs / 12, lang);
  const bu10 = fmt(food.carbs / 10, lang);
  const amount = fmt((100 * 12) / food.carbs, lang);
  const amount10 = fmt((100 * 10) / food.carbs, lang);
  const giText = band ? `${food.gi} (${bandLabel})` : ui.giNoData;

  let h1;
  let articleTitle;
  let faq;
  if (lang === "uk") {
    const prep = ukPrep(forms.uk.loc);
    h1 = ui.h1(forms.uk.loc, prep);
    articleTitle = ui.articleTitle(lowerFirst(name));
    faq = ui.faq(lang, food, forms.uk.gen, forms.uk.loc, prep, unit, bu100, bu10, amount, giText, bandLabel);
  } else if (lang === "en") {
    h1 = ui.h1(forms.en.subject);
    articleTitle = ui.articleTitle(forms.en.subject, forms.en.plural);
    faq = ui.faq(lang, food, forms.en.phrase, forms.en.plural, unit, bu100, bu10, amount, giText, bandLabel);
  } else {
    h1 = ui.h1(forms.es.subject, forms.es.plural);
    articleTitle = ui.articleTitle(forms.es.subject, forms.es.plural);
    faq = ui.faq(lang, food, forms.es.phrase, forms.es.plural, unit, bu100, bu10, amount, giText, bandLabel);
  }

  return {
    ui,
    name,
    lowerName: lowerFirst(name),
    liquid,
    unit,
    carbGram: lang === "uk" ? "г" : "g",
    bu100,
    bu10,
    amount,
    amount10,
    band,
    bandLabel,
    giText,
    h1,
    articleTitle,
    faq,
    metaTitle: ui.title(name),
    metaDescription: ui.description(lang, food, unit, bu100, amount, giText),
    paragraphs: copy[lang],
  };
}

function renderProductBody(lang, food, facts) {
  const { ui } = facts;
  const config = PAGES[lang];
  const q = (value) => esc(value);

  const rows = [
    `        <tr><th scope="row">${q(ui.colCarbs(facts.liquid))}</th><td>${q(ui.carbs(food))}</td></tr>`,
    `        <tr><th scope="row">${q(ui.statAmount(facts.liquid))}</th><td>${facts.amount} ${facts.unit}</td></tr>`,
    `        <tr><th scope="row">${q(ui.normLabel)} 10 ${facts.carbGram}</th><td>${facts.amount10} ${facts.unit}</td></tr>`,
    `        <tr><th scope="row">${q(ui.colGi)}</th><td>${q(facts.giText)}</td></tr>`,
  ];
  if (food.piece) {
    rows.push(
      `        <tr><th scope="row">${q(ui.statPiece)}</th><td>${fmt((food.piece * food.carbs) / 100 / 12, lang)} ${ui.unit} · ${q(ui.pieceNote(food.piece))}</td></tr>`,
    );
  }

  const faqHtml = facts.faq.map((item) => [
    "        <details>",
    `          <summary>${q(item.q)}</summary>`,
    `          <p>${q(item.a)}</p>`,
    "        </details>",
  ].join("\n")).join("\n");

  const relatedHtml = relatedProducts(food).map((product) => {
    const relatedFood = FOOD_BY_ID[product.id];
    return `        <li><a href="${q(productUrl(lang, product.id))}"><span>${q(relatedFood.name[lang])}</span><span aria-hidden="true">&#8594;</span></a></li>`;
  }).join("\n");

  const breadcrumbLd = jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: ui.home, item: config.homeUrl },
      { "@type": "ListItem", position: 2, name: ui.table, item: TABLE_URLS[lang] },
      { "@type": "ListItem", position: 3, name: facts.name, item: productUrl(lang, food.id) },
    ],
  });
  const faqLd = jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: facts.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });

  return [
    '<section class="container product-hero" aria-labelledby="product-title">',
    '  <ul class="breadcrumbs breadcrumbs__print-hide" aria-label="' + q(ui.breadcrumbLabel) + '">',
    `    <li><a href="${config.homeUrl}">${q(ui.home)}</a></li>`,
    '    <li class="breadcrumbs__sep" aria-hidden="true">/</li>',
    `    <li><a href="${TABLE_URLS[lang]}">${q(ui.table)}</a></li>`,
    '    <li class="breadcrumbs__sep" aria-hidden="true">/</li>',
    `    <li aria-current="page">${q(facts.name)}</li>`,
    "  </ul>",
    `  <span class="eyebrow">${q(ui.fileLabel)}</span>`,
    `  <h1 id="product-title">${q(facts.h1)}</h1>`,
    `  <p class="product-hero__lead">${q(ui.lead)}</p>`,
    "</section>",
    "",
    '<section class="container product-answer" id="product-answer" aria-labelledby="product-answer-title">',
    '  <div class="section-head">',
    `    <span class="eyebrow">${q(ui.answerEyebrow)}</span>`,
    `    <h2 id="product-answer-title">${q(ui.answerTitle)}</h2>`,
    "  </div>",
    '  <dl class="product-stats">',
    `    <div><dt>${q(ui.stat100(facts.liquid))}</dt><dd><strong>${facts.bu100}</strong> <span>${ui.unit}</span></dd></div>`,
    `    <div><dt>${q(ui.statAmount(facts.liquid))}</dt><dd><strong>${facts.amount}</strong> <span>${facts.unit}</span></dd></div>`,
    `    <div><dt>${q(ui.colGi)}</dt><dd><strong>${facts.band ? food.gi : "&#8212;"}</strong> <span>${q(facts.bandLabel || ui.giNoData)}</span></dd></div>`,
    "  </dl>",
    `  <p class="product-answer__note">${q(ui.note)}</p>`,
    "</section>",
    "",
    '<section class="container product-sheet" aria-labelledby="product-sheet-title">',
    '  <div class="section-head">',
    `    <h2 id="product-sheet-title">${q(ui.dataTitle)}</h2>`,
    "  </div>",
    '  <div class="table-wrap">',
    '    <table class="product-table">',
    "      <thead>",
    `        <tr><th scope="col">${q(ui.colMetric)}</th><th scope="col">${q(ui.colValue)}</th></tr>`,
    "      </thead>",
    "      <tbody>",
    rows.join("\n"),
    "      </tbody>",
    "    </table>",
    "  </div>",
    "</section>",
    "",
    '<section class="container product-calc" aria-labelledby="product-calc-title">',
    '  <div class="section-head">',
    `    <h2 id="product-calc-title">${q(ui.calcTitle)}</h2>`,
    `    <p>${q(ui.calcIntro)}</p>`,
    "  </div>",
    `  <div class="example mini-calc" data-mini-calc data-carbs="${food.carbs}">`,
    '    <div class="mini-calc__controls">',
    `      <label for="mini-weight-${food.id}">${q(ui.weightLabel(facts.liquid))}</label>`,
    `      <input class="mini-calc__input" id="mini-weight-${food.id}" type="number" min="1" step="${facts.liquid ? 10 : 1}" value="100" inputmode="decimal" data-mini-weight>`,
    '      <fieldset class="mini-calc__norm">',
    `        <legend>${q(ui.normLabel)}</legend>`,
    `        <button type="button" class="chip" data-mini-norm="10" aria-pressed="false">10 ${facts.carbGram}</button>`,
    `        <button type="button" class="chip is-active" data-mini-norm="12" aria-pressed="true">12 ${facts.carbGram}</button>`,
    "      </fieldset>",
    "    </div>",
    '    <div class="mini-calc__result" aria-live="polite">',
    `      <strong data-mini-result>${facts.bu100}</strong><span>${ui.unit}</span>`,
    "    </div>",
    `    <a class="link-btn" href="${config.homeUrl}?food=${encodeURIComponent(food.id)}#calculator">${q(ui.calcButton)}</a>`,
    "  </div>",
    "</section>",
    "",
    '<section class="container product-article" aria-labelledby="product-article-title">',
    '  <div class="section-head">',
    `    <h2 id="product-article-title">${q(facts.articleTitle)}</h2>`,
    "  </div>",
    '  <div class="product-article__body prose">',
    facts.paragraphs.map((paragraph) => `    <p>${q(paragraph)}</p>`).join("\n"),
    "  </div>",
    "</section>",
    "",
    '<section class="faq-container container product-faq" aria-labelledby="product-faq-title">',
    '  <div class="faq-layout">',
    '    <div class="section-head">',
    `      <h2 id="product-faq-title">${q(ui.faqTitle)}</h2>`,
    "    </div>",
    '    <div class="faq">',
    faqHtml,
    "    </div>",
    "  </div>",
    "</section>",
    "",
    '<section class="container product-related" aria-labelledby="product-related-title">',
    '  <div class="section-head">',
    `    <h2 id="product-related-title">${q(ui.relatedTitle)}</h2>`,
    "  </div>",
    '  <ol class="product-related__list">',
    relatedHtml,
    "  </ol>",
    `  <a class="btn btn--ghost" href="${TABLE_URLS[lang]}">${q(ui.relatedMore)}</a>`,
    "</section>",
    "",
    '<section class="container product-disclaimer">',
    '  <div class="disclaimer">',
    `    <h2>${q(ui.disclaimerLink)}</h2>`,
    `    <p>${q(ui.disclaimer)} <a href="${config.root}/disclaimer/">${q(ui.disclaimerLink)}</a></p>`,
    "  </div>",
    "</section>",
    "",
    '  <script type="application/ld+json">',
    `  ${breadcrumbLd}`,
    "  </script>",
    '  <script type="application/ld+json">',
    `  ${faqLd}`,
    "  </script>",
  ].join("\n");
}

function productPagePath(lang, slug) {
  if (lang === "uk") return path.join(srcDir, "produkty", slug, "index.html");
  return path.join(srcDir, lang, PRODUCT_PATHS[lang], slug, "index.html");
}

function productSitemapPath(lang, product) {
  const prefix = lang === "uk" ? "" : lang + "/";
  return `/${prefix}${PRODUCT_PATHS[lang]}/${product.slug[lang]}/`;
}

function writeProductPages() {
  if (PRODUCTS.length !== 30) throw new Error(`Expected 30 product pages, got ${PRODUCTS.length}`);
  const slugs = {};

  PRODUCTS.forEach((product) => {
    const food = FOOD_BY_ID[product.id];
    if (!food) throw new Error(`Unknown food id for product page: ${product.id}`);
    const copy = PRODUCT_COPY[product.id];
    if (!copy) throw new Error(`Missing product copy for ${product.id}`);
    slugs[product.id] = product.slug;

    ["uk", "en", "es"].forEach((lang) => {
      const config = PAGES[lang];
      const facts = productFacts(lang, food, copy);
      const includePath = path
        .relative(path.dirname(productPagePath(lang, product.slug[lang])), path.join(htmlDir, "_product-document.html"))
        .split(path.sep)
        .join("/");

      write(path.join(htmlDir, `_product-${product.id}-${lang}.html`), renderProductBody(lang, food, facts) + "\n");

      const params = [
        `"htmlLang":"${config.htmlLang}"`,
        `"ogLocale":"${config.ogLocale}"`,
        `"root":"${config.root}"`,
        `"canonical":${JSON.stringify(productUrl(lang, product.id))}`,
        `"metaTitle":${JSON.stringify(facts.metaTitle)}`,
        `"metaDescription":${JSON.stringify(facts.metaDescription)}`,
        `"appName":${JSON.stringify(I18N[lang]["hero.h1"])}`,
        `"altUk":${JSON.stringify(productUrl("uk", product.id))}`,
        `"altEn":${JSON.stringify(productUrl("en", product.id))}`,
        `"altEs":${JSON.stringify(productUrl("es", product.id))}`,
        `"homeLabel":${JSON.stringify(I18N[lang]["breadcrumb.home"])}`,
        `"homeUrl":"${config.homeUrl}"`,
        `"breadcrumbLabel":${JSON.stringify(facts.ui.breadcrumbLabel)}`,
        `"skipTarget":"#product-answer"`,
        `"foodId":${JSON.stringify(product.id)}`,
        `"bodyPartial":${JSON.stringify(`_product-${product.id}-${lang}.html`)}`,
      ].join(",");

      write(productPagePath(lang, product.slug[lang]), `@@include('${includePath}',{${params}})\n`);
    });
  });

  write(path.join(srcDir, "js", "product-slugs.js"), `window.BUC_PRODUCT_SLUGS = ${JSON.stringify(slugs, null, 2)};\n`);
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
    ...PRODUCTS.map((product) => ({
      urls: ["uk", "en", "es"].map((lang) => productSitemapPath(lang, product)),
      lastmod: PRODUCT_LAST_MOD,
      changefreq: "monthly",
      priority: ["0.7", "0.7", "0.7"],
    })),
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

    write(path.join(htmlDir, `_food-table-${lang}.html`), localizeHtml(renderTable(lang, t, false), lang) + "\n");
    write(path.join(htmlDir, `_table-page-${lang}.html`), localizeHtml(renderTablePage(lang, t), lang));

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

  writeProductPages();
  generateSitemap();
  process.stdout.write(`[seo] generated 3 table pages, 90 product pages, 93 partials and sitemap.xml (${FOODS.length} foods)\n`);
}

main();
