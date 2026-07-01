/* eslint-disable no-console */

const { chromium } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const DEFAULT_START_URL =
  "https://asia-tc.onepiece-cardgame.com/cardlist/?series=554116";

const START_URL = process.env.OP_START_URL || DEFAULT_START_URL;

const OUT_DIR =
  process.env.OP_OUT_DIR ||
  path.join(process.cwd(), "downloads", "one-piece-tc");

const IMAGE_DIR = path.join(OUT_DIR, "images");

const PARTIAL_JSON = path.join(OUT_DIR, "cards.partial.json");
const RAW_JSON = path.join(OUT_DIR, "cards.raw.json");
const RAW_CSV = path.join(OUT_DIR, "cards.raw.csv");
const PRODUCTS_JSON = path.join(OUT_DIR, "products.raw.json");

const FAILED_PAGES = path.join(OUT_DIR, "failed-pages.jsonl");
const FAILED_IMAGES = path.join(OUT_DIR, "failed-images.jsonl");

const DEBUG_HTML = path.join(OUT_DIR, "debug-page.html");
const DEBUG_TEXT = path.join(OUT_DIR, "debug-body-text.txt");

const ALL_SERIES = process.env.OP_ALL_SERIES === "1";
const DOWNLOAD_IMAGES = process.env.OP_DOWNLOAD_IMAGES !== "0";
const RESET = process.env.OP_RESET === "1";

