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
          throw new Error("products.tc.json is not an array");
        }

        if (!cancelled) {
          setProducts(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(`Failed to load products: ${error.message}`);
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
        <h1>Products</h1>
        <p>Browse products, series and the number of cards included in each set.</p>
      </section>

      <section className="op-filter-panel">
        <div className="op-search-row">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products, series or card numbers..."
          />
        </div>

        <div className="op-result-summary">
          Showing {filteredProducts.length} / {products.length} products
        </div>
      </section>

      {errorMessage && <div className="op-alert">{errorMessage}</div>}

      <section className="op-product-grid">
        {filteredProducts.map((product) => (
          <article className="op-product-card" key={product.id || product.productKey}>
            <div>
              <p className="op-product-label">PRODUCT</p>
              <h2>{product.name || product.title || "Unnamed product"}</h2>
            </div>

            <div className="op-product-meta">
              <span>{product.cardCount || 0} cards</span>

              {product.seriesNames?.slice(0, 2).map((seriesName) => (
                <span key={seriesName}>{seriesName}</span>
              ))}
            </div>

            {product.colors?.length > 0 && (
              <div className="op-card-badges">
                {product.colors.slice(0, 8).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <div className="op-empty-state">No products matched your search.</div>
      )}
    </main>
  );
}
