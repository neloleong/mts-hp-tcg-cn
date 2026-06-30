/* eslint-disable no-console */

const { chromium } = require("playwright");
const fs = require("fs/promises");
const path = require("path");

const LANG = process.env.UA_LANG || "jp";

const OUT_DIR = path.join(process.cwd(), "downloads", `union-arena-${LANG}`);
const DEFAULT_INPUT = path.join(OUT_DIR, "cards.json");
const DEFAULT_OUTPUT = path.join(OUT_DIR, "cards.enriched.json");
const DEFAULT_PARTIAL = path.join(OUT_DIR, "cards.enriched.partial.json");

const INPUT_PATH = process.env.UA_INPUT
  ? path.resolve(process.env.UA_INPUT)
  : DEFAULT_INPUT;

const OUTPUT_PATH = process.env.UA_OUTPUT
  ? path.resolve(process.env.UA_OUTPUT)
  : DEFAULT_OUTPUT;

const PARTIAL_PATH = process.env.UA_PARTIAL
  ? path.resolve(process.env.UA_PARTIAL)
  : DEFAULT_PARTIAL;

const HEADLESS = process.env.UA_HEADLESS !== "0";
const DELAY_MS = Number(process.env.UA_DELAY_MS || 700);
const PAGE_TIMEOUT_MS = Number(process.env.UA_DETAIL_TIMEOUT_MS || 60000);
const START_INDEX = Number(process.env.UA_START_INDEX || 1);
const END_INDEX = Number(process.env.UA_END_INDEX || 0);
const MAX_CARDS = Number(process.env.UA_MAX_CARDS || 0);
const FORCE = process.env.UA_FORCE === "1";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanOneLine(value) {
  return cleanText(value).replace(/\s+/g, " ").trim();
}

function cardKey(card) {
  return [
    card.lang || LANG,
    card.product_id || "",
    card.card_no || "",
    card.image_url || "",
    card.detail_url || "",
  ].join("::");
}

