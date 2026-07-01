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
          throw new Error("cards.json ?澆?銝 array");
        }

        if (!cancelled) {
          setCards(data);
        }
      } catch (error) {
        if (!cancelled) {
          setCards([]);
          setLoadError(
            "霈??UNION ARENA cards.json 憭望???蝣箄? public/data/union-arena-jp/cards.json 撌脣??具?
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
        <h1>??蝝Ｗ?</h1>
        <p>
          ?ㄐ?? cards.json ?芸??渡? UNION ARENA ????銵剁?
          ?嫣噶銋?撱箇?瘥???閰喟敦???
        </p>
      </div>

      {loading && (
        <div className="result-bar">
          <strong>甇??渡???鞈??色?/strong>
        </div>
      )}

      {loadError && (
        <div className="notice-box warning">
          <strong>鞈?霈?仃??/strong>
          <p>{loadError}</p>
        </div>
      )}

      {!loading && !loadError && (
        <>
          <div className="result-bar">
            <strong>??蝮賣嚗products.length}</strong>
            <span>?∠?蝮賣嚗cards.length}</span>
          </div>

          <div className="ua-product-grid">
            {products.map((product) => (
              <article className="ua-product-card" key={product.id}>
                <p className="eyebrow">{product.id}</p>
                <h2>{product.name}</h2>
                <p>?園??∠?嚗product.count} 撘?/p>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default UnionArenaProductPage;
