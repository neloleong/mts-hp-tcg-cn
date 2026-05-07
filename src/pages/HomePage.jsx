import { sampleCards } from "../data/cards";

function HomePage({ setPage }) {
  const latestCards = sampleCards.slice(0, 6);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Harry Potter Card Game 中文資料站</span>
          <h1>哈利波特 TCG 中文卡牌資料庫</h1>
          <p>
            整理 Harry Potter Card Game 的中文卡牌翻譯、卡牌列表、商品情報、
            活動資訊及規則資料，方便玩家快速查找卡牌效果與系列內容。
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-btn"
              onClick={() => setPage && setPage("cards")}
            >
              查看卡牌列表
            </button>

            <button
              type="button"
              className="secondary-btn"
              onClick={() => setPage && setPage("products")}
            >
              查看商品情報
            </button>
          </div>
        </div>

        <div className="hero-panel">
          <div className="magic-orb">HP</div>
          <h2>網站功能</h2>
          <ul>
            <li>中文卡牌資料查詢</li>
            <li>按系列、商品、稀有度篩選</li>
            <li>卡牌詳情彈窗</li>
            <li>規則與活動資料整理</li>
          </ul>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>Latest Cards</span>
          <h2>最新加入卡牌</h2>
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
                    {card.cardNo}・{card.type}・{card.rarity || "未設定"}
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
          <h2>資料庫內容</h2>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <span>Card List</span>
            <h3>卡牌列表</h3>
            <p>收錄卡號、中文卡名、日文原名、類型、學院、稀有度及中文效果。</p>
          </div>

          <div className="info-card">
            <span>Products</span>
            <h3>商品情報</h3>
            <p>整理起始牌組、補充包、PR 卡及日後新增系列。</p>
          </div>

          <div className="info-card">
            <span>Rules</span>
            <h3>規則資料</h3>
            <p>提供官方規則、活動規則及對戰流程的中文整理。</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;