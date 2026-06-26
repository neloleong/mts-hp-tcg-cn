import VisitorCounter from "./VisitorCounter";

const HP_BASE = "games/harry-potter";

function Footer({ navigate, currentPage }) {
  const isHarryPotterSection = currentPage?.startsWith(HP_BASE);

  if (isHarryPotterSection) {
    return (
      <footer className="site-footer">
        <div className="footer-grid">
          <div>
            <h3>MTS' Harry Potter TCG 中文卡牌資料庫</h3>

            <p>
              本網站用於整理 Harry Potter TCG 中文卡牌資料、玩家查詢、翻譯筆記、
              商品資訊及收藏管理。非官方網站。
            </p>

            <p className="footer-disclaimer">
              本網站內容僅供玩家查閱及參考。所有卡牌效果、規則解釋、官方 Q&amp;A、
              商品資訊及相關資料，均以官方網站及官方最新公告為最終依據。
              如本網站內容與官方資料有任何差異，請以官方公佈為準。
            </p>

            <VisitorCounter />
          </div>

          <div className="footer-links">
            <button type="button" onClick={() => navigate("home")}>
              總首頁
            </button>

            <button type="button" onClick={() => navigate("games")}>
              遊戲列表
            </button>

            <button type="button" onClick={() => navigate(HP_BASE)}>
              HP 首頁
            </button>

            <button type="button" onClick={() => navigate(`${HP_BASE}/cards`)}>
              卡牌列表
            </button>

            <button type="button" onClick={() => navigate(`${HP_BASE}/products`)}>
              商品情報
            </button>

            <button type="button" onClick={() => navigate(`${HP_BASE}/about`)}>
              關於本站
            </button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h3>MTS' Card Game Library 中文卡牌遊戲資料庫</h3>

          <p>
            本網站是一個中立的卡牌遊戲資料庫平台，用於整理不同卡牌遊戲的中文資料、
            卡牌查詢、商品情報、規則筆記、收藏管理及玩家參考內容。
          </p>

          <p className="footer-disclaimer">
            本網站內容僅供玩家查閱及參考。所有卡牌效果、規則解釋、官方 Q&amp;A、
            商品資訊及相關資料，均以各遊戲官方網站及官方最新公告為最終依據。
            如本網站內容與官方資料有任何差異，請以官方公佈為準。
          </p>

          <VisitorCounter />
        </div>

        <div className="footer-links">
          <button type="button" onClick={() => navigate("home")}>
            總首頁
          </button>

          <button type="button" onClick={() => navigate("games")}>
            遊戲列表
          </button>

          <button type="button" onClick={() => navigate(HP_BASE)}>
            Harry Potter TCG
          </button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;