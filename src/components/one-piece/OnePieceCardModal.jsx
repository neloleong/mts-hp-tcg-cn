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
          ?
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

          <h2 className="op-modal-title">{card.name || "?芸???}</h2>

          <div className="op-modal-badges">
            {card.cardNo && <span>{card.cardNo}</span>}
            {card.rarity && <span>{card.rarity}</span>}
            {card.cardType && <span>{card.cardType}</span>}
            {card.color && <span>{card.color}</span>}
          </div>

          <div className="op-modal-detail-grid">
            <DetailRow label="?∟?" value={card.cardNo} />
            <DetailRow label="蝔?漲" value={card.rarity} />
            <DetailRow label="?∠車" value={card.cardType} />
            <DetailRow label="鞎餌" value={card.cost} />
            <DetailRow label="??? value={card.life} />
            <DetailRow label="撅祆? value={card.attribute} />
            <DetailRow label="???? value={card.power} />
            <DetailRow label="???? value={card.counter} />
            <DetailRow label="憿" value={card.color} />
            <DetailRow label="?游撐閮?" value={card.block} />
            <DetailRow label="?孵?" value={card.feature} />
            <DetailRow label="?園???" value={card.cardSet || card.productName} />
            <DetailRow label="蝟餃?" value={card.seriesName} />
          </div>

          {card.effect && (
            <section className="op-modal-text-section">
              <h3>??</h3>
              <p>{card.effect}</p>
            </section>
          )}

          {card.trigger && (
            <section className="op-modal-text-section">
              <h3>閫貊</h3>
              <p>{card.trigger}</p>
            </section>
          )}

          {card.sourceUrl && (
            <a className="op-official-link" href={card.sourceUrl} target="_blank" rel="noreferrer">
              ?亦?摰鞈?
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

