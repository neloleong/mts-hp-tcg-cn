import { useEffect, useMemo, useState } from "react";

const CARD_DATA_URL = "/data/union-arena-jp/cards.json";

const ALL_VALUE = "all";

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function pickFirst(row, keys, fallback = "") {
  for (const key of keys) {
    if (row && row[key] !== null && row[key] !== undefined && row[key] !== "") {
      return row[key];
    }
  }

  return fallback;
}

function normalizeUnionArenaCard(row, index) {
  const cardNo = safeText(
    pickFirst(row, [
      "card_no",
      "cardNo",
      "card_number",
      "cardNumber",
      "number",
      "no"
    ])
  );

  const productId = safeText(
    pickFirst(row, ["product_id", "productId", "product", "product_code"])
  );

  const productName = safeText(
    pickFirst(row, [
      "product_name",
      "productName",
      "product_title",
      "productTitle",
      "title"
    ])
  );

  const imageFile = safeText(
    pickFirst(row, [
      "image_file",
      "imageFile",
      "image_path",
      "imagePath",
      "local_image",
      "localImage"
    ])
  );

  const imageUrl = safeText(
    pickFirst(row, ["image_url", "imageUrl", "image", "img"])
  );

  return {
    id:
      safeText(pickFirst(row, ["id", "card_id", "cardId"])) ||
      `${productId || "ua"}-${cardNo || index}`,
    cardNo,
    name: safeText(
      pickFirst(row, [
        "name",
        "card_name",
        "cardName",
        "name_jp",
        "nameJp",
        "name_ja",
        "nameJa"
      ], "未命名卡牌")
    ),
    productId,
    productName,
    rarity: safeText(pickFirst(row, ["rarity", "rare", "rarity_text"])),
    cardType: safeText(
      pickFirst(row, ["card_type", "cardType", "type", "category"])
    ),
    color: safeText(pickFirst(row, ["color", "colour"])),
    cost: safeText(pickFirst(row, ["cost", "energy", "need_energy"])),
    bp: safeText(pickFirst(row, ["bp", "power", "battle_point"])),
    ap: safeText(pickFirst(row, ["ap", "action_point"])),
    effect: safeText(
      pickFirst(row, [
        "effect",
        "effect_text",
        "effectText",
        "description",
        "text"
      ])
    ),
    imageFile,
    imageUrl,
    raw: row
  };
}

function getImageSrc(card) {
  if (card.imageUrl && /^https?:\/\//i.test(card.imageUrl)) {
    return card.imageUrl;
  }

  if (card.imageFile) {
    const normalizedPath = card.imageFile.replace(/\\/g, "/");

    if (normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith("data/")) {
      return `/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("union-arena-jp/")) {
      return `/data/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("images/")) {
      return `/data/union-arena-jp/${normalizedPath}`;
    }

    return `/data/union-arena-jp/images/${normalizedPath.split("/").pop()}`;
  }

  if (card.imageUrl) {
    return card.imageUrl;
  }

  return "";
}

function buildOptions(cards, key, labelKey) {
  const map = new Map();

  cards.forEach((card) => {
    const value = card[key];

    if (!value) return;

    const label = labelKey ? card[labelKey] || value : value;

    if (!map.has(value)) {
      map.set(value, label);
    }
  });

  return [
    { value: ALL_VALUE, label: "全部" },
    ...Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "ja"))
  ];
}

function UnionArenaCardListPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [productId, setProductId] = useState(ALL_VALUE);
  const [rarity, setRarity] = useState(ALL_VALUE);
  const [cardType, setCardType] = useState(ALL_VALUE);
  const [color, setColor] = useState(ALL_VALUE);
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
          throw new Error("cards.json 格式不是 array");
        }

        if (!cancelled) {
          setCards(data.map(normalizeUnionArenaCard));
        }
      } catch (error) {
        if (!cancelled) {
          setCards([]);
          setLoadError(
            "讀取 UNION ARENA cards.json 失敗。請確認 public/data/union-arena-jp/cards.json 已存在。"
          );
          console.error("Failed to load UNION ARENA cards:", error);
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

  const productOptions = useMemo(
    () => buildOptions(cards, "productId", "productName"),
    [cards]
  );

  const rarityOptions = useMemo(
    () => buildOptions(cards, "rarity"),
    [cards]
  );

  const typeOptions = useMemo(
    () => buildOptions(cards, "cardType"),
    [cards]
  );

  const colorOptions = useMemo(
    () => buildOptions(cards, "color"),
    [cards]
  );

  const filteredCards = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return cards.filter((card) => {
      const searchableText = [
        card.cardNo,
        card.name,
        card.productId,
        card.productName,
        card.rarity,
        card.cardType,
        card.color,
        card.cost,
        card.bp,
        card.ap,
        card.effect
      ]
        .join(" ")
        .toLowerCase();

      const matchKeyword = !q || searchableText.includes(q);
      const matchProduct =
        productId === ALL_VALUE || card.productId === productId;
      const matchRarity =
        rarity === ALL_VALUE || card.rarity === rarity;
      const matchType =
        cardType === ALL_VALUE || card.cardType === cardType;
      const matchColor =
        color === ALL_VALUE || card.color === color;

      return (
        matchKeyword &&
        matchProduct &&
        matchRarity &&
        matchType &&
        matchColor
      );
    });
  }, [cards, keyword, productId, rarity, cardType, color]);

  function resetFilters() {
    setKeyword("");
    setProductId(ALL_VALUE);
    setRarity(ALL_VALUE);
    setCardType(ALL_VALUE);
    setColor(ALL_VALUE);
  }

  return (
    <section className="page-section union-arena-card-list-page">
      <div className="section-heading">
        <p className="eyebrow">UNION ARENA</p>
        <h1>卡牌列表</h1>
        <p>
          目前使用本地 JSON 資料顯示 UNION ARENA 日文版卡牌。
          建議先把下載完成的 cards.json 放到 public/data/union-arena-jp/cards.json。
        </p>
      </div>

      <div className="ua-summary-grid">
        <div className="ua-summary-card">
          <span>資料總數</span>
          <strong>{cards.length}</strong>
        </div>

        <div className="ua-summary-card">
          <span>搜尋結果</span>
          <strong>{filteredCards.length}</strong>
        </div>

        <div className="ua-summary-card">
          <span>商品數</span>
          <strong>{Math.max(productOptions.length - 1, 0)}</strong>
        </div>
      </div>

      <div className="ua-filter-panel">
        <label>
          <span>關鍵字搜尋</span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="輸入卡名、卡號、商品、效果文字..."
          />
        </label>

        <label>
          <span>收錄商品</span>
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
          <span>卡牌類型</span>
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
          <span>顏色</span>
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
          >
            {colorOptions.map((item) => (
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
            重設條件
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

      <div className="ua-card-grid">
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
                  <img src={imageSrc} alt={card.name} loading="lazy" />
                ) : (
                  <span>No Image</span>
                )}
              </div>

              <div className="ua-card-body">
                <div className="ua-card-no">{card.cardNo || "No."}</div>
                <h2>{card.name}</h2>

                <div className="ua-card-meta">
                  {card.rarity && <span>{card.rarity}</span>}
                  {card.cardType && <span>{card.cardType}</span>}
                  {card.color && <span>{card.color}</span>}
                </div>

                <p>{card.productName || card.productId}</p>
              </div>
            </article>
          );
        })}
      </div>

      {selectedCard && (
        <div
          className="ua-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCard(null);
            }
          }}
        >
          <div className="ua-modal">
            <button
              type="button"
              className="ua-modal-close"
              onClick={() => setSelectedCard(null)}
            >
              ×
            </button>

            <div className="ua-modal-layout">
              <div className="ua-modal-image">
                {getImageSrc(selectedCard) ? (
                  <img
                    src={getImageSrc(selectedCard)}
                    alt={selectedCard.name}
                  />
                ) : (
                  <span>No Image</span>
                )}
              </div>

              <div className="ua-modal-content">
                <p className="eyebrow">UNION ARENA CARD</p>
                <h2>{selectedCard.name}</h2>

                <dl className="ua-detail-list">
                  <div>
                    <dt>卡號</dt>
                    <dd>{selectedCard.cardNo || "-"}</dd>
                  </div>

                  <div>
                    <dt>商品</dt>
                    <dd>
                      {selectedCard.productName ||
                        selectedCard.productId ||
                        "-"}
                    </dd>
                  </div>

                  <div>
                    <dt>稀有度</dt>
                    <dd>{selectedCard.rarity || "-"}</dd>
                  </div>

                  <div>
                    <dt>類型</dt>
                    <dd>{selectedCard.cardType || "-"}</dd>
                  </div>

                  <div>
                    <dt>顏色</dt>
                    <dd>{selectedCard.color || "-"}</dd>
                  </div>

                  <div>
                    <dt>Cost</dt>
                    <dd>{selectedCard.cost || "-"}</dd>
                  </div>

                  <div>
                    <dt>BP</dt>
                    <dd>{selectedCard.bp || "-"}</dd>
                  </div>

                  <div>
                    <dt>AP</dt>
                    <dd>{selectedCard.ap || "-"}</dd>
                  </div>
                </dl>

                {selectedCard.effect && (
                  <div className="ua-effect-box">
                    <h3>效果</h3>
                    <p>{selectedCard.effect}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default UnionArenaCardListPage;