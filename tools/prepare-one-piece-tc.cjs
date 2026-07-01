#!/usr/bin/env node

/**
 * Prepare ONE PIECE Card Game TC raw data for frontend.
 *
 * Input:
 *   downloads/one-piece-tc-all/cards.raw.json
 *   downloads/one-piece-tc-all/products.raw.json
 *
 * Output:
 *   public/data/one-piece-tc/cards.tc.json
 *   public/data/one-piece-tc/products.tc.json
 *   public/data/one-piece-tc/summary.json
 *
 * Optional env:
 *   OP_RAW_DIR=downloads/one-piece-tc-all
 *   OP_PUBLIC_DIR=public/data/one-piece-tc
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT_DIR = process.cwd();

const RAW_DIR = resolveFromRoot(
  process.env.OP_RAW_DIR ||
    process.env.OP_OUT_DIR ||
    "downloads/one-piece-tc-all"
);

const PUBLIC_DIR = resolveFromRoot(
  process.env.OP_PUBLIC_DIR || "public/data/one-piece-tc"
);

const CARDS_RAW_PATH = path.join(RAW_DIR, "cards.raw.json");
const PRODUCTS_RAW_PATH = path.join(RAW_DIR, "products.raw.json");

const CARDS_OUT_PATH = path.join(PUBLIC_DIR, "cards.tc.json");
const PRODUCTS_OUT_PATH = path.join(PUBLIC_DIR, "products.tc.json");
const SUMMARY_OUT_PATH = path.join(PUBLIC_DIR, "summary.json");

main();

function main() {
  const cardsRaw = readJsonArray(CARDS_RAW_PATH, "cards.raw.json");
  const productsRaw = readJsonArray(PRODUCTS_RAW_PATH, "products.raw.json");

  const cards = cardsRaw.map(normalizeCard);

  const products = buildProducts(cards, productsRaw);

  const summary = buildSummary({
    cards,
    products,
    cardsRaw,
    productsRaw,
  });

  ensureDir(PUBLIC_DIR);

  writeJson(CARDS_OUT_PATH, cards);
  writeJson(PRODUCTS_OUT_PATH, products);
  writeJson(SUMMARY_OUT_PATH, summary);

  console.log("");
  console.log("✅ ONE PIECE TC frontend JSON prepared");
  console.log(`Raw dir:      ${relativePath(RAW_DIR)}`);
  console.log(`Output dir:   ${relativePath(PUBLIC_DIR)}`);
  console.log("");
  console.log(`Cards:        ${cards.length}`);
  console.log(`Products:     ${products.length}`);
  console.log(`With imageUrl:${summary.cards.withImageUrl}`);
  console.log("");
  console.log(`Wrote: ${relativePath(CARDS_OUT_PATH)}`);
  console.log(`Wrote: ${relativePath(PRODUCTS_OUT_PATH)}`);
  console.log(`Wrote: ${relativePath(SUMMARY_OUT_PATH)}`);
  console.log("");
}

function normalizeCard(raw, index) {
  const cardNo = text(raw.cardNo);
  const rarity = text(raw.rarity);
  const cardType = text(raw.cardType);
  const name = text(raw.name);

  const cost = text(raw.cost);
  const life = text(raw.life);
  const attribute = text(raw.attribute);
  const power = text(raw.power);
  const counter = text(raw.counter);

  const color = text(raw.color);
  const block = text(raw.block);
  const feature = text(raw.feature);
  const effect = text(raw.effect);
  const trigger = text(raw.trigger);

  const cardSet = text(raw.cardSet);
  const seriesId = text(raw.seriesId);
  const seriesName = text(raw.seriesName);

  const imageUrl = text(raw.imageUrl);
  const imageFile = text(raw.imageFile);
  const sourceUrl = text(raw.sourceUrl);

  const colors = splitMultiValue(color);
  const features = splitMultiValue(feature);

  const productName = cardSet || seriesName || "";
  const productKey = makeKey(productName || seriesId || `unknown-product-${index}`);

  const id = makeCardId({
    cardNo,
    name,
    rarity,
    cardType,
    cardSet,
    seriesId,
    imageUrl,
    imageFile,
    index,
  });

  const localImageUrl = imageFile
    ? `/data/one-piece-tc/images/${imageFile.replace(/\\/g, "/")}`
    : "";

  const tags = uniqueClean([
    rarity,
    cardType,
    attribute,
    color,
    ...colors,
    block ? `BLOCK ${block}` : "",
    ...features,
    cardSet,
    seriesName,
  ]);

  const searchText = makeSearchText([
    cardNo,
    rarity,
    cardType,
    name,
    cost,
    life,
    attribute,
    power,
    counter,
    color,
    block,
    feature,
    effect,
    trigger,
    cardSet,
    seriesId,
    seriesName,
    ...tags,
  ]);

  return {
    id,
    game: "one-piece",
    locale: "tc",

    cardNo,
    rarity,
    cardType,
    name,

    cost,
    costValue: toNumberOrNull(cost),

    life,
    lifeValue: toNumberOrNull(life),

    attribute,

    power,
    powerValue: toNumberOrNull(power),

    counter,
    counterValue: toNumberOrNull(counter),

    color,
    colors,

    block,

    feature,
    features,

    effect,
    trigger,

    cardSet,
    productName,
    productKey,

    seriesId,
    seriesName,

    imageUrl,
    imageFile,
    localImageUrl,
    sourceUrl,

    tags,
    searchText,

    rawIndex: index,
  };
}

function buildProducts(cards, productsRaw) {
  const productMap = new Map();

  for (const card of cards) {
    const key = card.productKey || makeKey(card.productName || card.seriesName || "unknown");
    const name = card.productName || card.seriesName || "未分類";

    if (!productMap.has(key)) {
      productMap.set(key, {
        id: makeProductId(key, name),
        game: "one-piece",
        locale: "tc",

        name,
        title: name,
        cardSet: name,
        productKey: key,

        seriesIds: [],
        seriesNames: [],

        cardCount: 0,
        cardIds: [],
        cardNos: [],

        colors: [],
        rarities: [],
        cardTypes: [],
        blocks: [],

        sourceUrl: "",
        imageUrl: "",

        searchText: "",
      });
    }

    const product = productMap.get(key);

    product.cardCount += 1;
    product.cardIds.push(card.id);

    pushUnique(product.cardNos, card.cardNo);
    pushUnique(product.seriesIds, card.seriesId);
    pushUnique(product.seriesNames, card.seriesName);

    for (const color of card.colors || []) pushUnique(product.colors, color);
    pushUnique(product.rarities, card.rarity);
    pushUnique(product.cardTypes, card.cardType);
    pushUnique(product.blocks, card.block);

    if (!product.sourceUrl && card.sourceUrl) {
      product.sourceUrl = card.sourceUrl;
    }

    if (!product.imageUrl && card.imageUrl) {
      product.imageUrl = card.imageUrl;
    }
  }

  for (const rawProduct of productsRaw) {
    const normalized = normalizeRawProduct(rawProduct);
    const key =
      normalized.productKey ||
      makeKey(
        normalized.name ||
          normalized.title ||
          normalized.cardSet ||
          normalized.seriesName ||
          normalized.seriesId
      );

    if (!key) continue;

    if (productMap.has(key)) {
      const existing = productMap.get(key);

      productMap.set(key, {
        ...normalized,
        ...existing,

        // Prefer cleaner raw product display fields if present.
        name: normalized.name || existing.name,
        title: normalized.title || existing.title,
        cardSet: normalized.cardSet || existing.cardSet,

        sourceUrl: normalized.sourceUrl || existing.sourceUrl,
        imageUrl: normalized.imageUrl || existing.imageUrl,

        rawProduct: rawProduct,
      });
    } else {
      productMap.set(key, {
        ...normalized,
        id: normalized.id || makeProductId(key, normalized.name || normalized.title || key),
        game: "one-piece",
        locale: "tc",
        productKey: key,

        seriesIds: normalized.seriesId ? [normalized.seriesId] : [],
        seriesNames: normalized.seriesName ? [normalized.seriesName] : [],

        cardCount: 0,
        cardIds: [],
        cardNos: [],

        colors: [],
        rarities: [],
        cardTypes: [],
        blocks: [],

        rawProduct: rawProduct,
      });
    }
  }

  const products = Array.from(productMap.values()).map((product, index) => {
    const name = text(product.name || product.title || product.cardSet || `Product ${index + 1}`);

    const searchText = makeSearchText([
      name,
      product.title,
      product.cardSet,
      product.productKey,
      ...(product.seriesIds || []),
      ...(product.seriesNames || []),
      ...(product.cardNos || []),
      ...(product.colors || []),
      ...(product.rarities || []),
      ...(product.cardTypes || []),
      ...(product.blocks || []),
    ]);

    return {
      ...product,
      name,
      title: text(product.title || name),
      searchText,
    };
  });

  products.sort((a, b) => {
    const aHasCards = a.cardCount > 0 ? 0 : 1;
    const bHasCards = b.cardCount > 0 ? 0 : 1;

    if (aHasCards !== bHasCards) return aHasCards - bHasCards;

    return String(a.name || "").localeCompare(String(b.name || ""), "zh-Hant");
  });

  return products;
}

function normalizeRawProduct(raw) {
  const name = firstText(
    raw.name,
    raw.title,
    raw.productName,
    raw.cardSet,
    raw.seriesName,
    raw.label
  );

  const title = firstText(raw.title, name);
  const cardSet = firstText(raw.cardSet, name);

  const seriesId = text(raw.seriesId);
  const seriesName = text(raw.seriesName);

  const imageUrl = text(raw.imageUrl || raw.image);
  const sourceUrl = text(raw.sourceUrl || raw.url || raw.link || raw.href);

  const key = makeKey(name || cardSet || seriesName || seriesId);

  return {
    ...raw,

    id: raw.id ? text(raw.id) : makeProductId(key, name || seriesName || seriesId || "product"),

    game: "one-piece",
    locale: "tc",

    name,
    title,
    cardSet,

    seriesId,
    seriesName,

    productKey: key,

    imageUrl,
    sourceUrl,

    searchText: makeSearchText([
      name,
      title,
      cardSet,
      seriesId,
      seriesName,
      sourceUrl,
    ]),
  };
}

function buildSummary({ cards, products, cardsRaw, productsRaw }) {
  const cardNoCounts = countBy(cards, (card) => card.cardNo);
  const duplicateCardNos = Object.fromEntries(
    Object.entries(cardNoCounts).filter(([, count]) => count > 1)
  );

  return {
    game: "one-piece",
    locale: "tc",
    generatedAt: new Date().toISOString(),

    input: {
      rawDir: relativePath(RAW_DIR),
      cardsRawPath: relativePath(CARDS_RAW_PATH),
      productsRawPath: relativePath(PRODUCTS_RAW_PATH),
      rawCards: cardsRaw.length,
      rawProducts: productsRaw.length,
    },

    output: {
      publicDir: relativePath(PUBLIC_DIR),
      cardsPath: relativePath(CARDS_OUT_PATH),
      productsPath: relativePath(PRODUCTS_OUT_PATH),
      summaryPath: relativePath(SUMMARY_OUT_PATH),
    },

    cards: {
      total: cards.length,
      withImageUrl: cards.filter((card) => Boolean(card.imageUrl)).length,
      withImageFile: cards.filter((card) => Boolean(card.imageFile)).length,
      withEffect: cards.filter((card) => Boolean(card.effect)).length,
      withTrigger: cards.filter((card) => Boolean(card.trigger)).length,
      withCardSet: cards.filter((card) => Boolean(card.cardSet)).length,
      withSeriesName: cards.filter((card) => Boolean(card.seriesName)).length,

      uniqueImages: new Set(
        cards.map((card) => card.imageUrl || card.imageFile).filter(Boolean)
      ).size,

      duplicateCardNos,
    },

    products: {
      total: products.length,
      withCards: products.filter((product) => product.cardCount > 0).length,
      withoutCards: products.filter((product) => product.cardCount <= 0).length,
    },

    indexes: {
      byCardType: countBy(cards, (card) => card.cardType),
      byRarity: countBy(cards, (card) => card.rarity),
      byColor: countByMulti(cards, (card) => card.colors),
      byBlock: countBy(cards, (card) => card.block),
      bySeriesName: countBy(cards, (card) => card.seriesName),
      byCardSet: countBy(cards, (card) => card.cardSet),
    },

    notes: [
      "Frontend should prefer imageUrl.",
      "localImageUrl is only a fallback path. Do not commit thousands of downloaded images unless you intentionally want local image hosting.",
      "cards.tc.json and products.tc.json are safe to commit.",
    ],
  };
}

function readJsonArray(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error("");
    console.error(`❌ Missing ${label}`);
    console.error(`Expected path: ${relativePath(filePath)}`);
    console.error("");
    process.exit(1);
  }

  const rawText = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  let data;

  try {
    data = JSON.parse(rawText);
  } catch (error) {
    console.error("");
    console.error(`❌ Failed to parse ${label}`);
    console.error(`Path: ${relativePath(filePath)}`);
    console.error(error.message);
    console.error("");
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error("");
    console.error(`❌ ${label} should be a JSON array`);
    console.error(`Path: ${relativePath(filePath)}`);
    console.error("");
    process.exit(1);
  }

  return data;
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function resolveFromRoot(targetPath) {
  if (path.isAbsolute(targetPath)) return targetPath;
  return path.join(ROOT_DIR, targetPath);
}

function relativePath(targetPath) {
  return path.relative(ROOT_DIR, targetPath).replace(/\\/g, "/") || ".";
}

function text(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function firstText(...values) {
  for (const value of values) {
    const valueText = text(value);
    if (valueText) return valueText;
  }
  return "";
}

function splitMultiValue(value) {
  const valueText = text(value);

  if (!valueText) return [];

  return uniqueClean(
    valueText
      .split(/[\/／,，、]/g)
      .map((item) => text(item))
      .filter(Boolean)
  );
}

function uniqueClean(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const valueText = text(value);
    if (!valueText) continue;

    const key = valueText.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(valueText);
  }

  return result;
}

function pushUnique(array, value) {
  const valueText = text(value);
  if (!valueText) return;

  if (!array.includes(valueText)) {
    array.push(valueText);
  }
}

function makeSearchText(values) {
  return uniqueClean(values)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function makeKey(value) {
  return text(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function makeHash(value, length = 10) {
  return crypto.createHash("sha1").update(String(value)).digest("hex").slice(0, length);
}

function safeSlug(value) {
  const valueText = text(value) || "item";

  return valueText
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fffぁ-んァ-ン一-龥]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

function makeCardId(card) {
  const base = [
    card.cardNo,
    card.name,
    card.rarity,
    card.cardType,
    card.cardSet,
    card.seriesId,
    card.imageUrl,
    card.imageFile,
    card.index,
  ].join("|");

  const slug = safeSlug(card.cardNo || card.name || `card-${card.index + 1}`);
  return `op-${slug}-${makeHash(base, 8)}`;
}

function makeProductId(key, name) {
  const base = `${key}|${name}`;
  const slug = safeSlug(name || key || "product");
  return `op-product-${slug}-${makeHash(base, 8)}`;
}

function toNumberOrNull(value) {
  const valueText = text(value);

  if (!valueText || valueText === "-" || valueText === "－") return null;

  const match = valueText.replace(/,/g, "").match(/-?\d+/);
  if (!match) return null;

  const numberValue = Number(match[0]);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function countBy(items, getValue) {
  const counts = {};

  for (const item of items) {
    const key = text(getValue(item));
    if (!key) continue;

    counts[key] = (counts[key] || 0) + 1;
  }

  return sortCountObject(counts);
}

function countByMulti(items, getValues) {
  const counts = {};

  for (const item of items) {
    const values = getValues(item) || [];

    for (const value of values) {
      const key = text(value);
      if (!key) continue;

      counts[key] = (counts[key] || 0) + 1;
    }
  }

  return sortCountObject(counts);
}

function sortCountObject(counts) {
  return Object.fromEntries(
    Object.entries(counts).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0], "zh-Hant");
    })
  );
}