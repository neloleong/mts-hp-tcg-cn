import { games } from "../data/games";

function PortalHomePage({ navigate }) {
  const openedGames = games.filter((game) => game.status === "已開放");
  const plannedGames = games.filter((game) => game.status !== "已開放");

  return (
    <section className="portal-home">
      <div className="portal-bg-glow portal-bg-glow-one" />
      <div className="portal-bg-glow portal-bg-glow-two" />

      <div className="portal-hero">
        <div className="portal-hero-content">
          <p className="portal-kicker">MTS' CARD GAME LIBRARY</p>

          <h1>
            中文卡牌遊戲
            <br />
            資料庫平台
          </h1>

          <p className="portal-lead">
            以中文玩家查詢、收藏整理、規則理解及商品情報為核心，
            建立多款卡牌遊戲的資料入口。Harry Potter TCG 是本站第一個整理項目，
            未來可逐步加入 Pokémon、One Piece、Magic 等不同卡牌遊戲。
          </p>

          <div className="portal-actions">
            <button
              type="button"
              className="portal-btn portal-btn-primary"
              onClick={() => navigate("games")}
            >
              查看所有遊戲
            </button>

            <button
              type="button"
              className="portal-btn portal-btn-secondary"
              onClick={() => navigate("games/harry-potter")}
            >
              進入 Harry Potter TCG
            </button>
          </div>
        </div>

        <div className="portal-showcase">
          <div className="showcase-card showcase-card-main">
            <span className="showcase-label">OPEN DATABASE</span>
            <h2>Harry Potter TCG</h2>
            <p>中文卡牌資料、商品情報、規則筆記、活動及玩家牌組。</p>
            <button type="button" onClick={() => navigate("games/harry-potter")}>
              進入資料庫
            </button>
          </div>

          <div className="showcase-stack">
            <div className="mini-showcase">
              <span>Cards</span>
              <strong>卡牌查詢</strong>
            </div>

            <div className="mini-showcase">
              <span>Products</span>
              <strong>商品情報</strong>
            </div>

            <div className="mini-showcase">
              <span>Rules</span>
              <strong>規則筆記</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="portal-section-title">
        <p>DATABASE INDEX</p>
        <h2>已開放與規劃中的遊戲資料庫</h2>
      </div>

      <div className="portal-game-grid">
        {openedGames.map((game) => (
          <article className="portal-game-card active-game" key={game.id}>
            <div className="game-card-header">
              <span className="status-pill open">已開放</span>
            </div>

            <h3>{game.title}</h3>
            <h4>{game.titleZh}</h4>

            <p>{game.description}</p>

            <button type="button" onClick={() => navigate(game.route)}>
              進入資料庫
            </button>
          </article>
        ))}

        <article className="portal-game-card planned-games">
          <div className="game-card-header">
            <span className="status-pill planned">規劃中</span>
          </div>

          <h3>Coming Soon</h3>
          <h4>未來可加入的卡牌遊戲</h4>

          <ul>
            {plannedGames.map((game) => (
              <li key={game.id}>
                <strong>{game.title}</strong>
                <span>{game.titleZh}</span>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => navigate("games")}>
            查看遊戲列表
          </button>
        </article>
      </div>
    </section>
  );
}

export default PortalHomePage;