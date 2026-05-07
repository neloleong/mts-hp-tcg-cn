// src/components/CardModal.jsx

import { useState } from "react";
import { cardQa, getCardQa } from "../data/cardQa";

function getBaseCardId(id = "") {
  return String(id || "").replace(/[a-z]+$/i, "");
}

function getCardNo(card) {
  return card?.cardNo || card?.card_no || card?.id || "";
}

function getCardNameZh(card) {
  return card?.nameZh || card?.name_zh || card?.name || card?.zhName || "未命名卡牌";
}

function getCardNameJp(card) {
  return (
    card?.nameJp ||
    card?.name_jp ||
    card?.nameOriginal ||
    card?.name_original ||
    card?.jpName ||
    card?.japaneseName ||
    ""
  );
}

function getCardType(card) {
  return card?.type || card?.card_type || "—";
}

function getCardHouse(card) {
  return card?.house || card?.attribute || "中立";
}

function getCardRarity(card) {
  return card?.rarity || "—";
}

function getCardCost(card) {
  const value = card?.cost;
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function getCardAp(card) {
  const value = card?.ap ?? card?.AP;
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function getCardDp(card) {
  const value = card?.dp ?? card?.DP;
  if (value === null || value === undefined || value === "") return "-";
  return value;
}

function getCardTags(card) {
  const value =
    card?.tags ||
    card?.tag ||
    card?.traits ||
    card?.trait ||
    card?.features ||
    card?.feature ||
    "";

  if (Array.isArray(value)) {
    return value.join("／");
  }

  return value || "—";
}

function getCardProductName(card, products = []) {
  const productId = card?.product || card?.productId || card?.product_id || "";

  if (!productId) {
    return card?.series || card?.seriesId || card?.series_id || "—";
  }

  const product = products.find((item) => item.id === productId);

  return product?.name || product?.title || productId;
}

function getCardEffect(card) {
  const value =
    card?.effectZh ||
    card?.effect_zh ||
    card?.effect ||
    card?.effectText ||
    card?.cardEffect ||
    card?.ability ||
    card?.skill ||
    card?.rulesText ||
    card?.ruleText ||
    card?.descriptionZh ||
    card?.description ||
    card?.content ||
    card?.text ||
    card?.body ||
    "";

  if (Array.isArray(value)) {
    return value.filter(Boolean).join("\n");
  }

  if (typeof value === "object" && value !== null) {
    return (
      value.zh ||
      value.tc ||
      value.hk ||
      value.tw ||
      value.text ||
      value.value ||
      Object.values(value).filter(Boolean).join("\n")
    );
  }

  return value;
}

function getPossibleCardKeys(card) {
  const rawKeys = [
    card?.id,
    card?.cardNo,
    card?.card_no,
    getCardNo(card),
    getBaseCardId(card?.id),
    getBaseCardId(card?.cardNo),
    getBaseCardId(card?.card_no),
    getBaseCardId(getCardNo(card))
  ];

  return Array.from(
    new Set(
      rawKeys
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  );
}

function getCardQaFlexible(card) {
  const direct = getCardQa(card);

  if (Array.isArray(direct) && direct.length > 0) {
    return direct;
  }

  const keys = getPossibleCardKeys(card);
  const zhName = getCardNameZh(card);
  const jpName = getCardNameJp(card);

  const searchWords = Array.from(
    new Set(
      [...keys, zhName, jpName]
        .map((item) => String(item || "").trim())
        .filter(Boolean)
    )
  );

  const matched = [];

  Object.entries(cardQa || {}).forEach(([qaKey, list]) => {
    if (!Array.isArray(list)) return;

    const qaKeyBase = getBaseCardId(qaKey);

    const keyMatched = keys.some((key) => {
      return qaKey === key || qaKeyBase === key || qaKey === getBaseCardId(key);
    });

    list.forEach((item) => {
      const text = [
        item.id,
        item.updatedAt,
        item.question,
        item.answer,
        item.source
      ]
        .filter(Boolean)
        .join(" ");

      const textMatched = searchWords.some((word) => text.includes(word));

      if (keyMatched || textMatched) {
        matched.push(item);
      }
    });
  });

  const seen = new Set();

  return matched.filter((item) => {
    const key = [
      item.id || "",
      item.updatedAt || "",
      item.question || "",
      item.answer || ""
    ].join("|");

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function CardPlaceholder({ card }) {
  return (
    <div className="hp-modal-card-placeholder">
      <span>{getCardCost(card)}</span>

      <div>
        <strong>{getCardNameZh(card)}</strong>
        <br />
        <small>{getCardNo(card)}</small>
      </div>
    </div>
  );
}

function CardImageWithFallback({ card }) {
  const cardNo = getCardNo(card);

  const imageCandidates = [
    card?.image,
    card?.imageUrl,
    card?.imageURL,
    card?.image_url,
    card?.src,
    card?.url,
    card?.cardImage,
    card?.card_image,
    card?.thumbnail,
    card?.thumbnailUrl,
    card?.thumbnail_url,
    cardNo ? `/cards/${cardNo}.png` : "",
    cardNo ? `/cards/${cardNo}.jpg` : "",
    cardNo ? `/images/cards/${cardNo}.png` : "",
    cardNo ? `/images/cards/${cardNo}.jpg` : "",
    cardNo
      ? `https://tcg.movic.jp/harrypotter/card-management/storage/cards/${cardNo}`
      : ""
  ].filter(Boolean);

  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = imageCandidates[imageIndex];

  if (!currentImage) {
    return <CardPlaceholder card={card} />;
  }

  return (
    <img
      className="hp-modal-card-image"
      src={currentImage}
      alt={getCardNameZh(card)}
      onError={() => {
        if (imageIndex < imageCandidates.length - 1) {
          setImageIndex((current) => current + 1);
        }
      }}
    />
  );
}

function QaSection({ card }) {
  const qaList = getCardQaFlexible(card);

  return (
    <div className="hp-modal-qa">
      <h3>
        Q<span>&amp;</span>A
      </h3>

      {qaList.length > 0 ? (
        <div className="hp-modal-qa-list">
          {qaList.map((item, index) => (
            <div
              className="hp-modal-qa-item"
              key={`${item.id || "qa"}-${item.updatedAt || "date"}-${index}`}
            >
              <div className="hp-modal-qa-head">
                <strong>{item.id || `Q:${index + 1}`}</strong>
                {item.updatedAt && <span>{item.updatedAt} 更新</span>}
              </div>

              <div className="hp-modal-qa-body">
                <p>
                  <b>Q</b>
                  <span>{item.question || "—"}</span>
                </p>

                <p>
                  <b>A</b>
                  <span>{item.answer || "—"}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>暫時沒有官方 Q&amp;A。</p>
      )}
    </div>
  );
}

function CardModal({ card, products = [], onClose }) {
  if (!card) return null;

  const effect = getCardEffect(card);

  return (
    <div className="hp-modal-backdrop" onClick={onClose}>
      <div className="hp-card-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="hp-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="hp-modal-main">
          <div className="hp-modal-card-image-area">
            <CardImageWithFallback card={card} />
          </div>

          <div className="hp-modal-info-area">
            <h2 className="hp-modal-card-title">{getCardNameZh(card)}</h2>

            <div className="hp-modal-original-name">
              {getCardNameJp(card) || "—"}
            </div>

            <div className="hp-modal-basic-meta">
              <span>{getCardNo(card) || "—"}</span>
              <strong>{getCardRarity(card)}</strong>
            </div>

            <div className="hp-modal-stats">
              <div>
                <span>Cost</span>
                <strong>{getCardCost(card)}</strong>
              </div>

              <div>
                <span>AP</span>
                <strong>{getCardAp(card)}</strong>
              </div>

              <div>
                <span>DP</span>
                <strong>{getCardDp(card)}</strong>
              </div>
            </div>

            <div className="hp-modal-line" />

            <div className="hp-modal-detail-list">
              <div className="hp-modal-detail-row">
                <span>卡牌種類</span>
                <p>{getCardType(card)}</p>
              </div>

              <div className="hp-modal-detail-row">
                <span>學院</span>
                <p>{getCardHouse(card)}</p>
              </div>

              <div className="hp-modal-detail-row">
                <span>特徵</span>
                <p>{getCardTags(card)}</p>
              </div>

              <div className="hp-modal-detail-row">
                <span>收錄</span>
                <p>{getCardProductName(card, products)}</p>
              </div>
            </div>

            <div className="hp-modal-text-section">
              <span className="hp-modal-section-label">效果</span>

              <div className={effect ? "hp-modal-effect-box" : "hp-modal-effect-box muted"}>
                {effect || "此卡暫時沒有記錄效果。"}
              </div>
            </div>
          </div>
        </div>

        <QaSection card={card} />
      </div>
    </div>
  );
}

export default CardModal;