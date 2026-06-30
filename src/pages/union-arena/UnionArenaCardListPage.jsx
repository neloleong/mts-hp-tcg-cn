import { useEffect, useMemo, useState } from "react";
import UnionArenaCardModal from "../../components/union-arena/UnionArenaCardModal";

const CARD_DATA_URL = "/data/union-arena-jp/cards.zh.json";
const ALL_VALUE = "all";

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getImageSrc(card) {
  const imageUrl = safeText(card.imageUrl);
  const imageFile = safeText(card.imageFile);

  // Vercel / GitHub 部署時，優先使用官方圖片 URL
  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // 本機有複製 images 時，才 fallback 到本地圖片
  if (imageFile) {
    const normalizedPath = imageFile.replace(/\\/g, "/");

    if (normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith("data/")) {
      return `/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("images/")) {
      return `/data/union-arena-jp/${normalizedPath}`;
    }

    return `/data/union-arena-jp/images/${normalizedPath.split("/").pop()}`;
  }

  return "";
}

function buildOptions(cards, getter, defaultLabel = "全部") {
  const map = new Map();

  cards.forEach((card) => {
    const value = safeText(getter(card));

    if (!value) return;

    if (!map.has(value)) {
      map.set(value, value);
    }
  });

  return [
    { value: ALL_VALUE, label: defaultLabel },
    ...Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "ja"))
  ];
}

function buildProductOptions(cards) {
  const map = new Map();

  cards.forEach((card) => {
    const id = safeText(card.productId || card.productCode);
    const label = safeText(card.productNameZh || card.productNameJp || id);

    if (!id) return;

    if (!map.has(id)) {
      map.set(id, label);
    }
  });

  return [
    { value: ALL_VALUE, label: "全部商品" },
    ...Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "ja"))
  ];
}

function normalizeCard(row, index) {
  return {
    id: safeText(row.id) || safeText(row.cardNo) || `ua-card-${index}`,

    productId: safeText(row.productId),
    productCode: safeText(row.productCode),
    productNameJp: safeText(row.productNameJp),
    productNameZh: safeText(row.productNameZh),

    cardNo: safeText(row.cardNo),
    cardCode: safeText(row.cardCode),

    nameJp: safeText(row.nameJp),
    nameKanaJp: safeText(row.nameKanaJp),
    nameZh: safeText(row.nameZh),

    rarity: safeText(row.rarity),

    cardTypeJp: safeText(row.cardTypeJp),
    cardTypeZh: safeText(row.cardTypeZh),

    colorJp: safeText(row.colorJp),
    colorZh: safeText(row.colorZh),

    cost: safeText(row.cost),
    ap: safeText(row.ap),
    bp: safeText(row.bp),
    generatedEnergy: safeText(row.generatedEnergy),

    featureJp: safeText(row.featureJp),
    featureZh: safeText(row.featureZh),

    effectJp: safeText(row.effectJp),
    effectZh: safeText(row.effectZh),

    triggerJp: safeText(row.triggerJp),
    triggerZh: safeText(row.triggerZh),
    triggerTypeZh: safeText(row.triggerTypeZh),

    imageFile: safeText(row.imageFile),
    imageUrl: safeText(row.imageUrl),
    sourceUrl: safeText(row.sourceUrl),

    enrichedStatus: safeText(row.enrichedStatus),
    translationStatus: safeText(row.translationStatus),
    searchText: safeText(row.searchText)
  };
}

function UnionArenaCardListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [productId, setProductId] = useState(ALL_VALUE);
  const [rarity, setRarity] = useState(ALL_VALUE);
  const [cardType, setCardType] = useState(ALL_VALUE);
  const [feature, setFeature] = useState(ALL_VALUE);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(CARD_DATA_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("cards.zh.json 格式不是 array");
        }

        if (!cancelled) {
          setCards(data.map(normalizeCard));
        }
      } catch (error) {
        console.error("Failed to load UNION ARENA cards:", error);

        if (!cancelled) {
          setCards([]);
          setLoadError(
            "讀取 UNION ARENA cards.zh.json 失敗。請確認 public/data/union-arena-jp/cards.zh.json 已存在。"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      cancelled = true;
    };
  }, []);

  const productOptions = useMemo(() => buildProductOptions(cards), [cards]);

  const rarityOptions = useMemo(
    () => buildOptions(cards, (card) => card.rarity, "全部稀有度"),
    [cards]
  );

  const typeOptions = useMemo(
    () =>
      buildOptions(
        cards,
        (card) => card.cardTypeZh || card.cardTypeJp,
        "全部類型"
      ),
    [cards]
  );

  const featureOptions = useMemo(
    () =>
      buildOptions(
        cards,
        (card) => card.featureZh || card.featureJp,
        "全部特徵"
      ),
    [cards]
  );

  const filteredCards = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return cards.filter((card) => {
      const searchText = [
        card.searchText,
        card.cardNo,
        card.cardCode,
        card.productCode,
        card.productNameJp,
        card.productNameZh,
        card.nameJp,
        card.nameKanaJp,
        card.nameZh,
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
        .join(" ")
        .toLowerCase();

      const matchKeyword = !q || searchText.includes(q);

      const matchProduct =
        productId === ALL_VALUE ||
        card.productId === productId ||
        card.productCode === productId;

      const matchRarity = rarity === ALL_VALUE || card.rarity === rarity;

      const currentType = card.cardTypeZh || card.cardTypeJp;
      const matchType = cardType === ALL_VALUE || currentType === cardType;

      const currentFeature = card.featureZh || card.featureJp;
      const matchFeature = feature === ALL_VALUE || currentFeature === feature;

      return (
        matchKeyword &&
        matchProduct &&
        matchRarity &&
        matchType &&
        matchFeature
      );
    });
  }, [cards, keyword, productId, rarity, cardType, feature]);

  function resetFilters() {
    setKeyword("");
    setProductId(ALL_VALUE);
    setRarity(ALL_VALUE);
    setCardType(ALL_VALUE);
    setFeature(ALL_VALUE);
  }

  return (
    <section className="page-section union-arena-card-list-page">
      <div className="section-heading">
        <p className="eyebrow">UNION ARENA</p>
        <h1>卡牌列表</h1>
        <p>
          搜尋 UNION ARENA 日文版卡牌資料。卡牌資料保留日文原文，
          並加入中文欄位作玩家查詢與收藏參考。
        </p>
      </div>

      <div className="ua-filter-panel ua-card-search-panel">
        <label className="ua-keyword-field">
          <span>關鍵字搜尋</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="輸入卡名、卡號、商品、效果文字、特徵..."
          />
        </label>

        <label>
          <span>商品</span>
          <select
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          >
            {productOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>稀有度</span>
          <select
            value={rarity}
            onChange={(event) => setRarity(event.target.value)}
          >
            {rarityOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>類型</span>
          <select
            value={cardType}
            onChange={(event) => setCardType(event.target.value)}
          >
            {typeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>特徵</span>
          <select
            value={feature}
            onChange={(event) => setFeature(event.target.value)}
          >
            {featureOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <div className="ua-filter-actions">
          <button type="button" className="primary-btn">
            搜尋
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={resetFilters}
          >
            重設
          </button>
        </div>
      </div>

      {loading && (
        <div className="result-bar">
          <strong>正在讀取 UNION ARENA 卡牌資料……</strong>
        </div>
      )}

      {loadError && (
        <div className="notice-box warning">
          <strong>資料讀取失敗</strong>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <div className="result-bar">
          <strong>搜尋結果：{filteredCards.length} 張</strong>
        </div>
      )}

      <div className="ua-card-grid ua-card-grid-rich">
        {filteredCards.map((card) => {
          const imageSrc = getImageSrc(card);

          return (
            <article
              className="ua-card"
              key={card.id}
              onClick={() => setSelectedCard(card)}
            >
              <div className="ua-card-image">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={card.nameJp || card.cardNo}
                    loading="lazy"
                  />
                ) : (
                  <span>No Image</span>
                )}
              </div>

              <div className="ua-card-body">
                <div className="ua-card-topline">
                  <span className="ua-card-no">{card.cardNo || "No."}</span>

                  {card.rarity && (
                    <span className="ua-rarity-badge">{card.rarity}</span>
                  )}
                </div>

                <h2>{card.nameZh || card.nameJp || "未命名卡牌"}</h2>

                {card.nameJp && card.nameZh !== card.nameJp && (
                  <p className="ua-card-jp-name">{card.nameJp}</p>
                )}

                <div className="ua-card-meta">
                  {(card.cardTypeZh || card.cardTypeJp) && (
                    <span>{card.cardTypeZh || card.cardTypeJp}</span>
                  )}

                  {(card.featureZh || card.featureJp) && (
                    <span>{card.featureZh || card.featureJp}</span>
                  )}
                </div>

                <div className="ua-card-stats">
                  {card.cost && <span>Cost {card.cost}</span>}
                  {card.ap && <span>AP {card.ap}</span>}
                  {card.bp && <span>BP {card.bp}</span>}
                </div>

                {(card.effectZh && card.effectZh !== "-") || card.triggerZh ? (
                  <p className="ua-card-preview-text">
                    {card.effectZh && card.effectZh !== "-"
                      ? card.effectZh
                      : card.triggerZh}
                  </p>
                ) : (
                  <p className="ua-card-preview-text muted">無效果文字</p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selectedCard && (
        <UnionArenaCardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </section>
  );
}

export default UnionArenaCardListPage;