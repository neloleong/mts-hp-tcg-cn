/* eslint-disable no-console */

const fs = require("fs/promises");
const path = require("path");

const LANG = process.env.UA_LANG || "jp";

const ROOT = process.cwd();

const INPUT_PATH = process.env.UA_INPUT
  ? path.resolve(process.env.UA_INPUT)
  : path.join(ROOT, "downloads", `union-arena-${LANG}`, "cards.enriched.json");

const OUTPUT_DIR = process.env.UA_PUBLIC_DIR
  ? path.resolve(process.env.UA_PUBLIC_DIR)
  : path.join(ROOT, "public", "data", `union-arena-${LANG}`);

const OUTPUT_CARDS_PATH = path.join(OUTPUT_DIR, "cards.zh.json");
const OUTPUT_PRODUCTS_PATH = path.join(OUTPUT_DIR, "products.zh.json");
const OUTPUT_REPORT_PATH = path.join(OUTPUT_DIR, "translation-report.json");

const COPY_IMAGES = process.env.UA_COPY_IMAGES === "1";
const SOURCE_IMAGE_DIR = path.join(ROOT, "downloads", `union-arena-${LANG}`, "images");
const PUBLIC_IMAGE_DIR = path.join(OUTPUT_DIR, "images");

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

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function splitFeature(value) {
  return cleanOneLine(value)
    .split(/[、,／/]/)
    .map((item) => cleanOneLine(item))
    .filter(Boolean);
}

function getImageFilename(card) {
  const imageFile = cleanOneLine(card.image_file || "");
  const detailImageUrl = cleanOneLine(card.detail_image_url || card.image_url || "");

  if (imageFile) {
    return path.basename(imageFile.replace(/\\/g, "/"));
  }

  if (detailImageUrl) {
    const cleanUrl = detailImageUrl.split("?")[0];
    return path.basename(cleanUrl);
  }

  return "";
}

function getPublicImageFile(card) {
  const filename = getImageFilename(card);

  if (!filename) return "";

  return `images/${filename}`;
}

const CARD_TYPE_ZH = {
  キャラクター: "角色卡",
  イベント: "事件卡",
  フィールド: "場地卡",
  アクション: "行動卡",
  APカード: "AP 卡"
};

const COLOR_ZH = {
  赤: "紅",
  青: "藍",
  緑: "綠",
  黄: "黃",
  紫: "紫",
  RED: "紅",
  BLUE: "藍",
  GREEN: "綠",
  YELLOW: "黃",
  PURPLE: "紫"
};

const TRIGGER_TYPE_ZH = {
  ゲット: "獲得",
  カラー: "顏色",
  ドロー: "抽牌",
  アクティブ: "Active",
  レイド: "突襲",
  ファイナル: "Final",
  スペシャル: "Special"
};

