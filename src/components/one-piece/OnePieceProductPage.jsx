import { useEffect, useMemo, useState } from "react";

const PRODUCT_DATA_URL = "/data/one-piece-tc/products.tc.json";

export default function OnePieceProductPage() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch(PRODUCT_DATA_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("products.tc.json ?澆?銝 array");
        }

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(`?⊥?頛??鞈?嚗?{error.message}`);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      const searchText = product.searchText || "";
      const name = String(product.name || product.title || "").toLowerCase();

      return searchText.includes(keyword) || name.includes(keyword);
    });
  }, [products, query]);

  return (
    <main className="op-page op-product-page">
      <section className="op-hero">
        <p className="op-kicker">ONE PIECE CARD GAME</p>
        <h1>???</h1>
        <p>?渡? ONE PIECE Card Game 蝜?銝剜?????頂??撠??∠??賊???/p>
      </section>

      <section className="op-filter-panel">
        <div className="op-search-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="?????頂???.."
          />
        </div>

        <div className="op-result-summary">
          憿舐內 {filteredProducts.length} / {products.length} ????蝟餃?
        </div>
      </section>

      {errorMessage && <div className="op-alert">{errorMessage}</div>}

      <section className="op-product-grid">
        {filteredProducts.map((product) => (
          <article className="op-product-card" key={product.id || product.productKey}>
            <div>
              <p className="op-product-label">PRODUCT</p>
              <h2>{product.name || product.title || "?芸????}</h2>
            </div>

            <div className="op-product-meta">
              <span>{product.cardCount || 0} 撘萄??/span>

              {product.seriesNames?.slice(0, 2).map((seriesName) => (
                <span key={seriesName}>{seriesName}</span>
              ))}
            </div>

            {product.colors?.length > 0 && (
              <div className="op-card-badges">
                {product.colors.slice(0, 8).map((color) => (
                  <span key={color}>{color}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <div className="op-empty-state">?曆??啁泵??隞嗥???鞈???/div>
      )}
    </main>
  );
}

