/* eslint-disable no-console */

const { chromium } = require("playwright");
const fs = require("fs/promises");
const path = require("path");

const LANG = process.env.UA_LANG || "jp"; // jp / en / tc
const BASE_URL = `https://www.unionarena-tcg.com/${LANG}/cardlist/index.php?search=true`;

const OUT_DIR = path.join(process.cwd(), "downloads", `union-arena-${LANG}`);
const IMAGE_DIR = path.join(OUT_DIR, "images");

const DOWNLOAD_IMAGES = process.env.UA_IMAGES !== "0";
const DEEP_DETAIL = process.env.UA_DEEP === "1";
const HEADLESS = process.env.UA_HEADLESS !== "0";

const DELAY_MS = Number(process.env.UA_DELAY_MS || 900);
const MAX_PRODUCTS = Number(process.env.UA_MAX_PRODUCTS || 0);
const MAX_CARDS_PER_PRODUCT = Number(process.env.UA_MAX_CARDS_PER_PRODUCT || 0);

const START_INDEX = Number(process.env.UA_START_INDEX || 1); // 由第幾個商品開始，1-based
const END_INDEX = Number(process.env.UA_END_INDEX || 0); // 0 = 跑到最後
const PAGE_TIMEOUT_MS = Number(process.env.UA_PAGE_TIMEOUT_MS || 90000);
const IMAGE_TIMEOUT_MS = Number(process.env.UA_IMAGE_TIMEOUT_MS || 45000);
const IMAGE_RETRY = Number(process.env.UA_IMAGE_RETRY || 3);

const SKIP_EXISTING_IMAGES = process.env.UA_SKIP_EXISTING_IMAGES !== "0";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeFilename(value) {
  return String(value || "unknown")
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 180);
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows) {
  const columns = [
    "lang",
    "product_id",
    "product_name",
    "card_no",
    "card_name",
    "card_code",
    "product_code",
    "alt",
    "source_url",
    "detail_url",
    "image_url",
    "image_file",
    "detail_text",
  ];

  return [
    columns.join(","),
    ...rows.map((row) => columns.map((col) => csvEscape(row[col])).join(",")),
  ].join("\n");
}

function parseCardAlt(alt) {
  const text = cleanText(alt);

  const match = text.match(
    /^((?:UA|EX|PC)\d{2}[A-Z]{0,4}\/[A-Z0-9-]+-(?:\d{3}|AP\d{2}))\s+(.+)$/
  );

  if (!match) {
    return {
      card_no: "",
      card_name: text,
      product_code: "",
      card_code: "",
    };
  }

  const cardNo = match[1];
  const cardName = match[2];
  const parts = cardNo.split("/");

  return {
    card_no: cardNo,
    card_name: cardName,
    product_code: parts[0] || "",
    card_code: parts[1] || "",
  };
}

function guessImageExt(url, contentType) {
  const cleanUrl = String(url || "").split("?")[0].toLowerCase();

  if (cleanUrl.endsWith(".png")) return ".png";
  if (cleanUrl.endsWith(".webp")) return ".webp";
  if (cleanUrl.endsWith(".gif")) return ".gif";
  if (cleanUrl.endsWith(".jpeg")) return ".jpg";
  if (cleanUrl.endsWith(".jpg")) return ".jpg";

  if (contentType && contentType.includes("png")) return ".png";
  if (contentType && contentType.includes("webp")) return ".webp";
  if (contentType && contentType.includes("gif")) return ".gif";

  return ".jpg";
}

function xpathLiteral(s) {
  if (!s.includes("'")) return `'${s}'`;
  if (!s.includes('"')) return `"${s}"`;

  return (
    "concat(" +
    s
      .split("'")
      .map((part) => `'${part}'`)
      .join(`, "'", `) +
    ")"
  );
}

function makeCardKey(card) {
  return [
    card.lang || "",
    card.product_id || "",
    card.card_no || "",
    card.image_url || "",
  ].join("::");
}

async function fileExists(filepath) {
  try {
    const stat = await fs.stat(filepath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(IMAGE_DIR, { recursive: true });
}

async function writeJson(filename, data) {
  await fs.writeFile(
    path.join(OUT_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf8"
  );
}

async function appendJsonl(filename, data) {
  await fs.writeFile(
    path.join(OUT_DIR, filename),
    JSON.stringify(data) + "\n",
    { flag: "a" }
  );
}

async function loadExistingPartialCards() {
  const partialPath = path.join(OUT_DIR, "cards.partial.json");

  try {
    const raw = await fs.readFile(partialPath, "utf8");
    const data = JSON.parse(raw);

    if (Array.isArray(data)) {
      console.log(`Loaded existing partial cards: ${data.length}`);
      return data;
    }

    return [];
  } catch {
    console.log("No existing partial file loaded.");
    return [];
  }
}

async function dumpDebugSelects(page) {
  const selects = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("select")).map((select, index) => {
      return {
        index,
        name: select.getAttribute("name"),
        id: select.getAttribute("id"),
        className: select.getAttribute("class"),
        optionCount: select.options.length,
        options: Array.from(select.options).slice(0, 50).map((option) => ({
          value: option.value,
          text: option.textContent.trim(),
        })),
      };
    });
  });

  await writeJson("debug-selects.json", selects);
}

