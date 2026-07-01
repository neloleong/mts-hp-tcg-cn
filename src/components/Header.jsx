import { useMemo, useState } from "react";

const HP_BASE = "games/harry-potter";
const UA_BASE = "games/union-arena";
const OP_BASE = "games/one-piece";

const portalLinks = [
  { id: "home", label: "蝮賡??? },
  { id: "games", label: "??”" }
];

const harryPotterLinks = [
  { id: HP_BASE, label: "HP 擐?" },
  { id: `${HP_BASE}/cards`, label: "?∠??”" },
  { id: `${HP_BASE}/products`, label: "???" },
  { id: `${HP_BASE}/news`, label: "?啗?" },
  { id: `${HP_BASE}/events`, label: "瘣餃?" },
  { id: `${HP_BASE}/decks`, label: "??" },
  { id: `${HP_BASE}/about`, label: "??祉?" }
];

const unionArenaLinks = [
  { id: UA_BASE, label: "UA 擐?" },
  { id: `${UA_BASE}/cards`, label: "?∠??”" },
  { id: `${UA_BASE}/products`, label: "???" },
  { id: `${UA_BASE}/news`, label: "?啗?" },
  { id: `${UA_BASE}/events`, label: "瘣餃?" },
  { id: `${UA_BASE}/decks`, label: "??" },
  { id: `${UA_BASE}/about`, label: "??祉?" }
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
      subtitle: "銝剜??∠?鞈?摨?
    };
  }

  if (isUnionArenaRoute(currentPage)) {
    return {
      title: "UNION ARENA",
      subtitle: "?交?????澈"
    };
  }

  return {
    title: "Card Game Library",
    subtitle: "銝剜??∠??鞈?摨?
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
      { id: UA_BASE, label: "UNION ARENA" },
      { id: OP_BASE, label: "ONE PIECE" }
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
          aria-label="???詨"
        >
          ??        </button>

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
