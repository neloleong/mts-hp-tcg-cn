function UnionArenaHomePage({ navigate }) {
  return (
    <section className="page-section union-arena-home-page">
      <div className="section-heading">
        <p className="eyebrow">UNION ARENA</p>
        <h1>UNION ARENA 日文版卡牌資料庫</h1>
        <p>
          這裡整理 UNION ARENA 日文版卡牌資料、商品系列、卡牌圖片索引與搜尋篩選。
          目前已完成 106 個商品、8036 張卡牌資料的本地下載整理。
        </p>
      </div>

      <div className="feature-grid">
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
          <h2>商品索引</h2>
          <p>
            從已下載卡牌資料中自動整理收錄商品，方便之後建立商品頁和系列頁。
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
          <h2>資料說明</h2>
          <p>
            記錄 UNION ARENA 資料來源、下載方式、圖片處理和未來接入資料庫的方向。
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
    </section>
  );
}

export default UnionArenaHomePage;