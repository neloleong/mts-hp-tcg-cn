function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function getImageSrc(card) {
  const imageUrl = safeText(card.imageUrl);
  const imageFile = safeText(card.imageFile);

  // Vercel / GitHub 部署時，優先使用官方圖片 URL
  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  // 本機有複製 images 時，才 fallback 到本地圖片
  if (imageFile) {
    const normalizedPath = imageFile.replace(/\\/g, "/");

    if (normalizedPath.startsWith("/")) {
      return normalizedPath;
    }

    if (normalizedPath.startsWith("data/")) {
      return `/${normalizedPath}`;
    }

    if (normalizedPath.startsWith("images/")) {
      return `/data/union-arena-jp/${normalizedPath}`;
    }

    return `/data/union-arena-jp/images/${normalizedPath.split("/").pop()}`;
  }

  return "";
}

function DetailRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="ua-modal-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function TextBlock({ title, text, variant }) {
  if (!text) return null;

  return (
    <section className={variant ? `ua-rule-block ${variant}` : "ua-rule-block"}>
      <h3>{title}</h3>
      <p>{text}</p>
    </section>
  );
}

function UnionArenaCardModal({ card, onClose }) {
  if (!card) return null;

  const imageSrc = getImageSrc(card);

  return (
    <div
      className="ua-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <article className="ua-card-modal">
        <button
          type="button"
          className="ua-modal-close"
          onClick={onClose}
          aria-label="關閉"
        >
          ×
        </button>

        <div className="ua-card-modal-layout">
          <div className="ua-card-modal-image-panel">
            <div className="ua-card-modal-image">
              {imageSrc ? (
                <img src={imageSrc} alt={card.nameJp || card.cardNo} />
              ) : (
                <span>No Image</span>
              )}
            </div>
          </div>

          <div className="ua-card-modal-content">
            <div className="ua-modal-heading">
              <p className="eyebrow">UNION ARENA CARD</p>

              <h2>{card.nameZh || card.nameJp || "未命名卡牌"}</h2>

              {card.nameJp && card.nameZh !== card.nameJp && (
                <p className="ua-modal-name-jp">{card.nameJp}</p>
              )}

              {card.nameKanaJp && (
                <p className="ua-modal-kana">{card.nameKanaJp}</p>
              )}
            </div>

            <dl className="ua-modal-detail-grid">
              <DetailRow label="卡號" value={card.cardNo} />
              <DetailRow label="稀有度" value={card.rarity} />
              <DetailRow label="類型" value={card.cardTypeZh || card.cardTypeJp} />
              <DetailRow label="顏色" value={card.colorZh || card.colorJp} />
              <DetailRow label="Cost" value={card.cost} />
              <DetailRow label="AP" value={card.ap} />
              <DetailRow label="BP" value={card.bp} />
              <DetailRow label="發生能量" value={card.generatedEnergy} />
              <DetailRow label="特徵" value={card.featureZh || card.featureJp} />
              <DetailRow
                label="收錄商品"
                value={card.productNameZh || card.productNameJp}
              />
            </dl>

            <TextBlock title="效果" text={card.effectZh} variant="zh" />

            {card.effectJp && card.effectJp !== card.effectZh && (
              <TextBlock title="日文原文" text={card.effectJp} variant="jp" />
            )}

            <TextBlock title="Trigger" text={card.triggerZh} variant="trigger" />

            {card.triggerJp && card.triggerJp !== card.triggerZh && (
              <TextBlock
                title="Trigger 日文原文"
                text={card.triggerJp}
                variant="jp"
              />
            )}

            {card.sourceUrl && (
              <a
                className="ua-source-link"
                href={card.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                查看官方資料
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

export default UnionArenaCardModal;