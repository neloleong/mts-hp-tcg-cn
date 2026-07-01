function UnionArenaHomePage({ navigate }) {
  return (
    <section className="page-section union-arena-home-page">
      <div className="ua-home-hero">
        <div className="ua-home-main">
          <div className="section-heading">
            <p className="eyebrow">UNION ARENA</p>

            <h1>UNION ARENA ?交?????澈</h1>

            <p>
              ?ㄐ?渡? UNION ARENA ?交???????頂????揣撘???蝭拚??
              隞亦摰嗆閰Ｕ???????蝷曄黎鈭斗??箔蜓閬??
            </p>
          </div>

          <div className="feature-grid ua-home-feature-grid">
            <article className="feature-card">
              <h2>?∠??”</h2>
              <p>
                ?亦? UNION ARENA ?交???????舀??????漲??楊??
                ?迂???萄?????
              </p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate("games/union-arena/cards")}
              >
                ?亦??∠?
              </button>
            </article>

            <article className="feature-card">
              <h2>???</h2>
              <p>
                ?渡? UNION ARENA ?賊????頂?????園?鞈?嚗?
                ?嫣噶?拙振?仿銝????批捆??
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/products")}
              >
                ?亦???
              </button>
            </article>

            <article className="feature-card">
              <h2>?啗?</h2>
              <p>
                ?其??渡? UNION ARENA 摰瘨????啜??唬??撣?鞈?摨急?啁???
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/news")}
              >
                ?亦??啗?
              </button>
            </article>

            <article className="feature-card">
              <h2>瘣餃?</h2>
              <p>
                銋??臭誑?渡?摰瘣餃????芾魚?漱瘚?嚗誑?????魚鈭??晞?
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/events")}
              >
                ?亦?瘣餃?
              </button>
            </article>

            <article className="feature-card">
              <h2>??</h2>
              <p>
                銋??臭誑撱箇??拙振?????蜓憿?蝯??????∠?皜??
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/decks")}
              >
                ?亦???
              </button>
            </article>

            <article className="feature-card">
              <h2>??祉?</h2>
              <p>
                閮? UNION ARENA 鞈?靘?????摰?脫??靘?亥??澈???
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/about")}
              >
                ?鞈?摨?
              </button>
            </article>
          </div>
        </div>

        <aside className="ua-home-side-panel">
          <div className="ua-home-side-panel-title">閰喟敦璊揣</div>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/cards")}
          >
            ?怒??嫘?
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/products")}
          >
            ????
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/news")}
          >
            ??潦
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/events")}
          >
            ?扎??喋?
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/decks")}
          >
            ????
          </button>

          <button
            type="button"
            className="ua-side-search-btn"
            onClick={() => navigate("games/union-arena/cards")}
          >
            璊揣??
          </button>
        </aside>
      </div>
    </section>
  );
}

export default UnionArenaHomePage;
