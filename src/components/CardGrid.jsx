function CardImage({ card }) {
  if (card.imageUrl) {
    return <img src={card.imageUrl} alt={card.nameZh} />;
  }

  return (
    <div className="card-placeholder">
      <span>{card.cost}</span>
      <strong>{card.nameZh}</strong>
      <small>{card.type}</small>
    </div>
  );
}

function CardGrid({ cards, onOpen }) {
  if (!cards.length) {
    return <div className="empty-box">沒有找到符合條件的卡牌。</div>;
  }

  return (
    <div className="card-grid">
      {cards.map((card) => (
        <button className="tcg-card" type="button" key={card.id} onClick={() => onOpen(card)}>
          <div className="tcg-card-image"><CardImage card={card} /></div>
          <div className="tcg-card-body">
            <div className="tcg-card-no">{card.cardNo}</div>
            <h3>{card.nameZh}</h3>
            <p>{card.nameOriginal}</p>
            <div className="tag-row">
              <span>{card.type}</span>
              <span>{card.rarity}</span>
              <span>費用 {card.cost}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default CardGrid;
