import { useEffect, useMemo, useState } from "react";
import OnePieceCardModal from "./OnePieceCardModal";

const CARD_DATA_URL = "/data/one-piece-tc/cards.tc.json";
const PAGE_SIZE = 240;

function uniqueValues(cards, getter) {
  const values = new Set();

  for (const card of cards) {
    const value = getter(card);

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) values.add(item);
      });
    } else if (value) {
      values.add(value);
    }
  }

  return Array.from(values).sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));
}

function matchesFilter(value, selectedValue) {
  if (!selectedValue) return true;
  if (Array.isArray(value)) return value.includes(selectedValue);
  return value === selectedValue;
}

export default function OnePieceCardListPage() {
  const [cards, setCards] = useState([]);
  const [query, setQuery] = useState("");
  const [color, setColor] = useState("");
  const [cardType, setCardType] = useState("");
  const [rarity, setRarity] = useState("");
  const [cardSet, setCardSet] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCards() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(CARD_DATA_URL);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("cards.tc.json ?澆?銝 array");
        }

        if (!cancelled) {
          setCards(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(`?⊥?頛 One Piece ?∠?鞈?嚗?{error.message}`);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCards();

    return () => {
      cancelled = true;
    };
  }, []);

  const filterOptions = useMemo(() => {
    return {
      colors: uniqueValues(cards, (card) => card.colors || card.color),
      cardTypes: uniqueValues(cards, (card) => card.cardType),
      rarities: uniqueValues(cards, (card) => card.rarity),
      cardSets: uniqueValues(cards, (card) => card.cardSet || card.productName),
    };
  }, [cards]);

  const filteredCards = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return cards.filter((card) => {
      const searchText = card.searchText || "";

      const keywordMatched =
        !keyword ||
        searchText.includes(keyword) ||
        String(card.name || "").toLowerCase().includes(keyword) ||
        String(card.cardNo || "").toLowerCase().includes(keyword);

      return (
        keywordMatched &&
        matchesFilter(card.colors || card.color, color) &&
        matchesFilter(card.cardType, cardType) &&
        matchesFilter(card.rarity, rarity) &&
        matchesFilter(card.cardSet || card.productName, cardSet)
      );
    });
  }, [cards, query, color, cardType, rarity, cardSet]);

  const visibleCards = filteredCards.slice(0, visibleCount);

  function resetFilters() {
    setQuery("");
    setColor("");
    setCardType("");
    setRarity("");
    setCardSet("");
    setVisibleCount(PAGE_SIZE);
  }

  function handleFilterChange(setter) {
    return (event) => {
      setter(event.target.value);
      setVisibleCount(PAGE_SIZE);
    };
  }

  return (
    <main className="op-page op-card-list-page">
      <section className="op-hero op-card-list-hero">
        <p className="op-kicker">ONE PIECE CARD GAME</p>
        <h1>?∠??”</h1>
        <p>
          ?園? ONE PIECE Card Game 蝜?銝剜???????舀??∪???????脯蝔柴??漲?????撠?
        </p>
      </section>

      <section className="op-filter-panel">
        <div className="op-search-row">
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="???∪?????敺????.."
          />

          <button type="button" onClick={resetFilters}>
            ?身
          </button>
        </div>

        <div className="op-filter-grid">
          <label>
            <span>憿</span>
            <select value={color} onChange={handleFilterChange(setColor)}>
              <option value="">?券憿</option>
              {filterOptions.colors.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>?∠車</span>
            <select value={cardType} onChange={handleFilterChange(setCardType)}>
              <option value="">?券?∠車</option>
              {filterOptions.cardTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>蝔?漲</span>
            <select value={rarity} onChange={handleFilterChange(setRarity)}>
              <option value="">?券蝔?漲</option>
              {filterOptions.rarities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>?園???</span>
            <select value={cardSet} onChange={handleFilterChange(setCardSet)}>
              <option value="">?券??</option>
              {filterOptions.cardSets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="op-result-summary">
          {loading ? "鞈?頛銝?.." : `憿舐內 ${visibleCards.length} / ${filteredCards.length} 撘萄?}
        </div>
      </section>

      {errorMessage && <div className="op-alert">{errorMessage}</div>}

      {!loading && !errorMessage && (
        <>
          <section className="op-card-grid">
            {visibleCards.map((card) => {
              const imageSrc = card.imageUrl || card.localImageUrl || "";

              return (
                <button
                  className="op-card-tile"
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedCard(card)}
                >
                  <div className="op-card-image-wrap">
                    {imageSrc ? (
                      <img src={imageSrc} alt={card.name || card.cardNo} loading="lazy" />
                    ) : (
                      <div className="op-card-image-placeholder">NO IMAGE</div>
                    )}
                  </div>

                  <div className="op-card-info">
                    <div className="op-card-meta">
                      <span>{card.cardNo}</span>
                      <span>{card.rarity}</span>
                    </div>

                    <h2>{card.name}</h2>

                    <div className="op-card-badges">
                      {card.cardType && <span>{card.cardType}</span>}
                      {card.color && <span>{card.color}</span>}
                      {card.cost && <span>鞎餌 {card.cost}</span>}
                      {card.life && <span>? {card.life}</span>}
                      {card.power && <span>{card.power}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </section>

          {visibleCount < filteredCards.length && (
            <div className="op-load-more-wrap">
              <button
                className="op-load-more-button"
                type="button"
                onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
              >
                頛?游??∠?
              </button>
            </div>
          )}

          {filteredCards.length === 0 && (
            <div className="op-empty-state">
              ?曆??啁泵??隞嗥??∠????岫?湔??摮??身蝭拚??
            </div>
          )}
        </>
      )}

      <OnePieceCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </main>
  );
}

