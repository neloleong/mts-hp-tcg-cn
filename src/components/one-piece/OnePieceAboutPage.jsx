export default function OnePieceAboutPage() {
  return (
    <main className="op-page">
      <section className="op-hero">
        <p className="op-kicker">ABOUT</p>
        <h1>About this database</h1>
        <p>
          This website organizes ONE PIECE Card Game card data, product data,
          deck notes and search tools. It is an unofficial fan database.
        </p>
      </section>

      <section className="op-section">
        <h2>Data notes</h2>
        <p>
          Card data is prepared from the Traditional Chinese official card list.
          The frontend prefers official image URLs. Local images are only a fallback.
        </p>
      </section>
    </main>
  );
}
