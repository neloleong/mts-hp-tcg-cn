import { games } from "../../data/games";

function GameSelectPage({ navigate }) {
  return (
    <section className="page-section game-select-page">
      <div className="section-heading">
        <p className="eyebrow">Game Index</p>
        <h1>卡牌遊戲列表</h1>
        <p>
          這裡是 MTS&apos; Card Game Library 的遊戲入口。已開放的遊戲可以直接進入，
          規劃中的遊戲之後可以逐步新增卡牌列表、商品情報、新聞、活動和牌組資料。
        </p>
      </div>

      <div className="game-grid">
        {games.map((game) => {
          const isOpen = game.status === "已開放";

          return (
            <article className="game-card" key={game.id}>
              <div className="game-card-top">
                <span
                  className={
                    isOpen ? "status-badge open" : "status-badge planned"
                  }
                >
                  {game.status}
                </span>
              </div>

              <h2>{game.title}</h2>
              <h3>{game.titleZh}</h3>

              <p>{game.description}</p>

              <div className="game-card-actions">
                <button
                  type="button"
                  className="primary-btn"
                  disabled={!isOpen}
                  onClick={() => navigate(game.route)}
                >
                  {isOpen ? "進入資料庫" : "準備中"}
                </button>

                {isOpen && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => navigate(game.cardsRoute)}
                  >
                    查看卡牌
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default GameSelectPage;