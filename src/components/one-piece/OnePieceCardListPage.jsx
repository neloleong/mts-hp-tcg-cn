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

  return Array.from(values).sort((a, b) => String(a).localeCompare(String(b)));
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
          throw new Error("cards.tc.json is not an array");
        }

        if (!cancelled) {
          setCards(data);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(`Failed to load cards: ${error.message}`);
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
      cardSets: uniqueValues(cards, (card) => card.cardSet || card.productName)
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
        <h1>Card List</h1>
        <p>
          Search ONE PIECE Card Game cards by name, number, effect, color, type,
          rarity and product.
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
            placeholder="Search name, number, effect, trait or product..."
          />

          <button type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>

        <div className="op-filter-grid">
          <label>
            <span>Color</span>
            <select value={color} onChange={handleFilterChange(setColor)}>
              <option value="">All colors</option>
              {filterOptions.colors.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Type</span>
            <select value={cardType} onChange={handleFilterChange(setCardType)}>
              <option value="">All types</option>
              {filterOptions.cardTypes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Rarity</span>
            <select value={rarity} onChange={handleFilterChange(setRarity)}>
              <option value="">All rarities</option>
              {filterOptions.rarities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Product</span>
            <select value={cardSet} onChange={handleFilterChange(setCardSet)}>
              <option value="">All products</option>
              {filterOptions.cardSets.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="op-result-summary">
          {loading ? "Loading..." : `Showing ${visibleCards.length} / ${filteredCards.length} cards`}
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
                  key={card.id || `${card.cardNo}-${card.name}`}
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
                      {card.cost && <span>Cost {card.cost}</span>}
                      {card.life && <span>Life {card.life}</span>}
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
                Load more
              </button>
            </div>
          )}

          {filteredCards.length === 0 && (
            <div className="op-empty-state">No cards matched your filters.</div>
          )}
        </>
      )}

      <OnePieceCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </main>
  );
}
