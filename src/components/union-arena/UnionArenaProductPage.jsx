import { useEffect, useMemo, useState } from "react";

const CARD_DATA_URL = "/data/union-arena-jp/cards.json";

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

function getProductId(row) {
  return safeText(
    pickFirst(row, ["product_id", "productId", "product", "product_code"])
  );
}

function getProductName(row) {
  return safeText(
    pickFirst(row, [
      "product_name",
      "productName",
      "product_title",
      "productTitle",
      "title"
    ])
  );
}

function UnionArenaProductPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
          setCards(data);
        }
      } catch (error) {
        if (!cancelled) {
          setCards([]);
          setLoadError(
            "讀取 UNION ARENA cards.json 失敗。請確認 public/data/union-arena-jp/cards.json 已存在。"
          );
          console.error("Failed to load UNION ARENA products:", error);
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

  const products = useMemo(() => {
    const map = new Map();

    cards.forEach((card) => {
      const productId = getProductId(card) || "unknown";
      const productName = getProductName(card) || productId;

      if (!map.has(productId)) {
        map.set(productId, {
          id: productId,
          name: productName,
          count: 0
        });
      }

      map.get(productId).count += 1;
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "ja")
    );
  }, [cards]);

  return (
    <section className="page-section union-arena-product-page">
      <div className="section-heading">
        <p className="eyebrow">UNION ARENA</p>
        <h1>商品索引</h1>
        <p>
          這裡會從 cards.json 自動整理 UNION ARENA 的商品列表，
          方便之後建立每個商品的詳細頁面。
        </p>
      </div>

      {loading && (
        <div className="result-bar">
          <strong>正在整理商品資料……</strong>
        </div>
      )}

      {loadError && (
        <div className="notice-box warning">
          <strong>資料讀取失敗</strong>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <>
          <div className="result-bar">
            <strong>商品總數：{products.length}</strong>
            <span>卡牌總數：{cards.length}</span>
          </div>

          <div className="ua-product-grid">
            {products.map((product) => (
              <article className="ua-product-card" key={product.id}>
                <p className="eyebrow">{product.id}</p>
                <h2>{product.name}</h2>
                <p>收錄卡牌：{product.count} 張</p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default UnionArenaProductPage;