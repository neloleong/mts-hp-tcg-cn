import { news } from "../data/news";

function NewsPage() {
  return (
    <section className="page-section">
      <div className="page-title-block">
        <span className="eyebrow">News</span>
        <h1>新聞 / 更新紀錄</h1>
        <p>記錄網站更新、新卡翻譯、商品資料及活動消息。</p>
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
