const HP_BASE = "games/harry-potter";
const UA_BASE = "games/union-arena";
const OP_BASE = "games/one-piece";

const mainNavItems = [
  { id: "home", label: "Home" },
  { id: "games", label: "Games" },
  { id: HP_BASE, label: "Harry Potter TCG" },
  { id: UA_BASE, label: "UNION ARENA" },
  { id: OP_BASE, label: "ONE PIECE" }
];

const gameNavItems = {
  [HP_BASE]: [
    { id: HP_BASE, label: "Home" },
    { id: `${HP_BASE}/cards`, label: "Cards" },
    { id: `${HP_BASE}/products`, label: "Products" },
    { id: `${HP_BASE}/news`, label: "News" },
    { id: `${HP_BASE}/events`, label: "Events" },
    { id: `${HP_BASE}/decks`, label: "Decks" },
    { id: `${HP_BASE}/about`, label: "About" }
  ],
  [UA_BASE]: [
    { id: UA_BASE, label: "Home" },
    { id: `${UA_BASE}/cards`, label: "Cards" },
    { id: `${UA_BASE}/products`, label: "Products" },
    { id: `${UA_BASE}/news`, label: "News" },
    { id: `${UA_BASE}/events`, label: "Events" },
    { id: `${UA_BASE}/decks`, label: "Decks" },
    { id: `${UA_BASE}/about`, label: "About" }
  ],
  [OP_BASE]: [
    { id: OP_BASE, label: "Home" },
    { id: `${OP_BASE}/cards`, label: "Cards" },
    { id: `${OP_BASE}/products`, label: "Products" },
    { id: `${OP_BASE}/news`, label: "News" },
    { id: `${OP_BASE}/events`, label: "Events" },
    { id: `${OP_BASE}/decks`, label: "Decks" },
    { id: `${OP_BASE}/about`, label: "About" }
  ]
};

function getActiveBase(currentPage) {
  if (currentPage === HP_BASE || currentPage?.startsWith(`${HP_BASE}/`)) {
    return HP_BASE;
  }

  if (currentPage === UA_BASE || currentPage?.startsWith(`${UA_BASE}/`)) {
    return UA_BASE;
  }

  if (currentPage === OP_BASE || currentPage?.startsWith(`${OP_BASE}/`)) {
    return OP_BASE;
  }

  return "";
}

function Header({ currentPage, navigate }) {
  const activeBase = getActiveBase(currentPage);
  const sectionNavItems = activeBase ? gameNavItems[activeBase] : [];

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button
          type="button"
          className="site-brand"
          onClick={() => navigate("home")}
        >
          MTS' Card Game Library
        </button>

        <nav className="site-nav" aria-label="Main navigation">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={currentPage === item.id ? "nav-link active" : "nav-link"}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {sectionNavItems.length > 0 && (
        <nav className="section-nav" aria-label="Game navigation">
          {sectionNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={currentPage === item.id ? "section-link active" : "section-link"}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
