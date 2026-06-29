function UnionArenaAboutPage() {
  return (
    <section className="page-section union-arena-about-page">
      <div className="section-heading">
        <p className="eyebrow">About UNION ARENA Database</p>
        <h1>關於 UNION ARENA 資料庫</h1>
        <p>
          UNION ARENA 是 MTS&apos; Card Game Library 中第二個正式接入的卡牌遊戲資料庫。
          目前先以日文版卡牌資料作為整理對象。
        </p>
      </div>

      <div className="content-panel">
        <h2>目前資料狀態</h2>

        <ul>
          <li>商品總數：106</li>
          <li>卡牌資料：8036 張</li>
          <li>有圖片路徑：8036 張</li>
          <li>缺圖數量：0 張</li>
          <li>Unique 圖片檔：6352 個</li>
        </ul>

        <h2>資料使用方式</h2>

        <p>
          目前建議只在本機或內部環境使用完整圖片與卡牌資料。
          如之後要公開部署，建議只使用整理後的索引資料，
          圖片則盡量使用官方來源連結或避免完整轉載。
        </p>

        <h2>下一步方向</h2>

        <p>
          下一階段可以為 UNION ARENA 補充商品封面、作品分類、卡牌顏色篩選、
          稀有度篩選、系列頁，以及更接近官方卡表風格的 UI。
        </p>
      </div>
    </section>
  );
}

export default UnionArenaAboutPage;