async function readJson(filePath, fallback = null) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function normalizeLabel(value) {
  return cleanOneLine(value)
    .replace(/[：:]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function isLikelyLabel(value) {
  const text = normalizeLabel(value);

  const labels = [
    "必要エナジー",
    "必要エネルギー",
    "消費ap",
    "カード種類",
    "bp",
    "特徴",
    "発生エナジー",
    "発生エネルギー",
    "効果",
    "トリガー",
    "urlをコピー",
    "収録商品",
    "カードリスト",
    "商品情報",
    "レアリティ",
    "商品名",
    "カード番号",
  ].map(normalizeLabel);

  return labels.some((label) => text === label || text.includes(label));
}

function getPairValue(pairs, labelCandidates) {
  const normalizedLabels = labelCandidates.map(normalizeLabel);

  for (const pair of pairs || []) {
    const label = normalizeLabel(pair.label);

    if (!label) continue;

    if (
      normalizedLabels.some(
        (candidate) => label === candidate || label.includes(candidate)
      )
    ) {
      return cleanOneLine(pair.value);
    }
  }

  return "";
}

function getNextLineValue(lines, labelCandidates) {
  const normalizedLabels = labelCandidates.map(normalizeLabel);

  for (let i = 0; i < lines.length; i += 1) {
    const current = normalizeLabel(lines[i]);

    if (
      normalizedLabels.some(
        (candidate) => current === candidate || current.includes(candidate)
      )
    ) {
      const sameLine = cleanOneLine(
        lines[i].replace(/^[^：:]+[：:]/, "").trim()
      );

      if (
        sameLine &&
        !normalizedLabels.includes(normalizeLabel(sameLine)) &&
        !isLikelyLabel(sameLine)
      ) {
        return sameLine;
      }

      for (let j = i + 1; j < Math.min(i + 5, lines.length); j += 1) {
        const next = cleanOneLine(lines[j]);

        if (!next) continue;
        if (isLikelyLabel(next)) continue;

        return next;
      }
    }
  }

  return "";
}

function extractBlock(lines, startLabels, stopLabels) {
  const normalizedStart = startLabels.map(normalizeLabel);
  const normalizedStop = stopLabels.map(normalizeLabel);

  let start = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const current = normalizeLabel(lines[i]);

    if (
      normalizedStart.some(
        (candidate) => current === candidate || current.includes(candidate)
      )
    ) {
      start = i + 1;
      break;
    }
  }

  if (start < 0) return "";

  const collected = [];

  for (let i = start; i < lines.length; i += 1) {
    const current = normalizeLabel(lines[i]);

    if (
      normalizedStop.some(
        (candidate) => current === candidate || current.includes(candidate)
      )
    ) {
      break;
    }

    const line = cleanOneLine(lines[i]);

    if (line) collected.push(line);
  }

  return cleanText(collected.join("\n"));
}

function findColor(text) {
  const source = cleanText(text);

  const colorPatterns = [
    ["赤", /\bRED\b|赤|レッド/i],
    ["青", /\bBLUE\b|青|ブルー/i],
    ["緑", /\bGREEN\b|緑|グリーン/i],
    ["黄", /\bYELLOW\b|黄|黄色|イエロー/i],
    ["紫", /\bPURPLE\b|紫|パープル/i],
  ];

  for (const [color, pattern] of colorPatterns) {
    if (pattern.test(source)) return color;
  }

  return "";
}

function findColorFromAssets(assets) {
  const joined = (assets || [])
    .map((asset) =>
      [
        asset.alt,
        asset.title,
        asset.ariaLabel,
        asset.src,
        asset.className,
        asset.id,
        asset.parentText,
      ].join(" ")
    )
    .join(" ");

  return findColor(joined);
}

function findCardType(text) {
  const source = cleanText(text);

  const types = [
    "キャラクター",
    "イベント",
    "フィールド",
    "アクション",
    "APカード",
  ];

  return types.find((type) => source.includes(type)) || "";
}

function findFirstNumber(value) {
  const match = cleanOneLine(value).match(/-?\d+/);
  return match ? match[0] : "";
}

function getCardNoIndex(lines) {
  return lines.findIndex((line) =>
    /^(?:UA|EX|PC)\d{2}[A-Z]{0,4}\/[A-Z0-9-]+-(?:\d{3}|AP\d{2})$/i.test(line)
  );
}

function getRarityFromLines(lines, cardNoIndex) {
  if (cardNoIndex < 0) return "";

  const candidate = cleanOneLine(lines[cardNoIndex + 1] || "");

  if (
    /^(?:C|U|R|SR|SR\*|SR\*\*|SR\*\*\*|SEC|AP|PR|SP|★★★|★★|★)$/i.test(
      candidate
    )
  ) {
    return candidate;
  }

  return "";
}

function getNameFromLines(lines, cardNoIndex) {
  if (cardNoIndex >= 2) {
    return {
      name_jp: cleanOneLine(lines[cardNoIndex - 2]),
      name_kana_jp: cleanOneLine(lines[cardNoIndex - 1]),
    };
  }

  if (cardNoIndex >= 1) {
    return {
      name_jp: cleanOneLine(lines[0]),
      name_kana_jp: cleanOneLine(lines[cardNoIndex - 1]),
    };
  }

  return {
    name_jp: cleanOneLine(lines[0] || ""),
    name_kana_jp: "",
  };
}

function inferNumberFromAssetNames(assets, keywords) {
  const keywordRegex = new RegExp(keywords.join("|"), "i");

  for (const asset of assets || []) {
    const source = [
      asset.alt,
      asset.title,
      asset.ariaLabel,
      asset.src,
      asset.className,
      asset.id,
      asset.parentText,
    ].join(" ");

    if (!keywordRegex.test(source)) continue;

    const patterns = [
      /(?:cost|energy|required|need|ap|action|bp)[-_ ]?(\d+)/i,
      /(\d+)[-_ ]?(?:cost|energy|required|need|ap|action|bp)/i,
      /\/(\d+)\.(?:png|webp|jpg|gif)/i,
      /[_-](\d+)[_.-]/i,
    ];

    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match) return match[1];
    }
  }

  return "";
}

