import { useEffect, useState } from "react";

const SUMMARY_URL = "/data/one-piece-tc/summary.json";

export default function OnePieceHomePage({ navigate }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      try {
        const response = await fetch(SUMMARY_URL);
        if (!response.ok) return;

        const data = await response.json();

        if (!cancelled) {
          setSummary(data);
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="op-page op-home-page">
      <section className="op-hero">
        <p className="op-kicker">MTS' Card Game Library</p>
        <h1>ONE PIECE Card Game Database</h1>
        <p>
          Browse ONE PIECE Card Game Traditional Chinese card data, products,
          effects, colors, traits, images and search filters.
        </p>

        <div className="op-hero-actions">
          <button type="button" onClick={() => navigate?.("games/one-piece/cards")}>
            View cards
          </button>
          <button type="button" onClick={() => navigate?.("games/one-piece/products")}>
            View products
          </button>
        </div>
      </section>

      <section className="op-stat-grid">
        <article>
          <strong>{summary?.cards?.total ?? "4640"}</strong>
          <span>Cards</span>
        </article>

        <article>
          <strong>{summary?.products?.total ?? "251"}</strong>
          <span>Products</span>
        </article>

        <article>
          <strong>{summary?.cards?.withImageUrl ?? "4640"}</strong>
          <span>Image URLs</span>
        </article>

        <article>
          <strong>TC</strong>
          <span>Traditional Chinese</span>
        </article>
      </section>

      <section className="op-section">
        <h2>Features</h2>

        <div className="op-feature-grid">
          <article>
            <h3>Card search</h3>
            <p>Search by name, card number, effect, trait, product and series.</p>
          </article>

          <article>
            <h3>Filters</h3>
            <p>Filter cards by color, card type, rarity and product.</p>
          </article>

          <article>
            <h3>Card details</h3>
            <p>Open each card to view image, stats, effect text and official link.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
