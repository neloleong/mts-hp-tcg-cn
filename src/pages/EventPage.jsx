import { events } from "../data/events";

function EventPage() {
  return (
    <section className="page-section">
      <div className="page-title-block">
        <span className="eyebrow">Events</span>
        <h1>活動</h1>
        <p>日後可放比賽、試玩會、教學活動與報名資訊。</p>
      </div>

      <div className="info-grid">
        {events.map((event) => (
          <article className="info-card" key={event.id}>
            <span>{event.date}</span>
            <h2>{event.title}</h2>
            <p>{event.description}</p>
            <small>地點：{event.location}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EventPage;