function parseDetailPayload(payload) {
  const text = cleanText(payload.text || "");
  const lines = text
    .split("\n")
    .map(cleanOneLine)
    .filter(Boolean);

  const pairs = payload.pairs || [];
  const assets = payload.assets || [];

  const cardNoIndex = getCardNoIndex(lines);
  const { name_jp, name_kana_jp } = getNameFromLines(lines, cardNoIndex);
  const rarityFromLine = getRarityFromLines(lines, cardNoIndex);

  const pairCost = getPairValue(pairs, [
    "必要エナジー",
    "必要エネルギー",
    "必要EN",
    "コスト",
    "Cost",
  ]);

  const pairAp = getPairValue(pairs, [
    "消費AP",
    "AP",
    "アクションポイント",
    "Action",
  ]);

  const pairBp = getPairValue(pairs, ["BP", "バトルポイント"]);

  const pairRarity = getPairValue(pairs, [
    "レアリティ",
    "Rarity",
    "rare",
  ]);

  const pairType = getPairValue(pairs, [
    "カード種類",
    "カード種別",
    "種類",
    "Type",
  ]);

  const pairFeature = getPairValue(pairs, [
    "特徴",
    "特徵",
    "Feature",
    "Attribute",
  ]);

  const pairEffect = getPairValue(pairs, [
    "効果",
    "テキスト",
    "カードテキスト",
    "Effect",
  ]);

  const pairTrigger = getPairValue(pairs, [
    "トリガー",
    "Trigger",
    "トリガー効果",
  ]);

  const pairColor = getPairValue(pairs, ["色", "カラー", "Color"]);

  const cost =
    findFirstNumber(pairCost) ||
    findFirstNumber(getNextLineValue(lines, ["必要エナジー", "コスト", "Cost"])) ||
    findFirstNumber(
      (text.match(/(?:必要エナジー|コスト|Cost)\s*[:：]?\s*(\d+)/i) || [])[1]
    ) ||
    inferNumberFromAssetNames(assets, ["cost", "energy", "need", "required"]);

  const ap =
    findFirstNumber(pairAp) ||
    findFirstNumber(getNextLineValue(lines, ["消費AP", "AP", "Action"])) ||
    findFirstNumber(
      (text.match(/(?:消費AP|AP|ACTION)\s*[:：]?\s*(\d+)/i) || [])[1]
    ) ||
    inferNumberFromAssetNames(assets, ["ap", "action"]);

  const bp =
    findFirstNumber(pairBp) ||
    findFirstNumber(getNextLineValue(lines, ["BP"])) ||
    findFirstNumber((text.match(/BP\s*[:：]?\s*(\d+)/i) || [])[1]) ||
    findFirstNumber((text.match(/(\d+)\s*BP/i) || [])[1]) ||
    inferNumberFromAssetNames(assets, ["bp", "power"]);

  const generatedEnergy =
    findFirstNumber(getPairValue(pairs, ["発生エナジー", "発生エネルギー"])) ||
    findFirstNumber(getNextLineValue(lines, ["発生エナジー", "発生エネルギー"])) ||
    inferNumberFromAssetNames(assets, ["generate", "generated", "energy"]);

  const effectFromBlock = extractBlock(
    lines,
    ["効果", "カードテキスト", "テキスト"],
    [
      "トリガー",
      "URLをコピー",
      "収録商品",
      "レアリティ",
      "商品名",
      "カード番号",
    ]
  );

  const triggerFromBlock = extractBlock(
    lines,
    ["トリガー", "Trigger"],
    [
      "URLをコピー",
      "収録商品",
      "レアリティ",
      "商品名",
      "カード番号",
    ]
  );

  return {
    detail_text: text,
    detail_lines: lines,
    detail_pairs: pairs,

    name_jp,
    name_kana_jp,

    card_type_jp: pairType || findCardType(text),
    color_jp: pairColor || findColor(text) || findColorFromAssets(assets),

    rarity: pairRarity || rarityFromLine,

    cost,
    ap,
    bp,
    generated_energy: generatedEnergy,

    feature_jp: pairFeature,
    effect_jp: pairEffect || effectFromBlock,
    trigger_jp: pairTrigger || triggerFromBlock,

    detail_image_url: payload.imageUrl || "",
    detail_title: payload.title || "",
    detail_assets: assets,
  };
}