async function getProductOptions(page) {
  await page.goto(BASE_URL, {
    waitUntil: "domcontentloaded",
    timeout: PAGE_TIMEOUT_MS,
  });

  await page.waitForTimeout(3000);

  const products = await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll("select"));

    const productSelect = selects.find((select) => {
      const text = Array.from(select.options)
        .map((option) => option.textContent || "")
        .join(" ");

      return (
        /UA\d{2}ST|UA\d{2}BT|EX\d{2}BT|PC\d{2}BT/i.test(text) ||
        /商品名|Product|プロモーションカード|Promotion/i.test(text)
      );
    });

    if (!productSelect) return [];

    return Array.from(productSelect.options)
      .map((option) => ({
        value: option.value,
        text: option.textContent.trim(),
      }))
      .filter((option) => {
        if (!option.value) return false;

        if (
          /指定無し|不指定|No Designation|Select Product|商品名を選択|選擇商品名/i.test(
            option.text
          )
        ) {
          return false;
        }

        return /UA\d{2}|EX\d{2}|PC\d{2}|プロモーション|Promotion|限定商品/i.test(
          option.text
        );
      });
  });

  await dumpDebugSelects(page);

  const deduped = [];
  const seen = new Set();

  for (const product of products) {
    const key = `${product.value}::${product.text}`;
    if (seen.has(key)) continue;

    seen.add(key);

    deduped.push({
      id: product.value,
      name: cleanText(product.text),
    });
  }

  return MAX_PRODUCTS > 0 ? deduped.slice(0, MAX_PRODUCTS) : deduped;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 600;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 120);
    });
  });
}

