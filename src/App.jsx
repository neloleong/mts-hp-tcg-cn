import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import CardListPage from "./pages/CardListPage";
import ProductPage from "./pages/ProductPage";
import NewsPage from "./pages/NewsPage";
import EventPage from "./pages/EventPage";
import DeckPage from "./pages/DeckPage";
import AboutPage from "./pages/AboutPage";
import { recordVisit } from "./utils/visitorTracker";

const validPages = ["home", "cards", "products", "news", "events", "decks", "about"];

function parseHash() {
  const hash = window.location.hash.replace("#", "").trim();
  if (!hash) return "home";

  const page = hash.split("/")[0];
  return validPages.includes(page) ? page : "home";
}

function App() {
  const [currentPage, setCurrentPage] = useState(parseHash());

  useEffect(() => {
    function handleHashChange() {
      setCurrentPage(parseHash());
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    window.addEventListener("hashchange", handleHashChange);
    if (!window.location.hash) window.location.hash = "home";

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const titles = {
      home: "首頁",
      cards: "卡牌列表",
      products: "商品情報",
      news: "新聞",
      events: "活動",
      decks: "牌組",
      about: "關於本站"
    };

    document.title = `${titles[currentPage] || "首頁"}｜MTS' Harry Potter TCG 中文卡牌資料庫`;
    recordVisit(document.title);
  }, [currentPage]);

  function navigate(pageId) {
    window.location.hash = validPages.includes(pageId) ? pageId : "home";
  }

  const page = useMemo(() => {
    const pageMap = {
      home: <HomePage navigate={navigate} />,
      cards: <CardListPage />,
      products: <ProductPage />,
      news: <NewsPage />,
      events: <EventPage />,
      decks: <DeckPage />,
      about: <AboutPage />
    };

    return pageMap[currentPage] || pageMap.home;
  }, [currentPage]);

  return (
    <div className="app-shell">
      <Header currentPage={currentPage} navigate={navigate} />
      <main>{page}</main>
      <Footer navigate={navigate} />
    </div>
  );
}

export default App;
