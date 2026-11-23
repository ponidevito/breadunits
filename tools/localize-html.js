"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { Transform } = require("stream");

const root = path.resolve(__dirname, "..");
const i18nCode = fs.readFileSync(path.join(root, "src", "js", "i18n.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(i18nCode, sandbox, { filename: "i18n.js" });
const I18N = sandbox.window.BUC_I18N;

const LOCALE = { uk: "uk_UA", en: "en_US", es: "es_ES" };

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function translator(lang) {
  const current = I18N[lang] || I18N.uk;
  return (key) => {
    if (Object.prototype.hasOwnProperty.call(current, key)) return current[key];
    if (Object.prototype.hasOwnProperty.call(I18N.uk, key)) return I18N.uk[key];
    return key;
  };
}

function langFromPath(relativePath) {
  const value = String(relativePath || "").replace(/\\/g, "/");
  const base = path.basename(value);
  if (base === "en.html" || /^en\//.test(value)) return "en";
  if (base === "es.html" || /^es\//.test(value)) return "es";
  return "uk";
}

function replaceText(html, t) {
  let out = html.replace(
    /<([a-zA-Z][\w:-]*)\b([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, key) => `<${tag}${attrs}>${escapeHtml(t(key))}</${tag}>`,
  );

  out = out.replace(
    /<([a-zA-Z][\w:-]*)\b([^>]*\bdata-i18n-html="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, key) => `<${tag}${attrs}>${t(key)}</${tag}>`,
  );

  return out;
}

function replaceAttrs(html, t) {
  return html.replace(/<([a-zA-Z][\w:-]*)\b([^>]*)>/g, (full, tag, attrs) => {
    const match = attrs.match(/\sdata-i18n-attr="([^"]*)"/);
    if (!match) return full;

    let nextAttrs = attrs;
    match[1].split(",").forEach((pair) => {
      const parts = pair.split(":");
      if (parts.length !== 2) return;
      const attr = parts[0].trim();
      const key = parts[1].trim();
      if (!attr || !key) return;
      const value = escapeHtml(t(key));
      const attrRe = new RegExp(`(\\s${attr}=")[^"]*(")`, "i");
      if (attrRe.test(nextAttrs)) nextAttrs = nextAttrs.replace(attrRe, `$1${value}$2`);
      else nextAttrs += ` ${attr}="${value}"`;
    });

    return `<${tag}${nextAttrs}>`;
  });
}

function setMetaContent(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+[^>]*${attr}="${name}"[^>]*\\scontent=")[^"]*(")`, "i");
  return html.replace(re, `$1${escapeHtml(value)}$2`);
}

function replaceHead(html, lang, t) {
  let out = html;
  const isHome = /id="calculator"/.test(out);
  const isTable = /data-table-full/.test(out);

  if (isHome || isTable) {
    const title = t(isTable ? "tablePage.title" : "meta.title");
    const description = t(isTable ? "tablePage.description" : "meta.description");
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    out = setMetaContent(out, "name", "description", description);
    out = setMetaContent(out, "property", "og:title", title);
    out = setMetaContent(out, "property", "og:description", description);
    out = setMetaContent(out, "name", "twitter:title", title);
    out = setMetaContent(out, "name", "twitter:description", description);
  }

  out = setMetaContent(out, "property", "og:site_name", "BreadUnits");
  out = setMetaContent(out, "property", "og:locale", LOCALE[lang]);

  out = out.replace(/<meta\s+property="og:locale:alternate"\s+content="[^"]*"\s*\/?>\s*/gi, "");
  const alternates = Object.keys(LOCALE)
    .filter((code) => code !== lang)
    .map((code) => `  <meta property="og:locale:alternate" content="${LOCALE[code]}">`)
    .join("\n");
  out = out.replace(/(<meta\s+property="og:locale"\s+content="[^"]*"\s*\/?>)/i, `$1\n${alternates}`);

  return out;
}

function replaceHtmlLang(html, lang) {
  return html.replace(/<html\b([^>]*)>/i, (full, attrs) => {
    if (/\slang="[^"]*"/i.test(attrs)) {
      return `<html${attrs.replace(/\slang="[^"]*"/i, ` lang="${lang}"`)}>`;
    }
    return `<html lang="${lang}"${attrs}>`;
  });
}

function localizeHtml(html, lang) {
  const t = translator(lang);
  let out = replaceText(String(html), t);
  out = replaceAttrs(out, t);
  out = replaceHead(out, lang, t);
  out = replaceHtmlLang(out, lang);
  return out;
}

function createLocalizeStream() {
  return new Transform({
    objectMode: true,
    transform(file, encoding, callback) {
      if (file.isBuffer() && path.extname(file.path) === ".html") {
        const sourcePath = file.history && file.history[0] ? file.history[0] : file.path;
        const relative = path.relative(path.join(root, "src"), sourcePath);
        file.contents = Buffer.from(localizeHtml(file.contents.toString("utf8"), langFromPath(relative)), "utf8");
      }
      callback(null, file);
    },
  });
}

module.exports = { localizeHtml, langFromPath, createLocalizeStream };
