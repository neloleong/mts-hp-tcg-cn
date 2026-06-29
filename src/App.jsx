import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import PortalHomePage from "./pages/portal/PortalHomePage";
import GameSelectPage from "./pages/portal/GameSelectPage";

import HarryPotterHomePage from "./pages/harry-potter/HarryPotterHomePage";
import HarryPotterCardListPage from "./pages/harry-potter/HarryPotterCardListPage";
import HarryPotterProductPage from "./pages/harry-potter/HarryPotterProductPage";
import HarryPotterNewsPage from "./pages/harry-potter/HarryPotterNewsPage";
import HarryPotterEventPage from "./pages/harry-potter/HarryPotterEventPage";
import HarryPotterDeckPage from "./pages/harry-potter/HarryPotterDeckPage";
import HarryPotterAboutPage from "./pages/harry-potter/HarryPotterAboutPage";

import UnionArenaHomePage from "./pages/union-arena/UnionArenaHomePage";
import UnionArenaCardListPage from "./pages/union-arena/UnionArenaCardListPage";
import UnionArenaProductPage from "./pages/union-arena/UnionArenaProductPage";
import UnionArenaNewsPage from "./pages/union-arena/UnionArenaNewsPage";
import UnionArenaEventPage from "./pages/union-arena/UnionArenaEventPage";
import UnionArenaDeckPage from "./pages/union-arena/UnionArenaDeckPage";
import UnionArenaAboutPage from "./pages/union-arena/UnionArenaAboutPage";

import { recordVisit } from "./utils/visitorTracker";

const HP_BASE = "games/harry-potter";
const UA_BASE = "games/union-arena";

const ROUTES = {
  PORTAL_HOME: "home",
  GAME_SELECT: "games",

  HARRY_POTTER_HOME: HP_BASE,
  HARRY_POTTER_CARDS: `${HP_BASE}/cards`,
  HARRY_POTTER_PRODUCTS: `${HP_BASE}/products`,
  HARRY_POTTER_NEWS: `${HP_BASE}/news`,
  HARRY_POTTER_EVENTS: `${HP_BASE}/events`,
  HARRY_POTTER_DECKS: `${HP_BASE}/decks`,
  HARRY_POTTER_ABOUT: `${HP_BASE}/about`,

  UNION_ARENA_HOME: UA_BASE,
  UNION_ARENA_CARDS: `${UA_BASE}/cards`,
  UNION_ARENA_PRODUCTS: `${UA_BASE}/products`,
  UNION_ARENA_NEWS: `${UA_BASE}/news`,
  UNION_ARENA_EVENTS: `${UA_BASE}/events`,
  UNION_ARENA_DECKS: `${UA_BASE}/decks`,
  UNION_ARENA_ABOUT: `${UA_BASE}/about`
};

const validPages = Object.values(ROUTES);

const legacyPageMap = {
  cards: ROUTES.HARRY_POTTER_CARDS,
  products: ROUTES.HARRY_POTTER_PRODUCTS,
  news: ROUTES.HARRY_POTTER_NEWS,
  events: ROUTES.HARRY_POTTER_EVENTS,
  decks: ROUTES.HARRY_POTTER_DECKS,
  about: ROUTES.HARRY_POTTER_ABOUT,

  "union-arena": ROUTES.UNION_ARENA_HOME,
  "union-arena-cards": ROUTES.UNION_ARENA_CARDS,
  "union-arena-products": ROUTES.UNION_ARENA_PRODUCTS,
  "union-arena-news": ROUTES.UNION_ARENA_NEWS,
  "union-arena-events": ROUTES.UNION_ARENA_EVENTS,
  "union-arena-decks": ROUTES.UNION_ARENA_DECKS,
  "union-arena-about": ROUTES.UNION_ARENA_ABOUT
};

const pageTitles = {
  [ROUTES.PORTAL_HOME]: "總首頁",
  [ROUTES.GAME_SELECT]: "遊戲列表",

  [ROUTES.HARRY_POTTER_HOME]: "Harry Potter TCG",
  [ROUTES.HARRY_POTTER_CARDS]: "Harry Potter TCG 卡牌列表",
  [ROUTES.HARRY_POTTER_PRODUCTS]: "Harry Potter TCG 商品情報",
  [ROUTES.HARRY_POTTER_NEWS]: "Harry Potter TCG 新聞",
  [ROUTES.HARRY_POTTER_EVENTS]: "Harry Potter TCG 活動",
  [ROUTES.HARRY_POTTER_DECKS]: "Harry Potter TCG 牌組",
  [ROUTES.HARRY_POTTER_ABOUT]: "關於 Harry Potter TCG 資料庫",

  [ROUTES.UNION_ARENA_HOME]: "UNION ARENA",
  [ROUTES.UNION_ARENA_CARDS]: "UNION ARENA 卡牌列表",
  [ROUTES.UNION_ARENA_PRODUCTS]: "UNION ARENA 商品情報",
  [ROUTES.UNION_ARENA_NEWS]: "UNION ARENA 新聞",
  [ROUTES.UNION_ARENA_EVENTS]: "UNION ARENA 活動",
  [ROUTES.UNION_ARENA_DECKS]: "UNION ARENA 牌組",
  [ROUTES.UNION_ARENA_ABOUT]: "關於 UNION ARENA 資料庫"
};

