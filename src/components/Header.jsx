import { useMemo, useState } from "react";

const HP_BASE = "games/harry-potter";
const UA_BASE = "games/union-arena";

const portalLinks = [
  { id: "home", label: "總首頁" },
  { id: "games", label: "遊戲列表" }
];

const harryPotterLinks = [
  { id: HP_BASE, label: "HP 首頁" },
  { id: `${HP_BASE}/cards`, label: "卡牌列表" },
  { id: `${HP_BASE}/products`, label: "商品情報" },
  { id: `${HP_BASE}/news`, label: "新聞" },
  { id: `${HP_BASE}/events`, label: "活動" },
  { id: `${HP_BASE}/decks`, label: "牌組" },
  { id: `${HP_BASE}/about`, label: "關於本站" }
];

const unionArenaLinks = [
  { id: UA_BASE, label: "UA 首頁" },
  { id: `${UA_BASE}/cards`, label: "卡牌列表" },
  { id: `${UA_BASE}/products`, label: "商品情報" },
  { id: `${UA_BASE}/news`, label: "新聞" },
  { id: `${UA_BASE}/events`, label: "活動" },
  { id: `${UA_BASE}/decks`, label: "牌組" },
  { id: `${UA_BASE}/about`, label: "關於本站" }
];

function isHarryPotterRoute(pageId) {
  return pageId === HP_BASE || pageId.startsWith(`${HP_BASE}/`);
}

function isUnionArenaRoute(pageId) {
  return pageId === UA_BASE || pageId.startsWith(`${UA_BASE}/`);
}

function getBrandCopy(currentPage) {
  if (isHarryPotterRoute(currentPage)) {
    return {
      title: "Harry Potter TCG",
      subtitle: "中文卡牌資料庫"
    };
  }

  if (isUnionArenaRoute(currentPage)) {
    return {
      title: "UNION ARENA",
      subtitle: "日文版卡牌資料庫"
    };
  }

  return {
    title: "Card Game Library",
    subtitle: "中文卡牌遊戲資料庫"
  };
}

function Header({ currentPage, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const brand = getBrandCopy(currentPage);

  const links = useMemo(() => {
    if (isHarryPotterRoute(currentPage)) {
      return [...portalLinks, ...harryPotterLinks];
    }

    if (isUnionArenaRoute(currentPage)) {
      return [...portalLinks, ...unionArenaLinks];
    }

    return [
      ...portalLinks,
      { id: HP_BASE, label: "Harry Potter TCG" },
      { id: UA_BASE, label: "UNION ARENA" }
    ];
  }, [currentPage]);

  function handleNavigate(pageId) {
    navigate(pageId);
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <button
          type="button"
          className="brand"
          onClick={() => handleNavigate("home")}
        >
          <span className="brand-main">MTS&apos;</span>

          <span className="brand-copy">
            <strong>{brand.title}</strong>
            <span>{brand.subtitle}</span>
          </span>
        </button>

        <button
          type="button"
          className="menu-btn"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label="開關選單"
        >
          ☰
        </button>

        <nav className={menuOpen ? "main-nav open" : "main-nav"}>
          {links.map((link) => (
            <button
              key={link.id}
              type="button"
              className={currentPage === link.id ? "nav-link active" : "nav-link"}
              onClick={() => handleNavigate(link.id)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;