async function extractDetailFromPage(page) {
  return page.evaluate(() => {
    function clean(value) {
      return String(value || "")
        .replace(/\u00a0/g, " ")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    function cleanOneLine(value) {
      return clean(value).replace(/\s+/g, " ").trim();
    }

    function absUrl(value) {
      if (!value) return "";

      try {
        return new URL(value, location.href).href;
      } catch {
        return "";
      }
    }

    const text = clean(document.body ? document.body.innerText : "");
    const title =
      cleanOneLine(document.querySelector("h1")?.innerText) ||
      cleanOneLine(document.querySelector("h2")?.innerText) ||
      cleanOneLine(document.title);

    const pairs = [];

    Array.from(document.querySelectorAll("tr")).forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll("th,td")).map((cell) =>
        cleanOneLine(cell.innerText)
      );

      if (cells.length >= 2 && cells[0] && cells.slice(1).join(" ")) {
        pairs.push({
          label: cells[0],
          value: cells.slice(1).join(" "),
        });
      }
    });

    Array.from(document.querySelectorAll("dl")).forEach((dl) => {
      const dts = Array.from(dl.querySelectorAll("dt"));
      const dds = Array.from(dl.querySelectorAll("dd"));

      dts.forEach((dt, index) => {
        const label = cleanOneLine(dt.innerText);
        const value = cleanOneLine(dds[index]?.innerText);

        if (label && value) {
          pairs.push({ label, value });
        }
      });
    });

    Array.from(
      document.querySelectorAll("li, .detailData, .cardData, .card_data, .data")
    ).forEach((el) => {
      const line = cleanOneLine(el.innerText);
      const match = line.match(/^(.{1,16}?)[：:]\s*(.+)$/);

      if (match) {
        pairs.push({
          label: match[1],
          value: match[2],
        });
      }
    });

    const assets = [];

    const assetElements = new Set([
      ...document.querySelectorAll("img"),
      ...document.querySelectorAll("svg"),
      ...document.querySelectorAll("[class]"),
      ...document.querySelectorAll("[data-src]"),
      ...document.querySelectorAll("[data-original]"),
      ...document.querySelectorAll("[data-lazy]"),
      ...document.querySelectorAll("[data-color]"),
      ...document.querySelectorAll("[data-cost]"),
      ...document.querySelectorAll("[data-ap]"),
      ...document.querySelectorAll("[data-bp]"),
      ...document.querySelectorAll("[data-energy]"),
    ]);

    Array.from(assetElements).forEach((el) => {
      const rect = el.getBoundingClientRect();

      const src =
        el.getAttribute("data-src") ||
        el.getAttribute("data-original") ||
        el.getAttribute("data-lazy") ||
        el.getAttribute("src") ||
        "";

      const asset = {
        tagName: el.tagName,
        alt: cleanOneLine(el.getAttribute("alt") || ""),
        title: cleanOneLine(el.getAttribute("title") || ""),
        ariaLabel: cleanOneLine(el.getAttribute("aria-label") || ""),
        className: cleanOneLine(el.getAttribute("class") || ""),
        id: cleanOneLine(el.getAttribute("id") || ""),
        src: absUrl(src),
        parentText: cleanOneLine(el.parentElement?.innerText || ""),
        width: Math.round(rect.width || 0),
        height: Math.round(rect.height || 0),
      };

      const joined = [
        asset.alt,
        asset.title,
        asset.ariaLabel,
        asset.className,
        asset.id,
        asset.src,
        asset.parentText,
      ].join(" ");

      if (
        /energy|cost|ap|action|bp|red|blue|green|yellow|purple|赤|青|緑|黄|紫|レッド|ブルー|グリーン|イエロー|パープル/i.test(
          joined
        )
      ) {
        assets.push(asset);
      }
    });

    const images = Array.from(document.querySelectorAll("img"))
      .map((img) => {
        return (
          img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          img.getAttribute("data-lazy") ||
          img.currentSrc ||
          img.src ||
          ""
        );
      })
      .map(absUrl)
      .filter((url) => url && !url.includes("dummy.gif"));

    const imageUrl =
      images.find((url) => /cardlist\/card|\/card\//i.test(url)) ||
      images[0] ||
      "";

    return {
      title,
      text,
      pairs,
      imageUrl,
      assets,
      href: location.href,
    };
  });
}

