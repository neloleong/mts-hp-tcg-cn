import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

import PortalHomePage from "./pages/PortalHomePage";
import GameSelectPage from "./pages/GameSelectPage";

import HomePage from "./pages/HomePage";
import CardListPage from "./pages/CardListPage";
import ProductPage from "./pages/ProductPage";
import NewsPage from "./pages/NewsPage";
import EventPage from "./pages/EventPage";
import DeckPage from "./pages/DeckPage";
import AboutPage from "./pages/AboutPage";

import { recordVisit } from "./utils/visitorTracker";

const HP_BASE = "games/harry-potter";

const validPages = [
  "home",
  "games",

  HP_BASE,
  `${HP_BASE}/cards`,
  `${HP_BASE}/products`,
  `${HP_BASE}/news`,
  `${HP_BASE}/events`,
  `${HP_BASE}/decks`,
  `${HP_BASE}/about`
];

const legacyPageMap = {
  cards: `${HP_BASE}/cards`,
  products: `${HP_BASE}/products`,
  news: `${HP_BASE}/news`,
  events: `${HP_BASE}/events`,
  decks: `${HP_BASE}/decks`,
  about: `${HP_BASE}/about`
};

function normalizeRoute(route) {
  if (!route) return "home";

  const cleanRoute = route.replace(/^#/, "").trim();

  if (legacyPageMap[cleanRoute]) {
    return legacyPageMap[cleanRoute];
  }

  return validPages.includes(cleanRoute) ? cleanRoute : "home";
}

function parseHash() {
  const hash = window.location.hash.replace("#", "").trim();
  return normalizeRoute(hash);
}

function App() {
  const [currentPage, setCurrentPage] = useState(parseHash());

  useEffect(() => {
    function handleHashChange() {
      const nextPage = parseHash();
      setCurrentPage(nextPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("hashchange", handleHashChange);

    if (!window.location.hash) {
      window.location.hash = "home";
    }

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const titles = {
      home: "總首頁",
      games: "遊戲列表",

      [HP_BASE]: "Harry Potter TCG",
      [`${HP_BASE}/cards`]: "Harry Potter TCG 卡牌列表",
      [`${HP_BASE}/products`]: "Harry Potter TCG 商品情報",
      [`${HP_BASE}/news`]: "Harry Potter TCG 新聞",
      [`${HP_BASE}/events`]: "Harry Potter TCG 活動",
      [`${HP_BASE}/decks`]: "Harry Potter TCG 牌組",
      [`${HP_BASE}/about`]: "關於 Harry Potter TCG 資料庫"
    };

    document.title = `${titles[currentPage] || "總首頁"}｜MTS' Card Game Library`;
    recordVisit(document.title);
  }, [currentPage]);

  function navigate(pageId) {
    const route = normalizeRoute(pageId);
    window.location.hash = route;
  }

  const page = useMemo(() => {
    const pageMap = {
      home: <PortalHomePage navigate={navigate} />,
      games: <GameSelectPage navigate={navigate} />,

      [HP_BASE]: <HomePage navigate={navigate} />,
      [`${HP_BASE}/cards`]: <CardListPage />,
      [`${HP_BASE}/products`]: <ProductPage />,
      [`${HP_BASE}/news`]: <NewsPage />,
      [`${HP_BASE}/events`]: <EventPage />,
      [`${HP_BASE}/decks`]: <DeckPage />,
      [`${HP_BASE}/about`]: <AboutPage />
    };

    return pageMap[currentPage] || pageMap.home;
  }, [currentPage]);

  const isHarryPotterSection = currentPage.startsWith(HP_BASE);

  const shellClassName = isHarryPotterSection
    ? "app-shell hp-theme"
    : "app-shell portal-theme";

  return (
    <div className={shellClassName}>
      <Header currentPage={currentPage} navigate={navigate} />
      <main>{page}</main>
      <Footer navigate={navigate} currentPage={currentPage} />
    </div>
  );
}

export default App;