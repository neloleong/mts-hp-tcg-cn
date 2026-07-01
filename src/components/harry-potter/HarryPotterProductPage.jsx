import { products } from "../../data/products";

function ProductPage() {
  return (
    <section className="page-section">
      <div className="page-title-block">
        <span className="eyebrow">Products</span>
        <h1>???</h1>
        <p>?渡?鋆??絲憪?蝯?詨??皜??/p>
      </div>

      <div className="info-grid">
        {products.map((product) => (
          <article className="info-card" key={product.id}>
            <span>{product.type}</span>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <small>?澆?交?嚗product.releaseDate}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ProductPage;

