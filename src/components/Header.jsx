import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { id: "home", label: "首頁" },
  { id: "cards", label: "卡牌列表" },
  { id: "products", label: "商品情報" },
  { id: "news", label: "新聞" },
  { id: "events", label: "活動" },
  { id: "decks", label: "牌組" },
  { id: "about", label: "關於本站" }
];

function Header({ currentPage, navigate }) {
  const [open, setOpen] = useState(false);

  function go(pageId) {
    navigate(pageId);
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="brand" type="button" onClick={() => go("home")}>
          <span className="brand-main">MTS'</span>
          <span className="brand-copy">Harry Potter TCG<br />中文卡牌資料庫</span>
        </button>

        <nav className={open ? "main-nav open" : "main-nav"}>
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={currentPage === item.id ? "nav-link active" : "nav-link"}
              onClick={() => go(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button className="menu-btn" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}

export default Header;
