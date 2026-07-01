import { events } from "../../data/events";

function EventPage() {
  return (
    <section className="page-section">
      <div className="page-title-block">
        <span className="eyebrow">Events</span>
        <h1>瘣餃?</h1>
        <p>?亙??舀瘥魚?岫?拇???摮豢暑???勗?鞈???/p>
      </div>

      <div className="info-grid">
        {events.map((event) => (
          <article className="info-card" key={event.id}>
            <span>{event.date}</span>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <small>?圈?嚗event.location}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EventPage;

