function toNumberOrBlank(value) {
  if (value === undefined || value === null || value === "") return "";
  const number = Number(value);
  return Number.isNaN(number) ? "" : number;
}

function imagePath(cardNo) {
  return `/cards/${cardNo}.png`;
}

function defaultRarityByCardNo(cardNo, fallback = "") {
  if (cardNo.startsWith("S0")) return "ST";
  if (cardNo.startsWith("PR")) return "PR";
  if (cardNo.startsWith("MP")) return "MP";
  return fallback;
}

export function parseRawCards(rawCards, options = {}) {
  const {
    defaultSeries = "",
    defaultProduct = "",
    defaultRarity = ""
  } = options;

  return rawCards
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [
        id,
        cardNo,
        nameZh,
        nameJp,
        type,
        house,
        rarity,
        cost,
        ap,
        dp,
        tags,
        product,
        effectZh
      ] = line.split("|");

      return {
        id,
        cardNo,
        nameZh,
        nameJp,
        nameOriginal: nameJp,
        type: type || "其他",
        house: house || "中立",
        rarity: rarity || defaultRarityByCardNo(cardNo, defaultRarity),
        cost: toNumberOrBlank(cost),
        ap: toNumberOrBlank(ap),
        dp: toNumberOrBlank(dp),
        tags: tags ? tags.split("／").filter(Boolean) : [],
        product: product || defaultProduct,
        series: defaultSeries,
        image: imagePath(cardNo),
        imageUrl: imagePath(cardNo),
        effectZh: effectZh || "",
        effectOriginal: "",
        isParallel: /[a-z]$/i.test(cardNo)
      };
    });
}