function normalizeRoute(route) {
  if (!route) return ROUTES.PORTAL_HOME;

  const cleanRoute = String(route)
    .replace(/^#/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .trim();

  if (!cleanRoute) return ROUTES.PORTAL_HOME;

  if (legacyPageMap[cleanRoute]) {
    return legacyPageMap[cleanRoute];
  }

  return validPages.includes(cleanRoute) ? cleanRoute : ROUTES.PORTAL_HOME;
}

function parseHash() {
  return normalizeRoute(window.location.hash);
}

function toHashPath(pageId) {
  const route = normalizeRoute(pageId);
  return `#/${route}`;
}

function isHarryPotterRoute(pageId) {
  return pageId === HP_BASE || pageId.startsWith(`${HP_BASE}/`);
}

function isUnionArenaRoute(pageId) {
  return pageId === UA_BASE || pageId.startsWith(`${UA_BASE}/`);
}

function getShellClassName(currentPage) {
  if (isHarryPotterRoute(currentPage)) {
    return "app-shell hp-theme";
  }

  if (isUnionArenaRoute(currentPage)) {
    return "app-shell union-arena-theme";
  }

  return "app-shell portal-theme";
}

function App() {
  const [currentPage, setCurrentPage] = useState(parseHash);

  const navigate = useCallback((pageId) => {
    const route = normalizeRoute(pageId);
    const nextHash = toHashPath(route);

    if (window.location.hash === nextHash) {
      setCurrentPage(route);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.location.hash = `/${route}`;
  }, []);

  useEffect(() => {
    function handleHashChange() {
      const nextPage = parseHash();
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("hashchange", handleHashChange);

    if (!window.location.hash) {
      window.location.hash = `/${ROUTES.PORTAL_HOME}`;
    } else {
      handleHashChange();
    }

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  useEffect(() => {
    const title = pageTitles[currentPage] || pageTitles[ROUTES.PORTAL_HOME];

    document.title = `${title}｜MTS' Card Game Library`;
    recordVisit(document.title);
  }, [currentPage]);

  const page = useMemo(() => {
    const pageMap = {
      [ROUTES.PORTAL_HOME]: <PortalHomePage navigate={navigate} />,
      [ROUTES.GAME_SELECT]: <GameSelectPage navigate={navigate} />,

      [ROUTES.HARRY_POTTER_HOME]: (
        <HarryPotterHomePage navigate={navigate} />
      ),
      [ROUTES.HARRY_POTTER_CARDS]: <HarryPotterCardListPage />,
      [ROUTES.HARRY_POTTER_PRODUCTS]: <HarryPotterProductPage />,
      [ROUTES.HARRY_POTTER_NEWS]: <HarryPotterNewsPage />,
      [ROUTES.HARRY_POTTER_EVENTS]: <HarryPotterEventPage />,
      [ROUTES.HARRY_POTTER_DECKS]: <HarryPotterDeckPage />,
      [ROUTES.HARRY_POTTER_ABOUT]: <HarryPotterAboutPage />,

      [ROUTES.UNION_ARENA_HOME]: (
        <UnionArenaHomePage navigate={navigate} />
      ),
      [ROUTES.UNION_ARENA_CARDS]: <UnionArenaCardListPage />,
      [ROUTES.UNION_ARENA_PRODUCTS]: <UnionArenaProductPage />,
      [ROUTES.UNION_ARENA_NEWS]: <UnionArenaNewsPage />,
      [ROUTES.UNION_ARENA_EVENTS]: <UnionArenaEventPage />,
      [ROUTES.UNION_ARENA_DECKS]: <UnionArenaDeckPage />,
      [ROUTES.UNION_ARENA_ABOUT]: <UnionArenaAboutPage />
    };

    return pageMap[currentPage] || pageMap[ROUTES.PORTAL_HOME];
  }, [currentPage, navigate]);

  const shellClassName = getShellClassName(currentPage);

  return (
    <div className={shellClassName}>
      <Header currentPage={currentPage} navigate={navigate} />

      <main>{page}</main>

      <Footer navigate={navigate} currentPage={currentPage} />
    </div>
  );
}

export default App;