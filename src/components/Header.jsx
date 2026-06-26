import { Menu, X } from "lucide-react";
import { useState } from "react";

const HP_BASE = "games/harry-potter";

const portalNavItems = [
  { id: "home", label: "總首頁" },
  { id: "games", label: "遊戲列表" },
  { id: HP_BASE, label: "Harry Potter TCG" }
];

const harryPotterNavItems = [
  { id: "home", label: "總首頁" },
  { id: "games", label: "遊戲列表" },
  { id: HP_BASE, label: "HP 首頁" },
  { id: `${HP_BASE}/cards`, label: "卡牌列表" },
  { id: `${HP_BASE}/products`, label: "商品情報" },
  { id: `${HP_BASE}/news`, label: "新聞" },
  { id: `${HP_BASE}/events`, label: "活動" },
  { id: `${HP_BASE}/decks`, label: "牌組" },
  { id: `${HP_BASE}/about`, label: "關於本站" }
];

function Header({ currentPage, navigate }) {
  const [open, setOpen] = useState(false);

  const isHarryPotterSection = currentPage.startsWith(HP_BASE);
  const navItems = isHarryPotterSection ? harryPotterNavItems : portalNavItems;

  function go(pageId) {
    navigate(pageId);
    setOpen(false);
  }

  function isActive(itemId) {
    return currentPage === itemId;
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          className="brand"
          type="button"
          onClick={() => go(isHarryPotterSection ? HP_BASE : "home")}
        >
          <span className="brand-main">MTS'</span>

          {isHarryPotterSection ? (
            <span className="brand-copy">
              Harry Potter TCG
              <br />
              中文卡牌資料庫
            </span>
          ) : (
            <span className="brand-copy">
              Card Game Library
              <br />
              中文卡牌遊戲資料庫
            </span>
          )}
        </button>

        <nav className={open ? "main-nav open" : "main-nav"}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={isActive(item.id) ? "nav-link active" : "nav-link"}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="menu-btn"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="開啟選單"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Header;