const PRODUCT_TITLE_ZH = {
  "コードギアス 反逆のルルーシュ": "Code Geass 反叛的魯路修",
  "呪術廻戦": "咒術迴戰",
  "HUNTER×HUNTER": "HUNTER×HUNTER",
  "アイドルマスター シャイニーカラーズ": "偶像大師 閃耀色彩",
  "鬼滅の刃": "鬼滅之刃",
  "Tales of ARISE": "Tales of ARISE",
  "転生したらスライムだった件": "關於我轉生變成史萊姆這檔事",
  "BLEACH 千年血戦篇": "BLEACH 千年血戰篇",
  "僕とロボコ": "我與機器子",
  "僕のヒーローアカデミア": "我的英雄學院",
  "銀魂": "銀魂",
  "ブルーロック": "BLUE LOCK 藍色監獄",
  "鉄拳7": "鐵拳 7",
  "Dr.STONE": "Dr.STONE 新石紀",
  "ソードアート・オンライン": "刀劍神域",
  "SYNDUALITY Noir": "SYNDUALITY Noir",
  "トリコ": "美食獵人 TORIKO",
  "勝利の女神：NIKKE": "勝利女神：NIKKE",
  "ハイキュー‼": "排球少年!!",
  "ブラッククローバー": "黑色五葉草",
  "幽☆遊☆白書": "幽遊白書",
  "GAMERA -Rebirth-": "GAMERA -Rebirth-",
  "進撃の巨人": "進擊的巨人",
  SHY: "SHY 靦腆英雄",
  "アンデッドアンラック": "不死不運",
  "君のことが大大大大大好きな100人の彼女": "超超超超超喜歡你的100個女朋友",
  "学園アイドルマスター": "學園偶像大師",
  "怪獣８号": "怪獸 8 號",
  "仮面ライダー": "假面騎士",
  "アークナイツ": "明日方舟",
  "魔法少女まどか☆マギカ": "魔法少女小圓",
  "シャングリラ・フロンティア": "香格里拉・開拓異境",
  "2.5次元の誘惑": "2.5 次元的誘惑",
  "コードギアス 奪還のロゼ": "Code Geass 奪還的 Rozé",
  "ワンパンマン": "一拳超人",
  "マクロス": "Macross",
  "鋼の錬金術師 FULLMETAL ALCHEMIST": "鋼之鍊金術師 FULLMETAL ALCHEMIST",
  "WIND BREAKER": "WIND BREAKER",
  "キン肉マン": "金肉人",
  "Re:ゼロから始める異世界生活": "Re:從零開始的異世界生活",
  "るろうに剣心 －明治剣客浪漫譚－": "神劍闖江湖－明治劍客浪漫譚－",
  "〈物語〉シリーズ": "〈物語〉系列",
  "SAKAMOTO DAYS": "SAKAMOTO DAYS 坂本日常",
  "ヱヴァンゲリヲン新劇場版": "福音戰士新劇場版",
  "To LOVEる-とらぶる-": "出包王女 To LOVEる",
  "カグラバチ": "神樂鉢",
  "東京喰種トーキョーグール": "東京喰種",
  "キングダム": "王者天下",
  "魔都精兵のスレイブ": "魔都精兵的奴隸",
  "犬夜叉": "犬夜叉",
  "俺だけレベルアップな件": "我獨自升級",
  "陰の実力者になりたくて！": "想要成為影之實力者！",
  "チェンソーマン": "鏈鋸人",
  "無職転生 ～異世界行ったら本気だす～": "無職轉生～到了異世界就拿出真本事～",
  "プロモーションカード": "宣傳卡",
  "限定商品収録カード": "限定商品收錄卡"
};

const FEATURE_ZH = {
  黒の騎士団: "黑色騎士團",
  神聖ブリタニア帝国: "神聖不列顛帝國",
  アッシュフォード学園: "阿什福德學園",
  中華連邦: "中華聯邦",
  親衛隊: "親衛隊",
  純血派: "純血派",
  四聖剣: "四聖劍",
  ナイトオブラウンズ: "圓桌騎士",
  京都校: "京都校",
  呪術師: "咒術師",
  呪霊: "咒靈",
  呪具: "咒具",
  式神: "式神",
  改造人間: "改造人",
  呪胎九相図: "咒胎九相圖",
  幻影旅団: "幻影旅團",
  ゾルディック家: "揍敵客家",
  念獣: "念獸",
  指定ポケット: "指定口袋",
  爆弾魔: "炸彈魔",
  レイザー攻略組: "雷札攻略組",
  柱: "柱",
  上弦の鬼: "上弦之鬼",
  下弦の鬼: "下弦之鬼",
  日輪刀: "日輪刀",
  刀鍛冶の里: "刀匠村",
  半天狗の分身: "半天狗的分身",
  天元の嫁: "天元之妻",
  変装: "變裝",
  鬼人: "鬼人",
  魔王: "魔王",
  動物: "動物",
  食べ物: "食物"
};

