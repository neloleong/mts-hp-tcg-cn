import { products } from "../data/products";

function ProductPage() {
  return (
    <section className="page-section">
      <div className="page-title-block">
        <span className="eyebrow">Products</span>
        <h1>商品情報</h1>
        <p>整理補充包、起始牌組、特典卡及收錄卡清單。</p>
      </div>

      <div className="info-grid">
        {products.map((product) => (
          <article className="info-card" key={product.id}>
            <span>{product.type}</span>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <small>發售日期：{product.releaseDate}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProductPage;
