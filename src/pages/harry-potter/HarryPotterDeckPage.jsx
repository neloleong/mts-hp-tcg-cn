// src/pages/DeckPage.jsx

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import CardModal from "../../components/CardModal";
import { sampleCards } from "../../data/cards";
import { products } from "../../data/products";
import {
  MAIN_DECK_LIMIT,
  SAME_CARD_LIMIT,
  canAddMainDeckCard,
  getBaseCardId,
  getCardCost,
  getCardHouse,
  getCardImage,
  getCardJapaneseName,
  getCardName,
  getCardRarity,
  getCardType,
  getCostCurve,
  getDeckCards,
  getHouseDistribution,
  getMainDeckCards,
  getMainDeckTotal,
  getRarityDistribution,
  getSameBaseCardTotal,
  getTypeDistribution,
  isMpCard,
  isPartnerCard
} from "../../utils/deckUtils";

function normalizeTags(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[／,/，、]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function inferSeries(cardNo, product) {
  if (product === "booster-philosophers-stone-part-1") return "booster-01";
  if (product === "starter-gryffindor") return "starter-s01";
  if (product === "starter-slytherin") return "starter-s02";
  if (product === "promo-pr") return "promo-pr";

  if (String(cardNo).startsWith("S01")) return "starter-s01";
  if (String(cardNo).startsWith("S02")) return "starter-s02";
  if (String(cardNo).startsWith("PR")) return "promo-pr";

  if (
    String(cardNo).startsWith("01") ||
    String(cardNo).startsWith("Pt") ||
    String(cardNo).startsWith("MP")
  ) {
    return "booster-01";
  }

  return "";
}

function normalizeType(type) {
  if (!type) return "其他";

  if (type === "夥伴卡") return "Partner卡";
  if (type === "Magic 卡") return "Magic卡";
  if (type === "道具卡") return "Item卡";
  if (type === "地點卡") return "Location卡";

  return type;
}

function normalizeCard(row) {
  const cardNo = row.card_no || row.cardNo || row.id || "";
  const product =
    row.product ||
    row.product_id ||
    row.productId ||
    row.pack ||
    "booster-philosophers-stone-part-1";

  const nameZh = row.nameZh || row.name_zh || row.name || "未命名卡牌";

  const nameJp =
    row.nameJp ||
    row.name_jp ||
    row.jpName ||
    row.japaneseName ||
    row.nameOriginal ||
    row.name_original ||
    "";

  const effectZh =
    row.effectZh ||
    row.effect_zh ||
    row.effect ||
    row.effectText ||
    row.cardEffect ||
    row.skill ||
    row.ability ||
    row.rulesText ||
    row.ruleText ||
    row.descriptionZh ||
    row.description ||
    row.content ||
    row.text ||
    row.body ||
    "";

  const effectOriginal =
    row.effectOriginal ||
    row.effect_original ||
    row.effectJp ||
    row.effect_jp ||
    row.originalEffect ||
    "";

  const tags = normalizeTags(row.tags || row.tag || row.labels || row.traits);

  const image =
    row.image ||
    row.imageUrl ||
    row.image_url ||
    row.imageURL ||
    row.src ||
    row.url ||
    row.cardImage ||
    row.card_image ||
    row.thumbnail ||
    row.thumbnailUrl ||
    row.thumbnail_url ||
    (cardNo ? `/cards/${cardNo}.png` : "");

  return {
    ...row,

    id: row.id?.toString() || cardNo,
    cardNo,

    name: nameZh,
    nameZh,
    zhName: nameZh,

    nameJp,
    jpName: nameJp,
    japaneseName: nameJp,
    nameOriginal: nameJp,
    originalName: nameJp,

    nameEn: row.nameEn || row.name_en || "",

    type: normalizeType(row.card_type || row.type || "其他"),
    house: row.house || row.attribute || "中立",

    rarity:
      row.rarity ||
      (String(cardNo).startsWith("S0")
        ? "ST"
        : String(cardNo).startsWith("PR")
          ? "PR"
          : "N"),

    cost:
      row.cost === null || row.cost === undefined || row.cost === ""
        ? ""
        : Number(row.cost),

    mp:
      row.mp === null || row.mp === undefined || row.mp === ""
        ? ""
        : Number(row.mp),

    ap:
      row.ap === null || row.ap === undefined || row.ap === ""
        ? ""
        : Number(row.ap),

    AP:
      row.ap === null || row.ap === undefined || row.ap === ""
        ? ""
        : Number(row.ap),

    dp:
      row.dp === null || row.dp === undefined || row.dp === ""
        ? ""
        : Number(row.dp),

    DP:
      row.dp === null || row.dp === undefined || row.dp === ""
        ? ""
        : Number(row.dp),

    traits:
      row.traits ||
      row.trait ||
      row.features ||
      row.feature ||
      row.tags ||
      "",

    tags,

    product,
    series: row.series || row.series_id || row.seriesId || inferSeries(cardNo, product),

    image,
    imageUrl: image,
    imageURL: image,
    image_url: image,

    effect: effectZh,
    effectZh,
    effectOriginal,

    isParallel:
      Boolean(row.is_parallel) ||
      Boolean(row.isParallel) ||
      /[a-z]$/i.test(String(cardNo))
  };
}

function getSearchableEffect(card) {
  return [
    card.effect,
    card.effectZh,
    card.effectOriginal,
    card.effectText,
    card.text,
    card.description
  ]
    .filter(Boolean)
    .join(" ");
}

function DeckSmallCard({ card, count, onAdd, onRemove, onSelect }) {
  const image = getCardImage(card);

  return (
    <div className="deck-small-card" data-count={count}>
      <button
        type="button"
        className="deck-small-card-image"
        onClick={() => onSelect(card)}
      >
        {image ? (
          <img src={image} alt={getCardName(card)} />
        ) : (
          <div className="deck-mini-placeholder">
            <strong>{getCardName(card)}</strong>
            <span>{card.cardNo || card.id}</span>
          </div>
        )}
      </button>

      <div className="deck-small-card-body">
        <button
          type="button"
          className="deck-card-title-button"
          onClick={() => onSelect(card)}
        >
          <div className="deck-card-id">{card.cardNo || card.id}</div>
          <strong>{getCardName(card)}</strong>
          <span>{getCardType(card)}｜Cost {getCardCost(card) || "-"}</span>
        </button>

        <div className="deck-count-control">
          <button type="button" onClick={() => onRemove(card)}>
            −
          </button>
          <b>{count}</b>
          <button type="button" onClick={() => onAdd(card)}>
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function DeckSlot({ title, card, emptyText, onClear, onSelect }) {
  const image = getCardImage(card);

  return (
    <div className="deck-special-slot">
      <div className="deck-special-slot-head">
        <span>{title}</span>

        {card && (
          <button type="button" onClick={onClear}>
            清除
          </button>
        )}
      </div>

      {card ? (
        <button
          type="button"
          className="deck-special-card deck-special-card-button"
          onClick={() => onSelect(card)}
        >
          <div className="deck-special-image">
            {image ? (
              <img src={image} alt={getCardName(card)} />
            ) : (
              <div className="deck-mini-placeholder">
                <strong>{getCardName(card)}</strong>
                <span>{card.cardNo || card.id}</span>
              </div>
            )}
          </div>

          <div>
            <strong>{getCardName(card)}</strong>
            <p>{getCardJapaneseName(card) || card.nameJp || "—"}</p>
            <span>
              {card.cardNo || card.id}｜{getCardRarity(card) || "—"}
            </span>
          </div>
        </button>
      ) : (
        <div className="deck-special-empty">{emptyText}</div>
      )}
    </div>
  );
}

function StatBlock({ title, items }) {
  return (
    <div className="deck-stat-block">
      <h3>{title}</h3>

      {items.length > 0 ? (
        <div className="deck-stat-list">
          {items.map(([label, value]) => (
            <div className="deck-stat-row" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p>暫時沒有資料</p>
      )}
    </div>
  );
}

function CardPoolItem({
  card,
  count,
  sameBaseTotal,
  onAdd,
  onSetPartner,
  onSetMp,
  onSelect
}) {
  const image = getCardImage(card);
  const type = getCardType(card);

  return (
    <div className="deck-pool-card">
      <button
        type="button"
        className="deck-pool-image deck-pool-image-button"
        onClick={() => onSelect(card)}
      >
        {image ? (
          <img src={image} alt={getCardName(card)} />
        ) : (
          <div className="deck-mini-placeholder">
            <strong>{getCardName(card)}</strong>
            <span>{card.cardNo || card.id}</span>
          </div>
        )}
      </button>

      <div className="deck-pool-body">
        <button
          type="button"
          className="deck-card-title-button"
          onClick={() => onSelect(card)}
        >
          <div className="deck-card-id">{card.cardNo || card.id}</div>
          <h3>{getCardName(card)}</h3>
          <p>{getCardJapaneseName(card) || card.nameJp || "—"}</p>
        </button>

        <div className="deck-pool-tags">
          <span>{type || "—"}</span>
          <span>{getCardHouse(card) || "—"}</span>
          <span>{getCardRarity(card) || "—"}</span>
          <span>Cost {getCardCost(card) || "-"}</span>
        </div>

        <div className="deck-pool-status">
          <span>已放入：{count}</span>

          {!isPartnerCard(card) && !isMpCard(card) && (
            <span>
              同卡合計：{sameBaseTotal}/{SAME_CARD_LIMIT}
            </span>
          )}
        </div>

        {isPartnerCard(card) ? (
          <button
            type="button"
            className="deck-add-btn"
            onClick={() => onSetPartner(card)}
          >
            設為 Partner
          </button>
        ) : isMpCard(card) ? (
          <button
            type="button"
            className="deck-add-btn"
            onClick={() => onSetMp(card)}
          >
            設為 MP
          </button>
        ) : (
          <button
            type="button"
            className="deck-add-btn"
            onClick={() => onAdd(card)}
          >
            加入牌組
          </button>
        )}
      </div>
    </div>
  );
}

function DeckPage() {
  const noticeTimerRef = useRef(null);
  const pdfRef = useRef(null);

  const [deck, setDeck] = useState({});
  const [partnerCardId, setPartnerCardId] = useState("");
  const [mpCardId, setMpCardId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");
  const [houseFilter, setHouseFilter] = useState("全部");
  const [selectedCard, setSelectedCard] = useState(null);
  const [notice, setNotice] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const cardList = useMemo(() => sampleCards.map(normalizeCard), []);

  const partnerCard = useMemo(
    () => cardList.find((card) => card.id === partnerCardId),
    [cardList, partnerCardId]
  );

  const mpCard = useMemo(
    () => cardList.find((card) => card.id === mpCardId),
    [cardList, mpCardId]
  );

  const mainDeckTotal = useMemo(
    () => getMainDeckTotal(deck, cardList),
    [deck, cardList]
  );

  const deckCards = useMemo(
    () => getDeckCards(deck, cardList),
    [deck, cardList]
  );

  const mainDeckCards = useMemo(
    () => getMainDeckCards(deck, cardList),
    [deck, cardList]
  );

  const costCurve = useMemo(
    () => getCostCurve(deck, cardList),
    [deck, cardList]
  );

  const typeDistribution = useMemo(
    () => getTypeDistribution(deck, cardList),
    [deck, cardList]
  );

  const houseDistribution = useMemo(
    () => getHouseDistribution(deck, cardList),
    [deck, cardList]
  );

  const rarityDistribution = useMemo(
    () => getRarityDistribution(deck, cardList),
    [deck, cardList]
  );

  const cardTypes = useMemo(() => {
    const values = new Set(cardList.map(getCardType).filter(Boolean));
    return ["全部", ...Array.from(values)];
  }, [cardList]);

  const houses = useMemo(() => {
    const values = new Set(cardList.map(getCardHouse).filter(Boolean));
    return ["全部", ...Array.from(values)];
  }, [cardList]);

  const filteredCards = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return cardList.filter((card) => {
      const text = [
        card.id,
        card.cardNo,
        getBaseCardId(card.id),
        getCardName(card),
        card.nameZh,
        card.nameJp,
        card.nameOriginal,
        getCardType(card),
        getCardHouse(card),
        getCardRarity(card),
        Array.isArray(card.tags) ? card.tags.join(" ") : "",
        getSearchableEffect(card)
      ]
        .join(" ")
        .toLowerCase();

      const matchKeyword = !lowerKeyword || text.includes(lowerKeyword);
      const matchType = typeFilter === "全部" || getCardType(card) === typeFilter;
      const matchHouse =
        houseFilter === "全部" || getCardHouse(card) === houseFilter;

      return matchKeyword && matchType && matchHouse;
    });
  }, [cardList, keyword, typeFilter, houseFilter]);

  function showNotice(message) {
    setNotice(message);

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice("");
    }, 2600);
  }

  function addCard(card) {
    if (isPartnerCard(card)) {
      setPartnerCardId(card.id);
      showNotice(`已設定 Partner：${getCardName(card)}`);
      return;
    }

    if (isMpCard(card)) {
      setMpCardId(card.id);
      showNotice(`已設定 MP：${getCardName(card)}`);
      return;
    }

    const result = canAddMainDeckCard(deck, cardList, card);

    if (!result.ok) {
      showNotice(result.message);
      return;
    }

    setDeck((prev) => ({
      ...prev,
      [card.id]: Number(prev[card.id] || 0) + 1
    }));
  }

  function removeCard(card) {
    setDeck((prev) => {
      const current = Number(prev[card.id] || 0);

      if (current <= 1) {
        const next = { ...prev };
        delete next[card.id];
        return next;
      }

      return {
        ...prev,
        [card.id]: current - 1
      };
    });
  }

  function clearDeck() {
    const ok = window.confirm("確定要清空主牌組？Partner 和 MP 不會被清除。");
    if (!ok) return;
    setDeck({});
  }

  function clearAll() {
    const ok = window.confirm("確定要清空整個牌組？包括 Partner、MP 和主牌組。");
    if (!ok) return;

    setDeck({});
    setPartnerCardId("");
    setMpCardId("");
  }

  async function exportDeckPdf() {
    if (!pdfRef.current) {
      showNotice("找不到可以匯出的牌組內容。");
      return;
    }

    try {
      setIsExporting(true);
      showNotice("正在產生 PDF，請稍等...");

      await new Promise((resolve) => {
        window.setTimeout(resolve, 250);
      });

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false
      });

      const imageData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      let heightLeft = imageHeight;
      let position = 0;

      pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "PNG", 0, position, imageWidth, imageHeight);
        heightLeft -= pageHeight;
      }

      const dateText = new Date().toISOString().slice(0, 10);
      pdf.save(`MTS_Harry_Potter_Deck_${dateText}.pdf`);

      showNotice("PDF 已產生並下載。");
    } catch (error) {
      console.error("PDF export failed:", error);
      showNotice("PDF 產生失敗，請檢查卡圖是否正常載入。");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className={`deck-page ${isExporting ? "deck-exporting" : ""}`}>
      <div className="page-title-block">
        <div className="eyebrow">Deck Builder</div>
        <h1>牌組建立</h1>
        <p>
          從卡牌列表加入牌組；主牌組最多 {MAIN_DECK_LIMIT} 張，不包括 Partner 卡和 MP 卡。
          同一張卡包含 a、b、異圖版合計最多 {SAME_CARD_LIMIT} 張。
        </p>
      </div>

      {notice && <div className="deck-notice">{notice}</div>}

      <div className="deck-actions-bar">
        <button
          type="button"
          className="primary-btn"
          onClick={exportDeckPdf}
          disabled={isExporting}
        >
          {isExporting ? "正在產生 PDF..." : "匯出 PDF 檔案"}
        </button>

        <button type="button" className="secondary-btn" onClick={clearDeck}>
          清空主牌組
        </button>

        <button type="button" className="secondary-btn" onClick={clearAll}>
          清空全部
        </button>
      </div>

      <div className="deck-pdf-area" ref={pdfRef}>
        <div className="deck-pdf-header">
          <h2>MTS&apos; Harry Potter TCG 牌組表</h2>
          <p>
            主牌組 {mainDeckTotal}/{MAIN_DECK_LIMIT} 張｜
            Partner：{partnerCard ? getCardName(partnerCard) : "未選"}｜
            MP：{mpCard ? getCardName(mpCard) : "未選"}
          </p>
        </div>

        <div className="deck-special-row">
          <DeckSlot
            title="Partner 卡"
            card={partnerCard}
            emptyText="尚未選擇 Partner 卡"
            onClear={() => setPartnerCardId("")}
            onSelect={setSelectedCard}
          />

          <DeckSlot
            title="MP 卡"
            card={mpCard}
            emptyText="尚未選擇 MP 卡"
            onClear={() => setMpCardId("")}
            onSelect={setSelectedCard}
          />
        </div>

        <div className="deck-summary-panel">
          <div>
            <span>主牌組張數</span>
            <strong>
              {mainDeckTotal}/{MAIN_DECK_LIMIT}
            </strong>
          </div>

          <div>
            <span>已選卡種</span>
            <strong>{mainDeckCards.length}</strong>
          </div>

          <div>
            <span>Partner</span>
            <strong>{partnerCard ? "已選" : "未選"}</strong>
          </div>

          <div>
            <span>MP</span>
            <strong>{mpCard ? "已選" : "未選"}</strong>
          </div>
        </div>

        <div className="deck-stat-grid">
          <StatBlock title="Cost 費用曲線" items={costCurve} />
          <StatBlock title="卡牌種類" items={typeDistribution} />
          <StatBlock title="學院分佈" items={houseDistribution} />
          <StatBlock title="稀有度分佈" items={rarityDistribution} />
        </div>

        <div className="deck-section-title">
          <h2>目前主牌組</h2>
          <span>{mainDeckTotal} 張</span>
        </div>

        {deckCards.length > 0 ? (
          <div className="deck-current-grid">
            {deckCards.map(({ card, count }) => (
              <DeckSmallCard
                key={card.id}
                card={card}
                count={count}
                onAdd={addCard}
                onRemove={removeCard}
                onSelect={setSelectedCard}
              />
            ))}
          </div>
        ) : (
          <div className="empty-box">
            <h3>牌組仍然是空的</h3>
            <p>請在下方卡池選擇卡牌加入牌組。</p>
          </div>
        )}
      </div>

      <div className="deck-section-title deck-pool-title">
        <h2>卡池選擇</h2>
        <span>{filteredCards.length} 張卡</span>
      </div>

      <div className="deck-filter-panel">
        <label>
          <span>搜尋</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="輸入卡名、編號、日文名、類型、效果"
          />
        </label>

        <label>
          <span>卡牌種類</span>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            {cardTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>學院</span>
          <select
            value={houseFilter}
            onChange={(event) => setHouseFilter(event.target.value)}
          >
            {houses.map((house) => (
              <option key={house} value={house}>
                {house}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="deck-pool-grid">
        {filteredCards.map((card) => (
          <CardPoolItem
            key={card.id}
            card={card}
            count={Number(deck[card.id] || 0)}
            sameBaseTotal={getSameBaseCardTotal(deck, card.id)}
            onAdd={addCard}
            onSetPartner={(target) => {
              setPartnerCardId(target.id);
              showNotice(`已設定 Partner：${getCardName(target)}`);
            }}
            onSetMp={(target) => {
              setMpCardId(target.id);
              showNotice(`已設定 MP：${getCardName(target)}`);
            }}
            onSelect={setSelectedCard}
          />
        ))}
      </div>

      <CardModal
        card={selectedCard}
        products={products}
        onClose={() => setSelectedCard(null)}
      />
    </section>
  );
}

export default DeckPage;