async function main() {
  const cards = await readJson(INPUT_PATH, []);

  if (!Array.isArray(cards) || cards.length === 0) {
    console.log(`找不到卡牌資料：${INPUT_PATH}`);
    process.exit(1);
  }

  const existing = await readJson(PARTIAL_PATH, []);
  const existingMap = new Map();

  if (Array.isArray(existing)) {
    existing.forEach((card) => {
      existingMap.set(cardKey(card), card);
    });
  }

  console.log(`Input cards       : ${cards.length}`);
  console.log(`Existing enriched : ${existingMap.size}`);
  console.log(`Input             : ${INPUT_PATH}`);
  console.log(`Partial           : ${PARTIAL_PATH}`);
  console.log(`Output            : ${OUTPUT_PATH}`);

  const browser = await chromium.launch({
    headless: HEADLESS,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome Safari",
  });

  const page = await context.newPage();

  const start = Math.max(START_INDEX - 1, 0);
  const endByRange =
    END_INDEX > 0 ? Math.min(END_INDEX, cards.length) : cards.length;
  const end =
    MAX_CARDS > 0 ? Math.min(start + MAX_CARDS, endByRange) : endByRange;

  const enriched = Array.isArray(existing) ? [...existing] : [];
  const writtenKeys = new Set(enriched.map(cardKey));

  try {
    for (let i = start; i < end; i += 1) {
      const card = cards[i];
      const key = cardKey(card);

      if (!FORCE && existingMap.has(key)) {
        console.log(`[${i + 1}/${cards.length}] skip existing ${card.card_no}`);
        continue;
      }

      if (!card.detail_url) {
        console.log(`[${i + 1}/${cards.length}] no detail_url ${card.card_no}`);

        const merged = {
          ...card,
          enriched_status: "no_detail_url",
          enriched_at: new Date().toISOString(),
        };

        if (!writtenKeys.has(key)) {
          enriched.push(merged);
          writtenKeys.add(key);
        }

        continue;
      }

      console.log(`[${i + 1}/${cards.length}] ${card.card_no} ${card.card_name}`);

      let merged;

      try {
        await page.goto(card.detail_url, {
          waitUntil: "domcontentloaded",
          timeout: PAGE_TIMEOUT_MS,
        });

        await page.waitForTimeout(500);

        const payload = await extractDetailFromPage(page);
        const parsed = parseDetailPayload(payload);

        merged = {
          ...card,
          ...parsed,
          enriched_status: "ok",
          enriched_at: new Date().toISOString(),
        };
      } catch (error) {
        console.warn(`  detail failed: ${error.message}`);

        merged = {
          ...card,
          enriched_status: "failed",
          enriched_error: error.message,
          enriched_at: new Date().toISOString(),
        };
      }

      if (FORCE && existingMap.has(key)) {
        const targetIndex = enriched.findIndex((item) => cardKey(item) === key);

        if (targetIndex >= 0) {
          enriched[targetIndex] = merged;
        }
      } else if (!writtenKeys.has(key)) {
        enriched.push(merged);
        writtenKeys.add(key);
      }

      if ((i + 1) % 20 === 0) {
        await writeJson(PARTIAL_PATH, enriched);
        console.log(`  saved partial: ${enriched.length}`);
      }

      await sleep(DELAY_MS);
    }

    await writeJson(PARTIAL_PATH, enriched);
    await writeJson(OUTPUT_PATH, enriched);

    const ok = enriched.filter((card) => card.enriched_status === "ok").length;
    const withEffect = enriched.filter((card) => card.effect_jp).length;
    const withTrigger = enriched.filter((card) => card.trigger_jp).length;
    const withStats = enriched.filter(
      (card) => card.cost || card.ap || card.bp
    ).length;
    const withRarity = enriched.filter((card) => card.rarity).length;
    const withKana = enriched.filter((card) => card.name_kana_jp).length;

    console.log("\nDone.");
    console.log(`Enriched total : ${enriched.length}`);
    console.log(`OK             : ${ok}`);
    console.log(`With rarity    : ${withRarity}`);
    console.log(`With kana      : ${withKana}`);
    console.log(`With effect    : ${withEffect}`);
    console.log(`With trigger   : ${withTrigger}`);
    console.log(`With stats     : ${withStats}`);
    console.log(`Output         : ${OUTPUT_PATH}`);
  } finally {
    await browser.close().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});