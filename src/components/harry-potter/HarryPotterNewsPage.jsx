import { news } from "../../data/news";

function NewsPage() {
  return (
    <section className="page-section">
      <div className="page-title-block">
        <span className="eyebrow">News</span>
        <h1>?啗? / ?湔蝝??/h1>
        <p>閮?蝬脩??湔??∠蕃霅胯?????瘣餃?瘨??/p>
      </div>

      <div className="timeline-list">
        {news.map((item) => (
          <article className="timeline-item" key={item.id}>
            <time>{item.date}</time>
            <h2>{item.title}</h2>
            <p>{item.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default NewsPage;

