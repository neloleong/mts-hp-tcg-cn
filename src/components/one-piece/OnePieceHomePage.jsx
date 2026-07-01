import { useEffect, useState } from "react";

const SUMMARY_URL = "/data/one-piece-tc/summary.json";

export default function OnePieceHomePage() {
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
        <p className="op-kicker">MTS&apos; Card Game Library</p>
        <h1>ONE PIECE Card Game 蝜?銝剜??∠?鞈?摨?/h1>
        <p>
          ?渡? ONE PIECE Card Game 蝜?銝剜?????????晞???摮??脯敺???蝭拚???
        </p>

        <div className="op-hero-actions">
          <a href="#/games/one-piece/cards">?亦??∠??”</a>
          <a href="#/games/one-piece/products">?亦????</a>
        </div>
      </section>

      <section className="op-stat-grid">
        <article>
          <strong>{summary?.cards?.total ?? "4640"}</strong>
          <span>?∠?鞈?</span>
        </article>

        <article>
          <strong>{summary?.products?.total ?? "251"}</strong>
          <span>?? / 蝟餃?鞈?</span>
        </article>

        <article>
          <strong>{summary?.cards?.withImageUrl ?? "4640"}</strong>
          <span>摰?? URL</span>
        </article>

        <article>
          <strong>TC</strong>
          <span>蝜?銝剜???/span>
        </article>
      </section>

      <section className="op-section">
        <h2>?桀??</h2>

        <div className="op-feature-grid">
          <article>
            <h3>?∠???</h3>
            <p>?舀?∪?????敺???蝟餃?????/p>
          </article>

          <article>
            <h3>璇辣蝭拚</h3>
            <p>?舀?憿?蝔柴??漲????翰?祟?詻?/p>
          </article>

          <article>
            <h3>?∠?閰單?</h3>
            <p>憿舐內?∪??祥?具??賬??????孛?潸?摰鞈??????/p>
          </article>
        </div>
      </section>
    </main>
  );
}