const EXACT_TEXT_ZH = {
  "-": "-",
  "このカードを手札に加える。": "將這張卡加入手牌。",
  "カードを1枚引く。": "抽 1 張卡。",
  "カードを2枚引く。": "抽 2 張卡。",
  "このカードをアクティブで登場させる。": "將這張卡以 Active 狀態登場。"
};

const KEYWORD_ZH = {
  登場時: "登場時",
  退場時: "退場時",
  アタック時: "攻擊時",
  ブロック時: "阻擋時",
  起動メイン: "主要階段啟動",
  トリガー: "Trigger",
  レイド: "突襲",
  インパクト: "Impact",
  ステップ: "Step",
  狙い撃ち: "狙擊",
  ダメージ: "Damage",
  ゲット: "獲得",
  カラー: "顏色",
  ドロー: "抽牌",
  アクティブ: "Active",
  ファイナル: "Final",
  スペシャル: "Special"
};

function normalizeProductTitle(productName) {
  let value = cleanOneLine(productName);

  value = value.replace(/【[^】]+】/g, "").trim();
  value = value.replace(/\s+Vol\.\d+/i, "").trim();
  value = value.replace(/NEW CARD SELECTION\s*/i, "").trim();
  value = value.replace(/[「」｢｣]/g, "").trim();

  if (value.includes("鋼の錬金術師")) {
    return "鋼の錬金術師 FULLMETAL ALCHEMIST";
  }

  if (value.includes("マクロス")) {
    return "マクロス";
  }

  if (value.includes("東京喰種")) {
    return "東京喰種トーキョーグール";
  }

  if (value.includes("キン肉マン")) {
    return "キン肉マン";
  }

  return value;
}

function translateProductName(productName) {
  const original = cleanOneLine(productName);
  const title = normalizeProductTitle(original);
  const codeMatch = original.match(/【([^】]+)】/);
  const code = codeMatch ? `【${codeMatch[1]}】` : "";

  const translatedTitle = PRODUCT_TITLE_ZH[title] || title;

  if (code) {
    return `${translatedTitle} ${code}`;
  }

  return translatedTitle;
}

function translateFeature(featureJp) {
  const features = splitFeature(featureJp);

  return features
    .map((feature) => FEATURE_ZH[feature] || feature)
    .join("／");
}

function translateCardType(cardTypeJp) {
  const value = cleanOneLine(cardTypeJp);
  return CARD_TYPE_ZH[value] || value;
}

function translateColor(colorJp) {
  const value = cleanOneLine(colorJp);
  return COLOR_ZH[value] || value;
}

function translateTriggerType(triggerJp) {
  const value = cleanOneLine(triggerJp);

  for (const [key, label] of Object.entries(TRIGGER_TYPE_ZH)) {
    if (value.includes(key)) return label;
  }

  return "";
}

function splitJapaneseSentences(text) {
  const source = cleanText(text);

  if (!source || source === "-") return source ? [source] : [];

  return source
    .replace(/。/g, "。\n")
    .split("\n")
    .map((item) => cleanOneLine(item))
    .filter(Boolean);
}

function translateExactSentence(sentence) {
  const clean = cleanOneLine(sentence);

  if (EXACT_TEXT_ZH[clean]) {
    return EXACT_TEXT_ZH[clean];
  }

  return "";
}

function translateKeywordPrefix(sentence) {
  let value = cleanOneLine(sentence);

  for (const [jp, zh] of Object.entries(KEYWORD_ZH)) {
    const bracketPattern = new RegExp(`^【${jp}】`);
    const plainPattern = new RegExp(`^${jp}`);

    if (bracketPattern.test(value)) {
      value = value.replace(bracketPattern, `【${zh}】`);
      break;
    }

    if (plainPattern.test(value)) {
      value = value.replace(plainPattern, zh);
      break;
    }
  }

  return value;
}

