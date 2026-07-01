import { useEffect } from "react";

function DetailRow({ label, value }) {
  if (!value || value === "-") return null;

  return (
    <div className="op-modal-detail-row">
      <span className="op-modal-detail-label">{label}</span>
      <span className="op-modal-detail-value">{value}</span>
    </div>
  );
}

export default function OnePieceCardModal({ card, onClose }) {
  useEffect(() => {
    if (!card) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [card, onClose]);

  if (!card) return null;

  const imageSrc = card.imageUrl || card.localImageUrl || "";

  return (
    <div className="op-modal-backdrop" onClick={onClose}>
      <div className="op-modal-panel" onClick={(event) => event.stopPropagation()}>
        <button className="op-modal-close" type="button" onClick={onClose}>
          x
        </button>

        <div className="op-modal-image-wrap">
          {imageSrc ? (
            <img className="op-modal-image" src={imageSrc} alt={card.name || card.cardNo} />
          ) : (
            <div className="op-modal-image-placeholder">NO IMAGE</div>
          )}
        </div>

        <div className="op-modal-content">
          <p className="op-kicker">ONE PIECE CARD</p>

          <h2 className="op-modal-title">{card.name || "Unnamed card"}</h2>

          <div className="op-modal-badges">
            {card.cardNo && <span>{card.cardNo}</span>}
            {card.rarity && <span>{card.rarity}</span>}
            {card.cardType && <span>{card.cardType}</span>}
            {card.color && <span>{card.color}</span>}
          </div>

          <div className="op-modal-detail-grid">
            <DetailRow label="Card No." value={card.cardNo} />
            <DetailRow label="Rarity" value={card.rarity} />
            <DetailRow label="Type" value={card.cardType} />
            <DetailRow label="Cost" value={card.cost} />
            <DetailRow label="Life" value={card.life} />
            <DetailRow label="Attribute" value={card.attribute} />
            <DetailRow label="Power" value={card.power} />
            <DetailRow label="Counter" value={card.counter} />
            <DetailRow label="Color" value={card.color} />
            <DetailRow label="Block" value={card.block} />
            <DetailRow label="Trait" value={card.feature} />
            <DetailRow label="Product" value={card.cardSet || card.productName} />
            <DetailRow label="Series" value={card.seriesName} />
          </div>

          {card.effect && (
            <section className="op-modal-text-section">
              <h3>Effect</h3>
              <p>{card.effect}</p>
            </section>
          )}

          {card.trigger && (
            <section className="op-modal-text-section">
              <h3>Trigger</h3>
              <p>{card.trigger}</p>
            </section>
          )}

          {card.sourceUrl && (
            <a className="op-official-link" href={card.sourceUrl} target="_blank" rel="noreferrer">
              Official source
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
