function UnionArenaDeckPage() {
  return (
    <section className="page-section union-arena-deck-page">
      <div className="section-heading">
        <p className="eyebrow">UNION ARENA</p>
        <h1>牌組</h1>
        <p>
          這裡之後可以建立 UNION ARENA 牌組資料，包括作品主題牌組、
          入門牌組、玩家牌組和賽事牌組紀錄。
        </p>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <span>Deck Library</span>
          <h2>作品主題牌組</h2>
          <p>
            按作品整理牌組，例如不同參戰作品的角色核心、顏色方向和常用卡牌。
          </p>
        </article>

        <article className="info-card">
          <span>Starter Guide</span>
          <h2>入門牌組</h2>
          <p>
            之後可以為新玩家整理入門牌組、基本玩法和推薦商品。
          </p>
        </article>

        <article className="info-card">
          <span>Competitive</span>
          <h2>賽事牌組</h2>
          <p>
            未來可以記錄賽事環境、優勝牌組和常見對局方向。
          </p>
        </article>
      </div>
    </section>
  );
}

export default UnionArenaDeckPage;