const DELAY_MS = Number(process.env.OP_DELAY_MS || 350);
const NAV_TIMEOUT_MS = Number(process.env.OP_NAV_TIMEOUT_MS || 60000);
const IMAGE_TIMEOUT_MS = Number(process.env.OP_IMAGE_TIMEOUT_MS || 45000);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback) {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function appendJsonl(filePath, obj) {
  await fs.appendFile(filePath, `${JSON.stringify(obj)}\n`, "utf8");
}

function normalizeText(input) {
  return String(input || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function normalizeLine(input) {
  return normalizeText(input)
    .replace(/^#+\s*/g, "")
    .replace(/：/g, ":")
    .replace(/:$/g, "")
    .trim();
}

function safeFilePart(input) {
  return String(input || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 120);
}

function sha1(input) {
  return crypto.createHash("sha1").update(String(input)).digest("hex");
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(cards) {
  const headers = [
    "cardNo",
    "rarity",
    "cardType",
    "name",
    "cost",
    "life",
    "attribute",
    "power",
    "counter",
    "color",
    "block",
    "feature",
    "effect",
    "trigger",
    "cardSet",
    "seriesId",
    "seriesName",
    "imageUrl",
    "imageFile",
    "sourceUrl",
  ];

  const rows = cards.map((card) =>
    headers.map((header) => csvEscape(card[header])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function makeCardKey(card) {
  return [
    card.cardNo,
    card.rarity,
    card.cardType,
    card.name,
    card.cardSet,
    card.imageUrl,
  ]
    .map((x) => normalizeText(x))
    .join("|");
}

function getImageFileName(card, imageUrl) {
  const url = new URL(imageUrl);
  const ext = path.extname(url.pathname) || ".png";
  const base = safeFilePart(card.cardNo || card.name || "one-piece-card");
  return `${base}__${sha1(imageUrl).slice(0, 10)}${ext}`;
}

function decodeEntities(input) {
  return String(input || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)));
}

function stripTags(input) {
  return decodeEntities(
    String(input || "")
      .replace(/<script[\s\S]*?<\/script>/gi, "\n")
      .replace(/<style[\s\S]*?<\/style>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(li|dl|dt|dd|div|p|section|article|tr|td|th|h1|h2|h3|h4|h5|h6)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  );
}

function htmlToLines(html) {
  return stripTags(html)
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter(Boolean)
    .filter((line) => line !== "button")
    .filter((line) => line !== "ボタン");
}

function countOccurrences(text, needle) {
  if (!needle) return 0;
  return String(text).split(needle).length - 1;
}

function scoreDecodedHtml(text) {
  const goodTerms = [
    "\u6aa2\u7d22\u7d50\u679c",
    "\u751f\u547d\u503c",
    "\u8cbb\u7528",
    "\u5c6c\u6027",
    "\u529b\u91cf\u503c",
    "\u53cd\u64ca\u503c",
    "\u984f\u8272",
    "\u64f4\u5f35\u8a18\u865f",
    "\u7279\u5f81",
    "\u7279\u5fb5",
    "\u6548\u679c",
    "\u89f8\u767c",
    "\u7372\u53d6\u65b9\u6cd5",
    "TEXT VIEW",
    "CARD VIEW",
  ];

  let score = 0;

  for (const term of goodTerms) {
    score += countOccurrences(text, term) * 20;
  }

  score += countOccurrences(text, "OP-") * 3;
  score += countOccurrences(text, "ST-") * 3;
  score += countOccurrences(text, "LEADER") * 2;
  score += countOccurrences(text, "CHARACTER") * 2;
  score += countOccurrences(text, "EVENT") * 2;
  score -= countOccurrences(text, "\uFFFD") * 50;

  return score;
}

function decodeBufferSmart(buffer) {
  const candidates = [];

  function tryDecode(label) {
    try {
      const decoded = new TextDecoder(label).decode(buffer);
      candidates.push({
        label,
        text: decoded,
        score: scoreDecodedHtml(decoded),
      });
    } catch {}
  }

  tryDecode("utf-8");
  tryDecode("big5");

  candidates.sort((a, b) => b.score - a.score);

  return candidates[0] || {
    label: "utf-8",
    text: buffer.toString("utf8"),
    score: 0,
  };
}

async function fetchDecodedHtml(context, url) {
  const response = await context.request.get(url, {
    timeout: NAV_TIMEOUT_MS,
  });

  if (!response.ok()) {
    throw new Error(`HTTP ${response.status()} ${response.statusText()}`);
  }

  const buffer = await response.body();
  const decoded = decodeBufferSmart(buffer);

  return {
    html: decoded.text,
    encoding: decoded.label,
    score: decoded.score,
  };
}

function absoluteUrl(value, baseUrl) {
  if (!value) return "";

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

function extractImageUrlsFromHtml(html, baseUrl) {
  const urls = [];
  const attrs = [
    "src",
    "data-src",
    "data-original",
    "data-lazy",
    "data-url",
  ];

  for (const attr of attrs) {
    const re = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "gi");

    for (const match of html.matchAll(re)) {
      const url = absoluteUrl(decodeEntities(match[1]), baseUrl);

      if (
        url &&
        /\/images\/cardlist\/card\//i.test(url) &&
        !/dummy|blank|logo/i.test(url)
      ) {
        urls.push(url);
      }
    }
  }

  const unique = [];
  for (const url of urls) {
    if (!unique.includes(url)) {
      unique.push(url);
    }
  }

  return unique;
}

function cleanSeriesLabel(label) {
  return stripTags(label)
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function getBaseCardlistUrl(startUrl) {
  const url = new URL(startUrl);
  return `${url.origin}/cardlist/`;
}

function parseSeriesListFromHtml(html, baseUrl) {
  const map = new Map();

  function addSeries(value, label) {
    const v = String(value || "").trim();
    if (!/^\d{5,9}$/.test(v)) return;

    if (!map.has(v)) {
      map.set(v, {
        value: v,
        label: cleanSeriesLabel(label) || `series-${v}`,
        url: `${baseUrl}?series=${v}`,
      });
    }
  }

  for (const match of html.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/gi)) {
    const attrs = match[1] || "";
    const label = match[2] || "";
    const valueMatch = attrs.match(/\bvalue\s*=\s*["']?([^"'\s>]+)/i);
    if (valueMatch) {
      addSeries(decodeEntities(valueMatch[1]), label);
    }
  }

  for (const match of html.matchAll(/href\s*=\s*["']([^"']*?[?&]series=(\d{5,9})[^"']*)["']/gi)) {
    addSeries(match[2], match[1]);
  }

  for (const match of html.matchAll(/[?&]series=(\d{5,9})/g)) {
    addSeries(match[1], `series-${match[1]}`);
  }

  for (const match of html.matchAll(/["']series["']\s*:\s*["']?(\d{5,9})/g)) {
    addSeries(match[1], `series-${match[1]}`);
  }

  return [...map.values()];
}

async function getSeriesList(context, startUrl) {
  const baseUrl = getBaseCardlistUrl(startUrl);
  const decoded = await fetchDecodedHtml(context, baseUrl);
  const seriesList = parseSeriesListFromHtml(decoded.html, baseUrl);

  console.log(
    `[INFO] series list decoded as ${decoded.encoding}, score=${decoded.score}`
  );

  return seriesList;
}

function isHeaderLine(line) {
  const text = normalizeLine(line);

  return /^([A-Z]{1,5}\d{0,3}-\d{3}[a-zA-Z0-9]*)\s*[|｜]\s*([^|｜]+)\s*[|｜]\s*(.+)$/.test(
    text
  );
}

function parseHeader(line) {
  const text = normalizeLine(line);

  const match = text.match(
    /^([A-Z]{1,5}\d{0,3}-\d{3}[a-zA-Z0-9]*)\s*[|｜]\s*([^|｜]+)\s*[|｜]\s*(.+)$/
  );

  if (!match) return null;

  return {
    cardNo: normalizeText(match[1]),
    rarity: normalizeText(match[2]),
    cardType: normalizeText(match[3]),
  };
}

const LABEL_GROUPS = {
  cost: ["\u8cbb\u7528", "Cost"],
  life: ["\u751f\u547d\u503c", "Life"],
  attribute: ["\u5c6c\u6027", "Attribute"],
  power: ["\u529b\u91cf\u503c", "Power"],
  counter: ["\u53cd\u64ca\u503c", "Counter"],
  color: ["\u984f\u8272", "Color"],
  block: ["\u64f4\u5f35\u8a18\u865f", "Block", "Block icon"],
  feature: ["\u7279\u5f81", "\u7279\u5fb5", "Type"],
  effect: ["\u6548\u679c", "Effect"],
  trigger: ["\u89f8\u767c", "Trigger"],
  cardSet: [
    "\u7372\u53d6\u65b9\u6cd5",
    "\u7372\u5f97\u65b9\u6cd5",
    "\u6536\u9304\u5546\u54c1",
    "Card Set(s)",
  ],
};

const ALL_LABELS = Object.values(LABEL_GROUPS)
  .flat()
  .map((item) => normalizeLine(item));

function isLabel(line) {
  return ALL_LABELS.includes(normalizeLine(line));
}

function isNoise(line) {
  const text = normalizeLine(line);

  if (!text) return true;
  if (/^button$/i.test(text)) return true;
  if (text === "TEXT VIEW") return true;
  if (text === "CARD VIEW") return true;
  if (text === "PREV") return true;
  if (text === "NEXT") return true;
  if (text === "\u4e0a\u4e00\u9801") return true;
  if (text === "\u4e0b\u4e00\u9801") return true;

  return false;
}

function cleanFieldValue(value) {
  return normalizeText(value)
    .replace(/^icon\s*/i, "")
    .replace(/\nicon\n/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function readSection(segment, labels) {
  const wanted = labels.map((item) => normalizeLine(item));

  for (let i = 0; i < segment.length; i += 1) {
    const current = normalizeLine(segment[i]);

    let matchedLabel = "";

    for (const label of wanted) {
      if (current === label) {
        matchedLabel = label;
        break;
      }

      if (current.startsWith(`${label}:`)) {
        matchedLabel = label;
        break;
      }
    }

    if (!matchedLabel) continue;

    const values = [];

    if (current.startsWith(`${matchedLabel}:`)) {
      const inlineValue = current.slice(matchedLabel.length + 1).trim();
      if (inlineValue) values.push(inlineValue);
    }

    for (let j = i + 1; j < segment.length; j += 1) {
      const next = normalizeLine(segment[j]);

      if (!next) continue;
      if (isLabel(next)) break;
      if (isHeaderLine(next)) break;
      if (next === "CARD VIEW") break;
      if (next === "TEXT VIEW") break;
      if (/^button$/i.test(next)) continue;

      values.push(next);
    }

    return cleanFieldValue(values.join("\n"));
  }

  return "";
}

function extractProductCode(cardSet) {
  const tcMatches = [...String(cardSet || "").matchAll(/〖([^〗]+)〗/g)];
  if (tcMatches.length) return tcMatches[tcMatches.length - 1][1];

  const jpMatches = [...String(cardSet || "").matchAll(/【([^】]+)】/g)];
  if (jpMatches.length) return jpMatches[jpMatches.length - 1][1];

  const enMatches = [...String(cardSet || "").matchAll(/\[([^\]]+)\]/g)];
  if (enMatches.length) return enMatches[enMatches.length - 1][1];

  const codeMatch = String(cardSet || "").match(/\b(OP|ST|EB|PRB|P)-?\d{1,3}\b/i);
  if (codeMatch) return codeMatch[0];

  return "";
}

function pickImageForCard(cardNo, imageUrls, perCardImageIndex, globalImageIndexRef) {
  const key = String(cardNo || "").toLowerCase();

  const matching = imageUrls.filter((url) =>
    url.toLowerCase().includes(key)
  );

  if (matching.length) {
    const used = perCardImageIndex.get(key) || 0;
    perCardImageIndex.set(key, used + 1);

    return matching[used] || matching[matching.length - 1];
  }

  const fallback = imageUrls[globalImageIndexRef.value] || "";
  globalImageIndexRef.value += 1;

  return fallback;
}

function parseCardsFromLines(lines, imageUrls, meta) {
  const cards = [];
  const perCardImageIndex = new Map();
  const globalImageIndexRef = { value: 0 };

  for (let i = 0; i < lines.length; i += 1) {
    if (!isHeaderLine(lines[i])) continue;

    const header = parseHeader(lines[i]);
    if (!header) continue;

    let end = lines.length;

    for (let j = i + 1; j < lines.length; j += 1) {
      if (isHeaderLine(lines[j])) {
        end = j;
        break;
      }
    }

    const segment = lines.slice(i + 1, end);

    let name = "";

    for (const line of segment) {
      const text = normalizeLine(line);

      if (isNoise(text)) continue;
      if (isLabel(text)) break;
      if (isHeaderLine(text)) break;

      name = text;
      break;
    }

    if (!name) continue;

    const cardSet =
      readSection(segment, LABEL_GROUPS.cardSet) ||
      normalizeText(meta.seriesName);

    const imageUrl = pickImageForCard(
      header.cardNo,
      imageUrls,
      perCardImageIndex,
      globalImageIndexRef
    );

    cards.push({
      cardNo: header.cardNo,
      rarity: header.rarity,
      cardType: header.cardType,
      name,
      cost: readSection(segment, LABEL_GROUPS.cost),
      life: readSection(segment, LABEL_GROUPS.life),
      attribute: readSection(segment, LABEL_GROUPS.attribute),
      power: readSection(segment, LABEL_GROUPS.power),
      counter: readSection(segment, LABEL_GROUPS.counter),
      color: readSection(segment, LABEL_GROUPS.color),
      block: readSection(segment, LABEL_GROUPS.block),
      feature: readSection(segment, LABEL_GROUPS.feature),
      effect: readSection(segment, LABEL_GROUPS.effect),
      trigger: readSection(segment, LABEL_GROUPS.trigger),
      cardSet,
      imageUrl,
      imageFile: "",
      seriesId: meta.seriesId || "",
      seriesName: normalizeText(meta.seriesName || ""),
      sourceUrl: meta.sourceUrl || "",
    });
  }

  return cards;
}

function buildProducts(cards) {
  const map = new Map();

  for (const card of cards) {
    const productName =
      normalizeText(card.cardSet) ||
      normalizeText(card.seriesName) ||
      "Unknown";

    if (!productName || productName === "Unknown") continue;

    const productCode = extractProductCode(productName);
    const key = productCode || productName;

    if (!map.has(key)) {
      map.set(key, {
        productCode,
        productName,
        cardCount: 0,
        colors: {},
        rarities: {},
        cardTypes: {},
        seriesIds: new Set(),
      });
    }

    const product = map.get(key);
    product.cardCount += 1;

    if (card.color) {
      product.colors[card.color] = (product.colors[card.color] || 0) + 1;
    }

    if (card.rarity) {
      product.rarities[card.rarity] =
        (product.rarities[card.rarity] || 0) + 1;
    }

    if (card.cardType) {
      product.cardTypes[card.cardType] =
        (product.cardTypes[card.cardType] || 0) + 1;
    }

    if (card.seriesId) {
      product.seriesIds.add(card.seriesId);
    }
  }

  return [...map.values()]
    .map((product) => ({
      ...product,
      seriesIds: [...product.seriesIds],
    }))
    .sort((a, b) =>
      String(a.productCode || a.productName).localeCompare(
        String(b.productCode || b.productName),
        "zh-Hant"
      )
    );
}

async function saveDebugFiles(html, lines, debug) {
  await ensureDir(OUT_DIR);

  await fs.writeFile(DEBUG_HTML, html, "utf8");

  const debugText = [
    "==== DEBUG SUMMARY ====",
    JSON.stringify(debug, null, 2),
    "",
    "==== FIRST 300 LINES ====",
    lines.slice(0, 300).join("\n"),
  ].join("\n");

  await fs.writeFile(DEBUG_TEXT, debugText, "utf8");
}

async function extractCardsFromUrl(context, series) {
  const decoded = await fetchDecodedHtml(context, series.url);
  const html = decoded.html;
  const lines = htmlToLines(html);
  const imageUrls = extractImageUrlsFromHtml(html, series.url);

  const cards = parseCardsFromLines(lines, imageUrls, {
    seriesId: series.value,
    seriesName: series.label,
    sourceUrl: series.url,
  });

  const debug = {
    url: series.url,
    encoding: decoded.encoding,
    score: decoded.score,
    lineCount: lines.length,
    imageCount: imageUrls.length,
    cardCount: cards.length,
    sampleLines: lines.slice(0, 120),
  };

  return {
    cards,
    debug,
    html,
    lines,
  };
}

async function gotoForCookies(page, url) {
  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    await page.waitForTimeout(1000);
  } catch {
    // This is only to warm cookies/session. The real parser uses request bytes.
  }
}

async function downloadImageWithRetry(context, imageUrl, outputPath, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await context.request.get(imageUrl, {
        timeout: IMAGE_TIMEOUT_MS,
      });

      if (!response.ok()) {
        throw new Error(`HTTP ${response.status()} ${response.statusText()}`);
      }

      const body = await response.body();
      await fs.writeFile(outputPath, body);

      return true;
    } catch (error) {
      lastError = error;
      console.warn(`[WARN] image failed attempt ${attempt}: ${imageUrl}`);
      await sleep(800 * attempt);
    }
  }

  throw lastError;
}

async function downloadImages(context, cards) {
  await ensureDir(IMAGE_DIR);

  const imageMap = new Map();

  for (const card of cards) {
    if (!card.imageUrl) continue;

    const imageFile = getImageFileName(card, card.imageUrl);
    card.imageFile = `images/${imageFile}`;

    if (!imageMap.has(card.imageUrl)) {
      imageMap.set(card.imageUrl, {
        imageUrl: card.imageUrl,
        imageFile,
        cardNo: card.cardNo,
        name: card.name,
      });
    }
  }

  const images = [...imageMap.values()];

  console.log(`[INFO] unique images: ${images.length}`);

  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const image of images) {
    done += 1;

    const outputPath = path.join(IMAGE_DIR, image.imageFile);

    if (await exists(outputPath)) {
      skipped += 1;

      if (done % 50 === 0) {
        console.log(`[INFO] images ${done}/${images.length}, skipped existing`);
      }

      continue;
    }

    try {
      await downloadImageWithRetry(context, image.imageUrl, outputPath);

      if (done % 25 === 0) {
        console.log(`[INFO] images ${done}/${images.length}`);
      }
    } catch (error) {
      failed += 1;

      await appendJsonl(FAILED_IMAGES, {
        ...image,
        error: String(error && error.message ? error.message : error),
      });
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `[INFO] image download done. total=${images.length}, skipped=${skipped}, failed=${failed}`
  );
}

async function main() {
  if (RESET) {
    console.log(`[INFO] reset output dir: ${OUT_DIR}`);
    await fs.rm(OUT_DIR, {
      recursive: true,
      force: true,
    });
  }

  await ensureDir(OUT_DIR);
  await ensureDir(IMAGE_DIR);

  console.log("[INFO] ONE PIECE TC downloader started");
  console.log(`[INFO] start url: ${START_URL}`);
  console.log(`[INFO] mode: ${ALL_SERIES ? "all series" : "single url"}`);
  console.log(`[INFO] download images: ${DOWNLOAD_IMAGES ? "yes" : "no"}`);
  console.log(`[INFO] output: ${OUT_DIR}`);

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    viewport: {
      width: 1440,
      height: 1600,
    },
    locale: "zh-TW",
  });

  const page = await context.newPage();

  try {
    await gotoForCookies(page, START_URL);

    let seriesList;

    if (ALL_SERIES) {
      seriesList = await getSeriesList(context, START_URL);

      if (!seriesList.length) {
        throw new Error(
          "No series options found. The official page structure may have changed."
        );
      }

      console.log(`[INFO] found series count: ${seriesList.length}`);
    } else {
      const url = new URL(START_URL);
      const seriesId = url.searchParams.get("series") || "";

      seriesList = [
        {
          value: seriesId,
          label: seriesId ? `series-${seriesId}` : "custom-url",
          url: START_URL,
        },
      ];
    }

    const partialCards = await readJson(PARTIAL_JSON, []);
    const cardMap = new Map();

    for (const card of partialCards) {
      cardMap.set(makeCardKey(card), card);
    }

    for (let idx = 0; idx < seriesList.length; idx += 1) {
      const series = seriesList[idx];

      console.log(
        `[INFO] series ${idx + 1}/${seriesList.length}: ${series.label}`
      );

      try {
        const extracted = await extractCardsFromUrl(context, series);
        const cards = extracted.cards;

        console.log(
          `[INFO] decoded=${extracted.debug.encoding}, score=${extracted.debug.score}, lines=${extracted.debug.lineCount}, images=${extracted.debug.imageCount}`
        );
        console.log(`[INFO] extracted cards before global dedupe: ${cards.length}`);

        if (!cards.length) {
          await saveDebugFiles(extracted.html, extracted.lines, extracted.debug);

          await appendJsonl(FAILED_PAGES, {
            series,
            sourceUrl: series.url,
            error: "No cards extracted",
            debug: extracted.debug,
          });

          console.log("[WARN] no cards extracted.");
          console.log(`[WARN] debug html: ${DEBUG_HTML}`);
          console.log(`[WARN] debug text: ${DEBUG_TEXT}`);
        }

        for (const card of cards) {
          const key = makeCardKey(card);

          if (!cardMap.has(key)) {
            cardMap.set(key, card);
          }
        }

        await writeJson(PARTIAL_JSON, [...cardMap.values()]);

        console.log(`[INFO] total cards after dedupe: ${cardMap.size}`);

        await sleep(DELAY_MS);
      } catch (error) {
        console.warn(`[WARN] failed series: ${series.label}`);

        await appendJsonl(FAILED_PAGES, {
          series,
          sourceUrl: series.url,
          error: String(error && error.message ? error.message : error),
        });
      }
    }

    const cards = [...cardMap.values()].sort((a, b) => {
      const ax = `${a.cardNo}|${a.rarity}|${a.name}|${a.cardSet}|${a.imageUrl}`;
      const bx = `${b.cardNo}|${b.rarity}|${b.name}|${b.cardSet}|${b.imageUrl}`;

      return ax.localeCompare(bx, "zh-Hant");
    });

    if (DOWNLOAD_IMAGES) {
      await downloadImages(context, cards);
    }

    const products = buildProducts(cards);

    await writeJson(RAW_JSON, cards);
    await writeJson(PRODUCTS_JSON, products);
    await fs.writeFile(RAW_CSV, toCsv(cards), "utf8");

    console.log("[INFO] done");
    console.log(`[INFO] cards: ${cards.length}`);
    console.log(
      `[INFO] cards with imageUrl: ${cards.filter((card) => card.imageUrl).length}`
    );
    console.log(`[INFO] products: ${products.length}`);
    console.log(`[INFO] JSON: ${RAW_JSON}`);
    console.log(`[INFO] CSV: ${RAW_CSV}`);
    console.log(`[INFO] products: ${PRODUCTS_JSON}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("[FATAL]", error);
  process.exit(1);
});