// src/utils/deckUtils.js

export const MAIN_DECK_LIMIT = 50;
export const SAME_CARD_LIMIT = 4;

export function normalizeCardId(id = "") {
  return String(id).trim();
}

export function getBaseCardId(id = "") {
  return normalizeCardId(id).replace(/[a-z]+$/i, "");
}

export function getCardName(card) {
  if (!card) return "";
  return card.name || card.zhName || card.cardName || card.title || "";
}

export function getCardJapaneseName(card) {
  if (!card) return "";
  return card.jpName || card.japaneseName || card.originalName || "";
}

export function getCardType(card) {
  return card?.type || card?.cardType || "";
}

export function getCardHouse(card) {
  return card?.house || card?.attribute || "中立";
}

export function getCardRarity(card) {
  return card?.rarity || "";
}

export function getCardCost(card) {
  const rawCost = card?.cost;

  if (rawCost === undefined || rawCost === null || rawCost === "") {
    return "";
  }

  const num = Number(rawCost);
  return Number.isNaN(num) ? String(rawCost) : num;
}

export function getCardImage(card) {
  return card?.image || card?.imageUrl || card?.imageURL || "";
}

export function isPartnerCard(card) {
  return getCardType(card) === "Partner卡";
}

export function isMpCard(card) {
  return getCardType(card) === "MP卡";
}

export function isSpecialDeckSlotCard(card) {
  return isPartnerCard(card) || isMpCard(card);
}

export function getMainDeckTotal(deck = {}, cardList = []) {
  return Object.entries(deck).reduce((total, [cardId, count]) => {
    const card = cardList.find((item) => item.id === cardId);
    if (!card || isSpecialDeckSlotCard(card)) return total;
    return total + Number(count || 0);
  }, 0);
}

export function getSameBaseCardTotal(deck = {}, targetCardId = "") {
  const targetBaseId = getBaseCardId(targetCardId);

  return Object.entries(deck).reduce((total, [deckCardId, count]) => {
    if (getBaseCardId(deckCardId) === targetBaseId) {
      return total + Number(count || 0);
    }

    return total;
  }, 0);
}

export function getDeckCards(deck = {}, cardList = []) {
  return Object.entries(deck)
    .map(([cardId, count]) => {
      const card = cardList.find((item) => item.id === cardId);
      if (!card) return null;

      return {
        card,
        count: Number(count || 0)
      };
    })
    .filter(Boolean)
    .filter((item) => item.count > 0);
}

export function getMainDeckCards(deck = {}, cardList = []) {
  return getDeckCards(deck, cardList).filter(
    ({ card }) => !isSpecialDeckSlotCard(card)
  );
}

export function countByField(deck = {}, cardList = [], getFieldValue) {
  const result = {};

  getMainDeckCards(deck, cardList).forEach(({ card, count }) => {
    const value = getFieldValue(card);

    const key =
      value === undefined || value === null || value === ""
        ? "未設定"
        : String(value);

    result[key] = (result[key] || 0) + count;
  });

  return result;
}

export function getCostCurve(deck = {}, cardList = []) {
  const curve = countByField(deck, cardList, getCardCost);

  return Object.entries(curve).sort(([a], [b]) => {
    const numA = Number(a);
    const numB = Number(b);

    if (Number.isNaN(numA) && Number.isNaN(numB)) return a.localeCompare(b);
    if (Number.isNaN(numA)) return 1;
    if (Number.isNaN(numB)) return -1;

    return numA - numB;
  });
}

export function getTypeDistribution(deck = {}, cardList = []) {
  return Object.entries(countByField(deck, cardList, getCardType));
}

export function getHouseDistribution(deck = {}, cardList = []) {
  return Object.entries(countByField(deck, cardList, getCardHouse));
}

export function getRarityDistribution(deck = {}, cardList = []) {
  return Object.entries(countByField(deck, cardList, getCardRarity));
}

export function canAddMainDeckCard(deck = {}, cardList = [], card) {
  if (!card) {
    return {
      ok: false,
      message: "找不到卡牌資料。"
    };
  }

  if (isSpecialDeckSlotCard(card)) {
    return {
      ok: true,
      message: ""
    };
  }

  const mainTotal = getMainDeckTotal(deck, cardList);

  if (mainTotal >= MAIN_DECK_LIMIT) {
    return {
      ok: false,
      message: `主牌組最多只能放 ${MAIN_DECK_LIMIT} 張卡，不包括 Partner 卡和 MP 卡。`
    };
  }

  const sameBaseTotal = getSameBaseCardTotal(deck, card.id);

  if (sameBaseTotal >= SAME_CARD_LIMIT) {
    return {
      ok: false,
      message: `同一張卡最多只能放 ${SAME_CARD_LIMIT} 張，包括 a、b、異圖版。`
    };
  }

  return {
    ok: true,
    message: ""
  };
}