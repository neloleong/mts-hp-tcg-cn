function UnionArenaHomePage({ navigate }) {
  return (
    <section className="page-section union-arena-home-page">
      <div className="ua-home-hero">
        <div className="ua-home-main">
          <div className="section-heading">
            <p className="eyebrow">UNION ARENA</p>

            <h1>UNION ARENA 日文版卡牌資料庫</h1>

            <p>
              這裡整理 UNION ARENA 日文版卡牌資料、商品系列、卡牌圖片索引與搜尋篩選。
              以玩家查詢、資料整理、收藏參考和社群交流為主要方向。
            </p>
          </div>

          <div className="feature-grid ua-home-feature-grid">
            <article className="feature-card">
              <h2>卡牌列表</h2>
              <p>
                查看 UNION ARENA 日文版卡牌資料，可按商品、稀有度、卡牌編號、
                名稱和關鍵字搜尋。
              </p>
              <button
                type="button"
                className="primary-btn"
                onClick={() => navigate("games/union-arena/cards")}
              >
                查看卡牌
              </button>
            </article>

            <article className="feature-card">
              <h2>商品情報</h2>
              <p>
                整理 UNION ARENA 相關商品、系列資料和收錄資訊，
                方便玩家查閱不同商品內容。
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/products")}
              >
                查看商品
              </button>
            </article>

            <article className="feature-card">
              <h2>新聞</h2>
              <p>
                用來整理 UNION ARENA 官方消息、商品更新、參戰作品公布和資料庫更新紀錄。
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/news")}
              >
                查看新聞
              </button>
            </article>

            <article className="feature-card">
              <h2>活動</h2>
              <p>
                之後可以整理官方活動、店鋪賽、交流會，以及不同地區的賽事情報。
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/events")}
              >
                查看活動
              </button>
            </article>

            <article className="feature-card">
              <h2>牌組</h2>
              <p>
                之後可以建立玩家牌組、作品主題牌組、入門牌組和收藏用卡組清單。
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/decks")}
              >
                查看牌組
              </button>
            </article>

            <article className="feature-card">
              <h2>關於本站</h2>
              <p>
                記錄 UNION ARENA 資料來源、整理方向、非官方聲明和未來接入資料庫的方向。
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => navigate("games/union-arena/about")}
              >
                關於資料庫
              </button>
            </article>
          </div>
        </div>

        <aside className="ua-home-side-panel">
          <div className="ua-home-side-panel-title">詳細検索</div>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/cards")}
          >
            カードリスト
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/products")}
          >
            商品名
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/news")}
          >
            ニュース
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/events")}
          >
            イベント
          </button>

          <button
            type="button"
            className="ua-side-link"
            onClick={() => navigate("games/union-arena/decks")}
          >
            デッキ
          </button>

          <button
            type="button"
            className="ua-side-search-btn"
            onClick={() => navigate("games/union-arena/cards")}
          >
            検索する
          </button>
        </aside>
      </div>
    </section>
  );
}

export default UnionArenaHomePage;