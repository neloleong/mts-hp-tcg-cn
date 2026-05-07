import VisitorCounter from "./VisitorCounter";

function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h3>MTS' Harry Potter TCG 中文卡牌資料庫</h3>
          <p>本網站用於整理中文卡牌資料、玩家查詢、翻譯筆記及收藏管理。非官方網站。</p>
          <VisitorCounter />
        </div>

        <div className="footer-links">
          <button type="button" onClick={() => navigate("cards")}>卡牌列表</button>
          <button type="button" onClick={() => navigate("products")}>商品情報</button>
          <button type="button" onClick={() => navigate("news")}>新聞</button>
          <button type="button" onClick={() => navigate("about")}>關於本站</button>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
