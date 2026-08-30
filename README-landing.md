# Bread Units Calculator — landing page

Integrated into the existing **gulp** build. Source in `src/`, output in `build/`
(browser-sync serves `build/` on `http://localhost:3000`).

```
gulp          # clean + build + watch + browser-sync (default)
gulp build    # one-off build
gulp prod     # build with image optimization
```

## Languages / URLs

One template, three physical pages — clean URLs, no `?lang=`:

| URL      | file                  | `<html lang>` |
|----------|-----------------------|---------------|
| `/`      | `build/index.html`    | `uk` (default) |
| `/en/`   | `build/en/index.html` | `en` |
| `/es/`   | `build/es/index.html` | `es` |

`src/html/_document.html` is the shared template; `src/index.html`, `src/en.html`,
`src/es.html` are one-line entries that pass `htmlLang` / `ogLocale` / `canonical`
into it. The gulp `html` task renames `en.html` → `en/index.html` etc.
`main.js` reads the language from the path and the language switcher navigates
between `/`, `/en/`, `/es/` (subfolder deploys like `/repo/en/` also work).

**Asset paths are root-absolute** (`/css/…`, `/js/…`, `/favicon.png`) so the
nested `/en/` and `/es/` pages load them correctly. If you deploy in a subfolder
instead of a domain root, add `<base href="/repo/">` or make the paths relative.

## Source layout

```
src/index.html  src/en.html  src/es.html   one-line locale entries
src/html/
  _document.html              shared full-page template (@@htmlLang / @@canonical / @@ogLocale)
  _header.html                sticky header, nav, language + theme controls
  _hero.html                  hero + @@include('_calculator.html')
  _calculator.html            the calculator card (your original form, restyled)
  _how-it-works.html
  _what-is-xe.html
  _food-table.html            searchable / filterable table (filled by JS)
  _why.html
  _app-promo.html             Google Play section (placeholder URL + screenshots)
  _faq.html                   <details> accordion
  _disclaimer.html            medical disclaimer
  _footer.html
src/scss/
  _base.scss                  design tokens, light/dark theme, buttons, reveal
  _global.scss _header.scss _hero.scss _calculator.scss
  _table.scss _sections.scss _footer.scss
  _vars.scss _mixins.scss _reset.scss   (kept from the original setup)
  style.scss  ->  build/css/style.min.css
src/js/
  foods.js                    food reference data (carbs per 100 g)
  i18n.js                     UI strings: uk (default) / en / es
  main.js                     calculator + theme + language + menu + table + reveal
  scripts.js                  @@include('foods.js' + 'i18n.js' + 'main.js')  ->  build/js/scripts.min.js
src/robots.txt src/sitemap.xml src/site.webmanifest src/favicon.png
  -> copied to build/ root by the new `misc` gulp task
```

## Calculator — original logic kept

`src/js/main.js` uses the **exact formula from your original `main.js`**:

```
XE = (carbohydrates per 100 g / 100) * portion weight / norm      // norm = 10 or 12
```

The form still has: carbohydrates per 100 g, total portion weight, and the 10 / 12
toggle. Added on top: an **optional food dropdown** that only pre-fills the
"carbohydrates per 100 g" field (you can still type any value), and a live formula
line under the result. Nothing about the calculation changed.

## Before going live — replace placeholders

- `https://YOUR-DOMAIN.com/` — in `src/index.html`, `src/robots.txt`, `src/sitemap.xml`
- `GOOGLE_PLAY_URL` — in `src/html/_app-promo.html` (`#google-play-link`)
- `src/og-image.png` (referenced as `/og-image.png`) — add a real 1200×630 image;
  the `misc` task will copy any `src/*.png` to the site root
- App screenshots — replace the three `.app-shot` placeholders in `_app-promo.html`

## Future SEO pages

The single page is structured so these can be split out later:
`/bread-units-calculator/`, `/bread-units-table/`, `/what-is-a-bread-unit/`,
`/xe-calculator/`, `/foods/`. Add them to `src/sitemap.xml` and the hreflang set.

## Food data

`src/js/foods.js` holds rounded reference figures (carbohydrates per 100 g) from
commonly published food-composition and bread-unit tables — estimates for
informational use only (see the on-page medical disclaimer). Edit values there.