function translateCommonSentence(sentence) {
  const s = cleanOneLine(sentence);

  let match;

  match = s.match(/^このキャラがアクティブの場合、このキャラの発生エナジー\+。$/);
  if (match) {
    return "若這張角色為 Active，這張角色的發生能量+。";
  }

  match = s.match(/^このターン中、このキャラの発生エナジー\+。$/);
  if (match) {
    return "這個回合中，這張角色的發生能量+。";
  }

  match = s.match(/^メインフェイズ終了時、このキャラを退場させる。$/);
  if (match) {
    return "主要階段結束時，使這張角色退場。";
  }

  match = s.match(/^ターン終了時、このキャラを退場させる。$/);
  if (match) {
    return "回合結束時，使這張角色退場。";
  }

  match = s.match(/^このキャラを退場させる。$/);
  if (match) {
    return "使這張角色退場。";
  }

  match = s.match(/^このカードを手札に加える。$/);
  if (match) {
    return "將這張卡加入手牌。";
  }

  match = s.match(/^カードを(\d+)枚引く。$/);
  if (match) {
    return `抽 ${match[1]} 張卡。`;
  }

  match = s.match(/^自分の山札の上から(\d+)枚見る。$/);
  if (match) {
    return `查看自己的牌庫上方 ${match[1]} 張卡。`;
  }

  match = s.match(/^自分の山札の上から(\d+)枚公開する。$/);
  if (match) {
    return `公開自己的牌庫上方 ${match[1]} 張卡。`;
  }

  match = s.match(/^自分の場のキャラを(\d+)枚選び、アクティブにする。$/);
  if (match) {
    return `選擇自己場上的 ${match[1]} 張角色，使其 Active。`;
  }

  match = s.match(/^相手の場のキャラを(\d+)枚選び、レストにする。$/);
  if (match) {
    return `選擇對手場上的 ${match[1]} 張角色，使其 Rest。`;
  }

  match = s.match(/^相手のフロントLのキャラを(\d+)枚選び、BP-(\d+)。$/);
  if (match) {
    return `選擇對手前排 L 的 ${match[1]} 張角色，BP-${match[2]}。`;
  }

  match = s.match(/^このターン中、(.+)BP\+(\d+)。$/);
  if (match) {
    return `這個回合中，${translateLoosePhrase(match[1])}BP+${match[2]}。`;
  }

  match = s.match(/^このターン中、(.+)BP-(\d+)。$/);
  if (match) {
    return `這個回合中，${translateLoosePhrase(match[1])}BP-${match[2]}。`;
  }

  match = s.match(/^(.+)を手札に加える。$/);
  if (match) {
    return `將${translateLoosePhrase(match[1])}加入手牌。`;
  }

  match = s.match(/^(.+)を退場させる。$/);
  if (match) {
    return `使${translateLoosePhrase(match[1])}退場。`;
  }

  return "";
}

