import { useEffect, useMemo, useState } from "react";
import UnionArenaCardModal from "./UnionArenaCardModal";

const CARD_DATA_URL = "/data/union-arena-jp/cards.zh.json";
const ALL_VALUE = "all";

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getImageSrc(card) {
  const imageUrl = safeText(card.imageUrl);
  const imageFile = safeText(card.imageFile);

  // Vercel / GitHub ?函蔡???芸?雿輻摰?? URL
  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // ?祆???鋆?images ????fallback ?唳?啣???
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

function buildOptions(cards, getter, defaultLabel = "?券") {
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
    { value: ALL_VALUE, label: "?券??" },
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
          throw new Error("cards.zh.json ?澆?銝 array");
        }

        if (!cancelled) {
          setCards(data.map(normalizeCard));
        }
      } catch (error) {
        console.error("Failed to load UNION ARENA cards:", error);

        if (!cancelled) {
          setCards([]);
          setLoadError(
            "霈??UNION ARENA cards.zh.json 憭望???蝣箄? public/data/union-arena-jp/cards.zh.json 撌脣??具?
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
    () => buildOptions(cards, (card) => card.rarity, "?券蝔?漲"),
    [cards]
  );

  const typeOptions = useMemo(
    () =>
      buildOptions(
        cards,
        (card) => card.cardTypeZh || card.cardTypeJp,
        "?券憿?"
      ),
    [cards]
  );

  const featureOptions = useMemo(
    () =>
      buildOptions(
        cards,
        (card) => card.featureZh || card.featureJp,
        "?券?孵噩"
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
        <h1>?∠??”</h1>
        <p>
          ?? UNION ARENA ?交??????????????
          銝血??乩葉??雿??拙振?亥岷?????
        </p>
      </div>

      <div className="ua-filter-panel ua-card-search-panel">
        <label className="ua-keyword-field">
          <span>?摮?撠?/span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="頛詨?∪????????摮敺?.."
          />
        </label>

        <label>
          <span>??</span>
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
          <span>蝔?漲</span>
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
          <span>憿?</span>
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
          <span>?孵噩</span>
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
            ??
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={resetFilters}
          >
            ?身
          </button>
        </div>
      </div>

      {loading && (
        <div className="result-bar">
          <strong>甇?霈??UNION ARENA ?∠?鞈??色?/strong>
        </div>
      )}

      {loadError && (
        <div className="notice-box warning">
          <strong>鞈?霈?仃??/strong>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <div className="result-bar">
          <strong>??蝯?嚗filteredCards.length} 撘?/strong>
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

                <h2>{card.nameZh || card.nameJp || "?芸???}</h2>

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
                  <p className="ua-card-preview-text muted">?⊥???摮?/p>
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
