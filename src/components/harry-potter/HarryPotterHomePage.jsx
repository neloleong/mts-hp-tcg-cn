import { sampleCards } from "../../data/cards";

function HomePage({ setPage }) {
  const latestCards = sampleCards.slice(0, 6);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Harry Potter Card Game 銝剜?鞈?蝡?/span>
          <h1>?瘜Ｙ TCG 銝剜??∠?鞈?摨?/h1>
          <p>
            ?渡? Harry Potter Card Game ?葉??蕃霅胯??銵具????晞?            瘣餃?鞈????????嫣噶?拙振敹恍?曉????蝟餃??批捆??          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => setPage && setPage("cards")}
            >
              ?亦??∠??”
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => setPage && setPage("products")}
            >
              ?亦????
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="magic-orb">HP</div>
          <h2>蝬脩??</h2>
          <ul>
            <li>銝剜??∠?鞈??亥岷</li>
            <li>?頂?????漲蝭拚</li>
            <li>?∠?閰單?敶?</li>
            <li>閬??暑?????/li>
          </ul>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Latest Cards</span>
          <h2>??啣??亙??/h2>
        </div>

        <div className="latest-card-grid">
          {latestCards.map((card) => {
            const imageSrc = card.image || card.imageUrl;

            return (
              <button
                type="button"
                className="latest-card-item"
                key={card.id}
                onClick={() => setPage && setPage("cards")}
              >
                <div className="latest-card-image">
                  {imageSrc ? (
                    <img src={imageSrc} alt={card.nameZh || card.cardNo} />
                  ) : (
                    <div className="latest-card-placeholder">
                      <strong>{card.nameZh}</strong>
                      <span>{card.cardNo}</span>
                    </div>
                  )}
                </div>

                <div className="latest-card-info">
                  <strong>{card.nameZh}</strong>
                  <span>
                    {card.cardNo}?認card.type}?認card.rarity || "?芾身摰?}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Database</span>
          <h2>鞈?摨怠摰?/h2>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <span>Card List</span>
            <h3>?∠??”</h3>
            <p>?園??∟??葉???????飛?Ｕ??漲?葉????/p>
          </div>

          <div className="info-card">
            <span>Products</span>
            <h3>???</h3>
            <p>?渡?韏瑕????????R ?∪??亙??啣?蝟餃???/p>
          </div>

          <div className="info-card">
            <span>Rules</span>
            <h3>閬?鞈?</h3>
            <p>??摰閬??暑????撠瘚??葉???/p>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