function translateLoosePhrase(text) {
  let value = cleanOneLine(text);

  const replacements = [
    [/このカード/g, "這張卡"],
    [/このキャラクター/g, "這張角色"],
    [/このキャラ/g, "這張角色"],

    [/自分の/g, "自己的"],
    [/相手の/g, "對手的"],
    [/自分/g, "自己"],
    [/相手/g, "對手"],

    [/フロントL/g, "前排 L"],
    [/エナジーL/g, "能量 L"],
    [/手札/g, "手牌"],
    [/山札/g, "牌庫"],
    [/場外/g, "場外"],
    [/場/g, "場上"],

    [/キャラクター/g, "角色"],
    [/キャラ/g, "角色"],
    [/イベントカード/g, "事件卡"],
    [/フィールドカード/g, "場地卡"],
    [/カード/g, "卡"],

    [/必要エナジー/g, "必要能量"],
    [/発生エナジー/g, "發生能量"],
    [/消費AP/g, "消費 AP"],

    [/アクティブ/g, "Active"],
    [/レスト/g, "Rest"],

    [/メインフェイズ終了時/g, "主要階段結束時"],
    [/ターン終了時/g, "回合結束時"],
    [/このターン中/g, "這個回合中"],

    [/手札に加える/g, "加入手牌"],
    [/カードを引く/g, "抽卡"],
    [/退場させる/g, "使其退場"],
    [/アクティブにする/g, "使其 Active"],
    [/アクティブにし/g, "使其 Active"],
    [/レストにする/g, "使其 Rest"],
    [/レストにし/g, "使其 Rest"],

    [/選び/g, "選擇"],
    [/選ぶ/g, "選擇"],
    [/公開し/g, "公開"],
    [/公開する/g, "公開"],
    [/見る/g, "查看"],
    [/置く/g, "放置"],
    [/加える/g, "加入"],
    [/捨てる/g, "捨棄"],
    [/移動させる/g, "移動"],

    [/場合/g, "時"],
    [/できる/g, "可以"],
    [/無効/g, "無效"],
    [/効果/g, "效果"],
    [/以下/g, "以下"],
    [/以上/g, "以上"],
    [/枚/g, "張"]
  ];

  for (const [pattern, replacement] of replacements) {
    value = value.replace(pattern, replacement);
  }

  value = value
    .replace(/を/g, "")
    .replace(/が/g, "")
    .replace(/の/g, "的")
    .replace(/に/g, "中")
    .replace(/で/g, "以")
    .replace(/、/g, "，")
    .replace(/。/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return value;
}

function polishChineseRuleText(text) {
  return cleanText(text)
    .replace(/這張角色的發生能量\+。/g, "這張角色的發生能量+。")
    .replace(/發生能量\+。/g, "發生能量+。")
    .replace(/BP\+(\d+)/g, "BP+$1")
    .replace(/BP-(\d+)/g, "BP-$1")
    .replace(/(\d+)張/g, "$1 張")

    .replace(/自己牌庫/g, "自己的牌庫")
    .replace(/自己場上/g, "自己的場上")
    .replace(/對手場上/g, "對手的場上")

    .replace(/這張卡手牌中加入。?/g, "將這張卡加入手牌。")
    .replace(/這張卡加入手牌。?/g, "將這張卡加入手牌。")
    .replace(/將這張卡加入手牌。?/g, "將這張卡加入手牌。")

    .replace(/這張角色使其退場。?/g, "使這張角色退場。")
    .replace(/這張角色退場。?/g, "使這張角色退場。")
    .replace(/使這張角色退場。?/g, "使這張角色退場。")

    .replace(/將將/g, "將")
    .replace(/使使/g, "使")
    .replace(/將 將/g, "將")
    .replace(/使 使/g, "使")

    .replace(/。。/g, "。")
    .replace(/、/g, "，")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function ensurePeriod(text) {
  const value = cleanText(text);

  if (!value || value === "-") return value;

  if (/[。！？]$/.test(value)) return value;

  return `${value}。`;
}

function translateSentenceRuleBased(sentence) {
  const exact = translateExactSentence(sentence);
  if (exact) return exact;

  const common = translateCommonSentence(sentence);
  if (common) return common;

  const withKeyword = translateKeywordPrefix(sentence);
  const loose = translateLoosePhrase(withKeyword);

  return ensurePeriod(polishChineseRuleText(loose));
}

function translateTextRuleBased(text) {
  const source = cleanText(text);

  if (!source || source === "-") return source;

  const sentences = splitJapaneseSentences(source);

  if (sentences.length === 0) {
    return ensurePeriod(polishChineseRuleText(translateLoosePhrase(source)));
  }

  return sentences
    .map(translateSentenceRuleBased)
    .map(polishChineseRuleText)
    .filter(Boolean)
    .join("\n");
}

function buildSearchText(card) {
  return [
    card.cardNo,
    card.cardCode,
    card.productCode,
    card.nameJp,
    card.nameKanaJp,
    card.nameZh,
    card.productNameJp,
    card.productNameZh,
    card.rarity,
    card.cardTypeJp,
    card.cardTypeZh,
    card.colorJp,
    card.colorZh,
    card.featureJp,
    card.featureZh,
    card.effectJp,
    card.effectZh,
    card.triggerJp,
    card.triggerZh
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizeCard(raw, index) {
  const cardNo = cleanOneLine(raw.card_no || raw.cardNo || "");
  const cardCode = cleanOneLine(raw.card_code || raw.cardCode || "");
  const productCode = cleanOneLine(raw.product_code || raw.productCode || "");
  const productNameJp = cleanOneLine(raw.product_name || raw.productNameJp || "");
  const productNameZh = translateProductName(productNameJp);

  const nameJp = cleanOneLine(raw.name_jp || raw.card_name || raw.cardName || "");
  const nameKanaJp = cleanOneLine(raw.name_kana_jp || "");

  const cardTypeJp = cleanOneLine(raw.card_type_jp || "");
  const cardTypeZh = translateCardType(cardTypeJp);

  const colorJp = cleanOneLine(raw.color_jp || "");
  const colorZh = translateColor(colorJp);

  const featureJp = cleanOneLine(raw.feature_jp || "");
  const featureZh = translateFeature(featureJp);

  const effectJp = cleanText(raw.effect_jp || "");
  const triggerJp = cleanText(raw.trigger_jp || "");

  const effectZh = translateTextRuleBased(effectJp);
  const triggerZh = translateTextRuleBased(triggerJp);

  const imageFile = getPublicImageFile(raw);

  const card = {
    id: cardNo || `${raw.product_id || "ua"}-${index + 1}`,

    lang: raw.lang || LANG,

    productId: cleanOneLine(raw.product_id || ""),
    productCode,
    productNameJp,
    productNameZh,

    cardNo,
    cardCode,

    nameJp,
    nameKanaJp,
    nameZh: nameJp,

    rarity: cleanOneLine(raw.rarity || ""),

    cardTypeJp,
    cardTypeZh,

    colorJp,
    colorZh,

    cost: cleanOneLine(raw.cost || ""),
    ap: cleanOneLine(raw.ap || ""),
    bp: cleanOneLine(raw.bp || ""),
    generatedEnergy: cleanOneLine(raw.generated_energy || ""),

    featureJp,
    featureZh,

    effectJp,
    effectZh,

    triggerJp,
    triggerZh,
    triggerTypeZh: translateTriggerType(triggerJp),

    imageFile,
    imageUrl: cleanOneLine(raw.detail_image_url || raw.image_url || ""),
    sourceUrl: cleanOneLine(raw.detail_url || raw.source_url || ""),

    enrichedStatus: raw.enriched_status || "",
    translationStatus: effectZh || triggerZh ? "draft_rule_based" : "no_text"
  };

  card.searchText = buildSearchText(card);

  return card;
}

function buildProducts(cards) {
  const map = new Map();

  cards.forEach((card) => {
    const key = card.productId || card.productCode || "unknown";

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        productCode: card.productCode,
        nameJp: card.productNameJp,
        nameZh: card.productNameZh,
        cardCount: 0,
        rarities: new Set(),
        colors: new Set(),
        types: new Set()
      });
    }

    const product = map.get(key);
    product.cardCount += 1;

    if (card.rarity) product.rarities.add(card.rarity);
    if (card.colorZh || card.colorJp) {
      product.colors.add(card.colorZh || card.colorJp);
    }
    if (card.cardTypeZh || card.cardTypeJp) {
      product.types.add(card.cardTypeZh || card.cardTypeJp);
    }
  });

  return Array.from(map.values())
    .map((product) => ({
      ...product,
      rarities: Array.from(product.rarities).sort(),
      colors: Array.from(product.colors).sort(),
      types: Array.from(product.types).sort()
    }))
    .sort((a, b) => a.nameJp.localeCompare(b.nameJp, "ja"));
}

function buildReport(sourceCards, zhCards, products) {
  return {
    generatedAt: new Date().toISOString(),
    input: path.relative(ROOT, INPUT_PATH).replace(/\\/g, "/"),
    cardsOutput: path.relative(ROOT, OUTPUT_CARDS_PATH).replace(/\\/g, "/"),
    productsOutput: path.relative(ROOT, OUTPUT_PRODUCTS_PATH).replace(/\\/g, "/"),
    total: zhCards.length,
    products: products.length,
    sourceOk: sourceCards.filter((card) => card.enriched_status === "ok").length,
    sourceFailed: sourceCards.filter((card) => card.enriched_status === "failed").length,
    withEffectJp: zhCards.filter((card) => card.effectJp).length,
    withEffectZh: zhCards.filter((card) => card.effectZh).length,
    withTriggerJp: zhCards.filter((card) => card.triggerJp).length,
    withTriggerZh: zhCards.filter((card) => card.triggerZh).length,
    withRarity: zhCards.filter((card) => card.rarity).length,
    withStats: zhCards.filter((card) => card.ap || card.bp || card.cost).length,
    withImageFile: zhCards.filter((card) => card.imageFile).length,
    translationStatus: {
      draftRuleBased: zhCards.filter(
        (card) => card.translationStatus === "draft_rule_based"
      ).length,
      noText: zhCards.filter((card) => card.translationStatus === "no_text").length
    },
    notes: [
      "effectZh / triggerZh 是規則字典初步中文化，仍需人工校對。",
      "nameZh 第一版沿用日文卡名，角色譯名可之後分批建立名稱字典。",
      "public/data/union-arena-jp/ 已在 .gitignore，暫時不要 commit 大量資料或圖片。"
    ]
  };
}

async function copyImagesIfNeeded(cards) {
  if (!COPY_IMAGES) return;

  await fs.mkdir(PUBLIC_IMAGE_DIR, { recursive: true });

  let copied = 0;
  let skipped = 0;
  let missing = 0;

  for (const card of cards) {
    const filename = path.basename(card.imageFile || "");

    if (!filename) {
      missing += 1;
      continue;
    }

    const sourcePath = path.join(SOURCE_IMAGE_DIR, filename);
    const targetPath = path.join(PUBLIC_IMAGE_DIR, filename);

    try {
      await fs.copyFile(sourcePath, targetPath);
      copied += 1;
    } catch {
      skipped += 1;
    }
  }

  console.log(`Images copied : ${copied}`);
  console.log(`Images skipped: ${skipped}`);
  console.log(`Images missing: ${missing}`);
}

async function main() {
  const sourceCards = await readJson(INPUT_PATH);

  if (!Array.isArray(sourceCards) || sourceCards.length === 0) {
    console.log(`找不到資料：${INPUT_PATH}`);
    process.exit(1);
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const zhCards = sourceCards.map(normalizeCard);
  const products = buildProducts(zhCards);
  const report = buildReport(sourceCards, zhCards, products);

  await writeJson(OUTPUT_CARDS_PATH, zhCards);
  await writeJson(OUTPUT_PRODUCTS_PATH, products);
  await writeJson(OUTPUT_REPORT_PATH, report);

  await copyImagesIfNeeded(zhCards);

  console.log("\nDone.");
  console.log(`Cards total    : ${zhCards.length}`);
  console.log(`Products total : ${products.length}`);
  console.log(`With effect JP : ${report.withEffectJp}`);
  console.log(`With effect ZH : ${report.withEffectZh}`);
  console.log(`With trigger JP: ${report.withTriggerJp}`);
  console.log(`With trigger ZH: ${report.withTriggerZh}`);
  console.log(`Cards JSON     : ${OUTPUT_CARDS_PATH}`);
  console.log(`Products JSON  : ${OUTPUT_PRODUCTS_PATH}`);
  console.log(`Report JSON    : ${OUTPUT_REPORT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});