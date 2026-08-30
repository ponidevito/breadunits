/*
 * Bread Units Calculator - food reference data
 * -------------------------------------------------
 * `carbs` = approximate grams of carbohydrates per 100 g of the product.
 * Rounded reference figures from commonly published food-composition and
 * bread-unit tables. Estimates for informational use only.
 *
 * The calculator keeps the original project formula:
 *     XE = (carbs / 100) * weight / norm      (norm = 10 or 12)
 *
 * Selecting a food only pre-fills the "carbohydrates per 100 g" field;
 * the user can still type any value manually.
 *
 * `piece` (optional) = typical weight of one piece, in grams.
 * `liquid` = true -> measured in millilitres.
 */
window.BUC_FOODS = [
  // ---------- Bread & Bakery ----------
  { id: "white-bread",    cat: "bakery",  carbs: 49, name: { uk: "Білий хліб",            en: "White bread",         es: "Pan blanco" } },
  { id: "rye-bread",      cat: "bakery",  carbs: 42, name: { uk: "Житній хліб",           en: "Rye bread",           es: "Pan de centeno" } },
  { id: "borodino-bread", cat: "bakery",  carbs: 40, name: { uk: "Бородінський хліб",     en: "Borodinsky bread",    es: "Pan Borodinsky" } },
  { id: "rusks",          cat: "bakery",  carbs: 70, name: { uk: "Сухарі",                en: "Rusks / dried bread", es: "Pan tostado seco" } },
  { id: "crispbread",     cat: "bakery",  carbs: 75, name: { uk: "Хлібці хрусткі",        en: "Crispbread",          es: "Pan crujiente" } },
  { id: "crackers",       cat: "bakery",  carbs: 68, name: { uk: "Крекери несолодкі",     en: "Plain crackers",      es: "Galletas saladas" } },
  { id: "wheat-flour",    cat: "bakery",  carbs: 73, name: { uk: "Борошно пшеничне",      en: "Wheat flour",         es: "Harina de trigo" } },
  { id: "pancake",        cat: "bakery",  carbs: 28, piece: 45, name: { uk: "Млинець",     en: "Pancake",             es: "Panqueque" } },

  // ---------- Cereals ----------
  { id: "buckwheat-dry",  cat: "cereals", carbs: 62, name: { uk: "Гречка (сухою вагою)",   en: "Buckwheat (dry)",     es: "Trigo sarraceno (seco)" } },
  { id: "rice-dry",       cat: "cereals", carbs: 74, name: { uk: "Рис (сухою вагою)",      en: "Rice (dry)",          es: "Arroz (seco)" } },
  { id: "rice-cooked",    cat: "cereals", carbs: 25, name: { uk: "Рис відварений",         en: "Rice (cooked)",       es: "Arroz (cocido)" } },
  { id: "oatmeal-dry",    cat: "cereals", carbs: 60, name: { uk: "Вівсянка (сухою вагою)", en: "Oatmeal (dry)",       es: "Avena (seca)" } },
  { id: "semolina-dry",   cat: "cereals", carbs: 70, name: { uk: "Манка (сухою вагою)",    en: "Semolina (dry)",      es: "Sémola (seca)" } },
  { id: "millet-dry",     cat: "cereals", carbs: 66, name: { uk: "Пшоно (сухою вагою)",    en: "Millet (dry)",        es: "Mijo (seco)" } },
  { id: "barley-dry",     cat: "cereals", carbs: 67, name: { uk: "Перловка (сухою вагою)", en: "Pearl barley (dry)",  es: "Cebada perlada (seca)" } },
  { id: "corn-canned",    cat: "cereals", carbs: 20, name: { uk: "Кукурудза консервована", en: "Sweet corn (canned)", es: "Maíz dulce (lata)" } },

  // ---------- Pasta & Potatoes ----------
  { id: "pasta-dry",      cat: "pasta",   carbs: 71, name: { uk: "Макарони (сухою вагою)", en: "Pasta (dry)",         es: "Pasta (seca)" } },
  { id: "pasta-cooked",   cat: "pasta",   carbs: 25, name: { uk: "Макарони відварені",     en: "Pasta (cooked)",      es: "Pasta (cocida)" } },
  { id: "potato-raw",     cat: "pasta",   carbs: 17, piece: 90, name: { uk: "Картопля сира", en: "Potato (raw)",      es: "Papa (cruda)" } },
  { id: "potato-boiled",  cat: "pasta",   carbs: 16, name: { uk: "Картопля відварена",     en: "Boiled potato",       es: "Papa hervida" } },
  { id: "mashed-potato",  cat: "pasta",   carbs: 14, name: { uk: "Картопляне пюре",        en: "Mashed potato",       es: "Puré de papa" } },
  { id: "fried-potato",   cat: "pasta",   carbs: 30, name: { uk: "Смажена картопля",       en: "Fried potato",        es: "Papa frita" } },
  { id: "potato-chips",   cat: "pasta",   carbs: 50, name: { uk: "Картопляні чіпси",       en: "Potato chips",        es: "Papas fritas de bolsa" } },

  // ---------- Fruits ----------
  { id: "apple",          cat: "fruits",  carbs: 11, piece: 150, name: { uk: "Яблуко",     en: "Apple",               es: "Manzana" } },
  { id: "banana",         cat: "fruits",  carbs: 21, piece: 120, name: { uk: "Банан",      en: "Banana",              es: "Plátano" } },
  { id: "orange",         cat: "fruits",  carbs: 8,  piece: 180, name: { uk: "Апельсин",   en: "Orange",              es: "Naranja" } },
  { id: "pear",           cat: "fruits",  carbs: 10, piece: 135, name: { uk: "Груша",      en: "Pear",                es: "Pera" } },
  { id: "grapes",         cat: "fruits",  carbs: 16, name: { uk: "Виноград",              en: "Grapes",              es: "Uvas" } },
  { id: "watermelon",     cat: "fruits",  carbs: 8,  name: { uk: "Кавун",                 en: "Watermelon",          es: "Sandía" } },
  { id: "melon",          cat: "fruits",  carbs: 8,  name: { uk: "Диня",                  en: "Melon",               es: "Melón" } },
  { id: "peach",          cat: "fruits",  carbs: 10, piece: 120, name: { uk: "Персик",     en: "Peach",               es: "Durazno" } },
  { id: "apricot",        cat: "fruits",  carbs: 9,  piece: 30,  name: { uk: "Абрикос",    en: "Apricot",             es: "Albaricoque" } },
  { id: "strawberry",     cat: "fruits",  carbs: 7,  name: { uk: "Полуниця",              en: "Strawberry",          es: "Fresa" } },
  { id: "cherry",         cat: "fruits",  carbs: 13, name: { uk: "Черешня",               en: "Sweet cherry",        es: "Cereza" } },
  { id: "plum",           cat: "fruits",  carbs: 11, piece: 40,  name: { uk: "Слива",      en: "Plum",                es: "Ciruela" } },
  { id: "tangerine",      cat: "fruits",  carbs: 8,  piece: 70,  name: { uk: "Мандарин",   en: "Tangerine",           es: "Mandarina" } },
  { id: "kiwi",           cat: "fruits",  carbs: 10, piece: 75,  name: { uk: "Ківі",       en: "Kiwi",                es: "Kiwi" } },
  { id: "dried-apricots", cat: "fruits",  carbs: 62, name: { uk: "Курага",                en: "Dried apricots",      es: "Orejones" } },
  { id: "raisins",        cat: "fruits",  carbs: 72, name: { uk: "Родзинки",              en: "Raisins",             es: "Pasas" } },

  // ---------- Legumes ----------
  { id: "green-peas",     cat: "legumes", carbs: 13, name: { uk: "Горошок зелений",        en: "Green peas",          es: "Guisantes verdes" } },
  { id: "beans-dry",      cat: "legumes", carbs: 55, name: { uk: "Квасоля (сухою вагою)",  en: "Beans (dry)",         es: "Frijoles (secos)" } },
  { id: "beans-boiled",   cat: "legumes", carbs: 22, name: { uk: "Квасоля відварена",      en: "Beans (boiled)",      es: "Frijoles (cocidos)" } },
  { id: "lentils-dry",    cat: "legumes", carbs: 57, name: { uk: "Сочевиця (сухою вагою)", en: "Lentils (dry)",       es: "Lentejas (secas)" } },
  { id: "chickpeas-dry",  cat: "legumes", carbs: 57, name: { uk: "Нут (сухою вагою)",      en: "Chickpeas (dry)",     es: "Garbanzos (secos)" } },

  // ---------- Other foods ----------
  { id: "milk",           cat: "other",   carbs: 5,  liquid: true, name: { uk: "Молоко",   en: "Milk",                es: "Leche" } },
  { id: "kefir",          cat: "other",   carbs: 4,  liquid: true, name: { uk: "Кефір",    en: "Kefir",               es: "Kéfir" } },
  { id: "plain-yogurt",   cat: "other",   carbs: 6,  liquid: true, name: { uk: "Йогурт без цукру", en: "Plain yogurt", es: "Yogur natural" } },
  { id: "ice-cream",      cat: "other",   carbs: 23, name: { uk: "Морозиво",              en: "Ice cream",           es: "Helado" } },
  { id: "sugar",          cat: "other",   carbs: 100, name: { uk: "Цукор",                en: "Sugar",               es: "Azúcar" } },
  { id: "honey",          cat: "other",   carbs: 80, name: { uk: "Мед",                   en: "Honey",               es: "Miel" } },
  { id: "chocolate",      cat: "other",   carbs: 55, name: { uk: "Шоколад",               en: "Chocolate",           es: "Chocolate" } },
  { id: "orange-juice",   cat: "other",   carbs: 11, liquid: true, name: { uk: "Апельсиновий сік", en: "Orange juice", es: "Zumo de naranja" } },
  { id: "apple-juice",    cat: "other",   carbs: 11, liquid: true, name: { uk: "Яблучний сік", en: "Apple juice",      es: "Zumo de manzana" } },
  { id: "cola",           cat: "other",   carbs: 11, liquid: true, name: { uk: "Солодка газована вода", en: "Sugary soda", es: "Refresco azucarado" } }
];
