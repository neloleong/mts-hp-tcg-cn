function UnionArenaNewsPage() {
  return (
    <section className="page-section union-arena-news-page">
      <div className="section-heading">
        <p className="eyebrow">UNION ARENA</p>
        <h1>新聞</h1>
        <p>
          這裡用來整理 UNION ARENA 官方消息、商品更新、參戰作品公布、
          資料庫更新紀錄，以及未來與玩家社群相關的消息。
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <span>Database Update</span>
          <h2>UNION ARENA 日文版卡牌資料下載完成</h2>
          <p>
            已整理 106 個商品、8036 張卡牌資料，所有卡牌均有圖片路徑。
            目前先以本地 JSON 方式接入前端頁面。
          </p>
        </article>

        <article className="info-card">
          <span>Next Step</span>
          <h2>商品與作品分類整理</h2>
          <p>
            下一步可以根據 product_id、商品名稱、作品名稱進一步整理系列頁和作品頁。
          </p>
        </article>

        <article className="info-card">
          <span>Notice</span>
          <h2>圖片資料暫不提交 GitHub</h2>
          <p>
            因圖片數量較多，而且涉及版權風險，完整下載圖片暫時只建議保留在本機。
          </p>
        </article>
      </div>
    </section>
  );
}

export default UnionArenaNewsPage;