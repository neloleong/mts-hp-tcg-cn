import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import PortalHomePage from "./pages/portal/PortalHomePage";
import GameSelectPage from "./pages/portal/GameSelectPage";

import HarryPotterHomePage from "./components/harry-potter/HarryPotterHomePage";
import HarryPotterCardListPage from "./components/harry-potter/HarryPotterCardListPage";
import HarryPotterProductPage from "./components/harry-potter/HarryPotterProductPage";
import HarryPotterNewsPage from "./components/harry-potter/HarryPotterNewsPage";
import HarryPotterEventPage from "./components/harry-potter/HarryPotterEventPage";
import HarryPotterDeckPage from "./components/harry-potter/HarryPotterDeckPage";
import HarryPotterAboutPage from "./components/harry-potter/HarryPotterAboutPage";

import UnionArenaHomePage from "./components/union-arena/UnionArenaHomePage";
import UnionArenaCardListPage from "./components/union-arena/UnionArenaCardListPage";
import UnionArenaProductPage from "./components/union-arena/UnionArenaProductPage";
import UnionArenaNewsPage from "./components/union-arena/UnionArenaNewsPage";
import UnionArenaEventPage from "./components/union-arena/UnionArenaEventPage";
import UnionArenaDeckPage from "./components/union-arena/UnionArenaDeckPage";
import UnionArenaAboutPage from "./components/union-arena/UnionArenaAboutPage";

import OnePieceHomePage from "./components/one-piece/OnePieceHomePage";
import OnePieceCardListPage from "./components/one-piece/OnePieceCardListPage";
import OnePieceProductPage from "./components/one-piece/OnePieceProductPage";
import OnePieceNewsPage from "./components/one-piece/OnePieceNewsPage";
import OnePieceEventPage from "./components/one-piece/OnePieceEventPage";
import OnePieceDeckPage from "./components/one-piece/OnePieceDeckPage";
import OnePieceAboutPage from "./components/one-piece/OnePieceAboutPage";

import { recordVisit } from "./utils/visitorTracker";

const HP_BASE = "games/harry-potter";
const UA_BASE = "games/union-arena";
const OP_BASE = "games/one-piece";

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
  UNION_ARENA_ABOUT: `${UA_BASE}/about`,

  ONE_PIECE_HOME: OP_BASE,
  ONE_PIECE_CARDS: `${OP_BASE}/cards`,
  ONE_PIECE_PRODUCTS: `${OP_BASE}/products`,
  ONE_PIECE_NEWS: `${OP_BASE}/news`,
  ONE_PIECE_EVENTS: `${OP_BASE}/events`,
  ONE_PIECE_DECKS: `${OP_BASE}/decks`,
  ONE_PIECE_ABOUT: `${OP_BASE}/about`
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
  "union-arena-about": ROUTES.UNION_ARENA_ABOUT,

  "one-piece": ROUTES.ONE_PIECE_HOME,
  "one-piece-cards": ROUTES.ONE_PIECE_CARDS,
  "one-piece-products": ROUTES.ONE_PIECE_PRODUCTS,
  "one-piece-news": ROUTES.ONE_PIECE_NEWS,
  "one-piece-events": ROUTES.ONE_PIECE_EVENTS,
  "one-piece-decks": ROUTES.ONE_PIECE_DECKS,
  "one-piece-about": ROUTES.ONE_PIECE_ABOUT
};

const pageTitles = {
  [ROUTES.PORTAL_HOME]: "Home",
  [ROUTES.GAME_SELECT]: "Game Library",

  [ROUTES.HARRY_POTTER_HOME]: "Harry Potter TCG",
  [ROUTES.HARRY_POTTER_CARDS]: "Harry Potter TCG Cards",
  [ROUTES.HARRY_POTTER_PRODUCTS]: "Harry Potter TCG Products",
  [ROUTES.HARRY_POTTER_NEWS]: "Harry Potter TCG News",
  [ROUTES.HARRY_POTTER_EVENTS]: "Harry Potter TCG Events",
  [ROUTES.HARRY_POTTER_DECKS]: "Harry Potter TCG Decks",
  [ROUTES.HARRY_POTTER_ABOUT]: "About Harry Potter TCG",

  [ROUTES.UNION_ARENA_HOME]: "UNION ARENA",
  [ROUTES.UNION_ARENA_CARDS]: "UNION ARENA Cards",
  [ROUTES.UNION_ARENA_PRODUCTS]: "UNION ARENA Products",
  [ROUTES.UNION_ARENA_NEWS]: "UNION ARENA News",
  [ROUTES.UNION_ARENA_EVENTS]: "UNION ARENA Events",
  [ROUTES.UNION_ARENA_DECKS]: "UNION ARENA Decks",
  [ROUTES.UNION_ARENA_ABOUT]: "About UNION ARENA",

  [ROUTES.ONE_PIECE_HOME]: "ONE PIECE Card Game",
  [ROUTES.ONE_PIECE_CARDS]: "ONE PIECE Card Game Cards",
  [ROUTES.ONE_PIECE_PRODUCTS]: "ONE PIECE Card Game Products",
  [ROUTES.ONE_PIECE_NEWS]: "ONE PIECE Card Game News",
  [ROUTES.ONE_PIECE_EVENTS]: "ONE PIECE Card Game Events",
  [ROUTES.ONE_PIECE_DECKS]: "ONE PIECE Card Game Decks",
  [ROUTES.ONE_PIECE_ABOUT]: "About ONE PIECE Card Game"
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

function isOnePieceRoute(pageId) {
  return pageId === OP_BASE || pageId.startsWith(`${OP_BASE}/`);
}

function getShellClassName(currentPage) {
  if (isHarryPotterRoute(currentPage)) {
    return "app-shell hp-theme";
  }

  if (isUnionArenaRoute(currentPage)) {
    return "app-shell union-arena-theme";
  }

  if (isOnePieceRoute(currentPage)) {
    return "app-shell one-piece-theme";
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

    document.title = `${title} | MTS' Card Game Library`;
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
      [ROUTES.UNION_ARENA_ABOUT]: <UnionArenaAboutPage />,

      [ROUTES.ONE_PIECE_HOME]: (
        <OnePieceHomePage navigate={navigate} />
      ),
      [ROUTES.ONE_PIECE_CARDS]: <OnePieceCardListPage />,
      [ROUTES.ONE_PIECE_PRODUCTS]: <OnePieceProductPage />,
      [ROUTES.ONE_PIECE_NEWS]: <OnePieceNewsPage />,
      [ROUTES.ONE_PIECE_EVENTS]: <OnePieceEventPage />,
      [ROUTES.ONE_PIECE_DECKS]: <OnePieceDeckPage />,
      [ROUTES.ONE_PIECE_ABOUT]: <OnePieceAboutPage />
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