async function collectCardsFromCurrentPage(page) {
  await page.waitForTimeout(1000);
  await autoScroll(page);
  await page.waitForTimeout(1000);

  const cards = await page.evaluate(() => {
    function clean(value) {
      return String(value || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    function absUrl(value) {
      if (!value) return "";

      try {
        return new URL(value, location.href).href;
      } catch {
        return "";
      }
    }

    function getImageUrl(img) {
      const attrs = [
        "data-src",
        "data-original",
        "data-lazy",
        "data-img",
        "data-image",
        "src",
      ];

      for (const attr of attrs) {
        const value = img.getAttribute(attr);
        if (value && !value.includes("dummy.gif")) {
          return absUrl(value);
        }
      }

      const srcset = img.getAttribute("srcset");
      if (srcset) {
        const first = srcset.split(",")[0]?.trim()?.split(" ")[0];
        if (first && !first.includes("dummy.gif")) {
          return absUrl(first);
        }
      }

      if (img.currentSrc && !img.currentSrc.includes("dummy.gif")) {
        return absUrl(img.currentSrc);
      }

      const style = window.getComputedStyle(img);
      const bg = style.backgroundImage || "";
      const match = bg.match(/url\(["']?(.+?)["']?\)/);

      if (match && !match[1].includes("dummy.gif")) {
        return absUrl(match[1]);
      }

      return "";
    }

    const imgs = Array.from(document.querySelectorAll("img"));

    return imgs
      .map((img, domIndex) => {
        const alt = clean(img.getAttribute("alt"));
        const imageUrl = getImageUrl(img);
        const anchor = img.closest("a");

        const holder =
          img.closest("li") ||
          img.closest("[class*='card']") ||
          img.closest("[class*='Card']") ||
          anchor ||
          img.parentElement;

        const holderText = clean(holder ? holder.innerText : "");

        const looksLikeCard =
          /(?:UA|EX|PC)\d{2}[A-Z]{0,4}\/[A-Z0-9-]+-(?:\d{3}|AP\d{2})/i.test(
            alt
          ) ||
          /(?:UA|EX|PC)\d{2}[A-Z]{0,4}\/[A-Z0-9-]+-(?:\d{3}|AP\d{2})/i.test(
            holderText
          );

        const looksLikeUi =
          /UNION ARENA|MENU|CLOSE|CARDLIST|GLOBAL|LANGUAGE|Youtube|Facebook|X|BANDAI/i.test(
            alt
          );

        if (!looksLikeCard || looksLikeUi) return null;

        return {
          dom_index: domIndex,
          alt,
          holder_text: holderText,
          image_url: imageUrl,
          detail_url: anchor ? anchor.href : "",
        };
      })
      .filter(Boolean);
  });

  const deduped = [];
  const seen = new Set();

  for (const card of cards) {
    const key = `${card.alt}::${card.image_url}`;
    if (seen.has(key)) continue;

    seen.add(key);
    deduped.push(card);
  }

  return MAX_CARDS_PER_PRODUCT > 0
    ? deduped.slice(0, MAX_CARDS_PER_PRODUCT)
    : deduped;
}

async function tryExtractDetailByClick(page, card) {
  if (!DEEP_DETAIL || !card.alt) return {};

  try {
    const locator = page.locator(`xpath=//img[@alt=${xpathLiteral(card.alt)}]`).first();

    if ((await locator.count()) === 0) return {};

    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await locator.click({ force: true, timeout: 3000 });
    await page.waitForTimeout(700);

    const detail = await page.evaluate(() => {
      function visible(el) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);

        return (
          rect.width > 20 &&
          rect.height > 20 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity || "1") > 0
        );
      }

      function clean(value) {
        return String(value || "")
          .replace(/\u00a0/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      function absUrl(value) {
        if (!value) return "";

        try {
          return new URL(value, location.href).href;
        } catch {
          return "";
        }
      }

      const candidates = Array.from(
        document.querySelectorAll(
          "[class*='modal'], [id*='modal'], .remodal, .mfp-wrap, .fancybox__container, .colorbox, .popup, [class*='popup']"
        )
      ).filter(visible);

      const best = candidates
        .map((el) => ({
          text: clean(el.innerText),
          htmlLength: el.innerHTML.length,
          image: Array.from(el.querySelectorAll("img"))
            .map((img) => {
              return (
                img.getAttribute("data-src") ||
                img.getAttribute("data-original") ||
                img.currentSrc ||
                img.src ||
                ""
              );
            })
            .map(absUrl)
            .find((url) => url && !url.includes("dummy.gif")),
        }))
        .filter((item) => item.text || item.image)
        .sort((a, b) => b.htmlLength - a.htmlLength)[0];

      return best || {};
    });

    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(200);

    return {
      detail_text: cleanText(detail.text || ""),
      detail_image_url: detail.image || "",
    };
  } catch {
    await page.keyboard.press("Escape").catch(() => {});
    return {};
  }
}

async function downloadImage(request, card, sourceUrl) {
  const imageUrl = card.detail_image_url || card.image_url;

  if (!DOWNLOAD_IMAGES || !imageUrl || imageUrl.includes("dummy.gif")) {
    return "";
  }

  const contentUrl = String(imageUrl || "").split("?")[0];
  const roughExt = guessImageExt(contentUrl, "");
  const filename = `${sanitizeFilename(card.card_no || card.alt)}${roughExt}`;
  const filepath = path.join(IMAGE_DIR, filename);
  const relativePath = path.relative(process.cwd(), filepath).replace(/\\/g, "/");

  if (SKIP_EXISTING_IMAGES && (await fileExists(filepath))) {
    return relativePath;
  }

  let lastError = null;

  for (let attempt = 1; attempt <= IMAGE_RETRY; attempt += 1) {
    try {
      const response = await request.get(imageUrl, {
        headers: {
          referer: sourceUrl,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome Safari",
        },
        timeout: IMAGE_TIMEOUT_MS,
      });

      if (!response.ok()) {
        lastError = new Error(`HTTP ${response.status()}`);
        console.warn(`  image failed ${response.status()} ${imageUrl}`);
        await sleep(1000 * attempt);
        continue;
      }

      const contentType = response.headers()["content-type"] || "";
      const ext = guessImageExt(imageUrl, contentType);
      const finalFilename = `${sanitizeFilename(card.card_no || card.alt)}${ext}`;
      const finalFilepath = path.join(IMAGE_DIR, finalFilename);
      const finalRelativePath = path
        .relative(process.cwd(), finalFilepath)
        .replace(/\\/g, "/");

      const body = await response.body();
      await fs.writeFile(finalFilepath, body);

      return finalRelativePath;
    } catch (error) {
      lastError = error;
      console.warn(
        `  image error attempt ${attempt}/${IMAGE_RETRY}: ${imageUrl}: ${error.message}`
      );
      await sleep(1000 * attempt);
    }
  }

  await appendJsonl("failed-images.jsonl", {
    card_no: card.card_no,
    card_name: card.card_name,
    product_id: card.product_id,
    product_name: card.product_name,
    image_url: imageUrl,
    source_url: sourceUrl,
    error: lastError ? lastError.message : "Unknown image error",
    time: new Date().toISOString(),
  });

  return "";
}

async function saveProgress(allCards) {
  await writeJson("cards.partial.json", allCards);
  await fs.writeFile(path.join(OUT_DIR, "cards.partial.csv"), toCsv(allCards), "utf8");
}

async function main() {
  await ensureDirs();

  let browser;

  try {
    browser = await chromium.launch({
      headless: HEADLESS,
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 1200 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome Safari",
    });

    const page = await context.newPage();

    console.log(`Open: ${BASE_URL}`);

    const products = await getProductOptions(page);

    console.log(`Products found: ${products.length}`);
    await writeJson("products.json", products);

    if (products.length === 0) {
      console.log("找不到商品選項。請打開 downloads/union-arena-*/debug-selects.json 給我看。");
      return;
    }

    const allCards = await loadExistingPartialCards();
    const seenCards = new Set(allCards.map(makeCardKey));

    const startProductIndex = Math.max(START_INDEX - 1, 0);
    const endProductIndex =
      END_INDEX > 0 ? Math.min(END_INDEX, products.length) : products.length;

    console.log(
      `Run range: ${startProductIndex + 1} to ${endProductIndex} of ${products.length}`
    );
    console.log(`Existing cards before run: ${allCards.length}`);

    for (let i = startProductIndex; i < endProductIndex; i += 1) {
      const product = products[i];

      const sourceUrl = `https://www.unionarena-tcg.com/${LANG}/cardlist/index.php?search=true&series=${encodeURIComponent(
        product.id
      )}`;

      console.log(`\n[${i + 1}/${products.length}] ${product.name}`);
      console.log(sourceUrl);

      try {
        await page.goto(sourceUrl, {
          waitUntil: "domcontentloaded",
          timeout: PAGE_TIMEOUT_MS,
        });

        await page.waitForTimeout(3000);
      } catch (error) {
        console.warn(`  page error, skipped: ${error.message}`);

        await appendJsonl("failed-products.jsonl", {
          product_index: i + 1,
          product,
          source_url: sourceUrl,
          error: error.message,
          time: new Date().toISOString(),
        });

        await page.goto("about:blank").catch(() => {});
        continue;
      }

      let pageCards = [];

      try {
        pageCards = await collectCardsFromCurrentPage(page);
      } catch (error) {
        console.warn(`  collect error, skipped: ${error.message}`);

        await appendJsonl("failed-products.jsonl", {
          product_index: i + 1,
          product,
          source_url: sourceUrl,
          error: `collectCardsFromCurrentPage: ${error.message}`,
          time: new Date().toISOString(),
        });

        continue;
      }

      console.log(`  cards visible: ${pageCards.length}`);

      if (pageCards.length === 0) {
        await appendJsonl("zero-card-products.jsonl", {
          product_index: i + 1,
          product,
          source_url: sourceUrl,
          time: new Date().toISOString(),
        });

        await saveProgress(allCards);
        continue;
      }

      for (let j = 0; j < pageCards.length; j += 1) {
        const rawCard = pageCards[j];
        const parsed = parseCardAlt(rawCard.alt);

        let card = {
          lang: LANG,
          product_id: product.id,
          product_name: product.name,
          source_url: sourceUrl,

          ...rawCard,
          ...parsed,

          detail_text: "",
          detail_image_url: "",
          image_file: "",
        };

        const cardKey = makeCardKey(card);

        if (seenCards.has(cardKey)) {
          if ((j + 1) % 20 === 0) {
            console.log(`  skipped existing ${j + 1}/${pageCards.length}`);
          }
          continue;
        }

        if (DEEP_DETAIL) {
          const detail = await tryExtractDetailByClick(page, card);
          card = {
            ...card,
            ...detail,
          };
        }

        card.image_file = await downloadImage(context.request, card, sourceUrl);

        allCards.push(card);
        seenCards.add(cardKey);

        if ((j + 1) % 20 === 0) {
          console.log(`  processed ${j + 1}/${pageCards.length}`);
        }

        await sleep(DELAY_MS);
      }

      await saveProgress(allCards);
      console.log(`  saved partial cards: ${allCards.length}`);
    }

    await writeJson("cards.json", allCards);
    await fs.writeFile(path.join(OUT_DIR, "cards.csv"), toCsv(allCards), "utf8");

    const withImage = allCards.filter((card) => card.image_file).length;
    const noImage = allCards.filter((card) => !card.image_file).length;
    const uniqueImageFiles = new Set(
      allCards.map((card) => card.image_file).filter(Boolean)
    ).size;

    console.log("\nDone.");
    console.log(`Cards total     : ${allCards.length}`);
    console.log(`Cards with image: ${withImage}`);
    console.log(`Cards no image  : ${noImage}`);
    console.log(`Unique images   : ${uniqueImageFiles}`);
    console.log(`JSON: ${path.join(OUT_DIR, "cards.json")}`);
    console.log(`CSV : ${path.join(OUT_DIR, "cards.csv")}`);
    console.log(`IMG : ${IMAGE_DIR}`);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});