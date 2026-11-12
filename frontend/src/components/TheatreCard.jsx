import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function TheatreCard({ show }) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-white/75 p-5 shadow-clay sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="font-display font-extrabold text-ink">{show.theatre.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55"><MapPin size={14} /> {show.theatre.location} · {show.theatre.address}</p>
        <p className="mt-2 text-sm text-ink/60">{new Date(`${show.show_date}T00:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} · {show.show_time.slice(0, 5)}</p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span className="font-display font-extrabold text-ink">${Number(show.ticket_price).toFixed(2)} <small className="font-sans font-medium text-ink/50">/ ticket</small></span>
        <Link to={`/shows/${show.id}/seats`} className="btn-primary">Select seats</Link>
      </div>
    </article>
  );
}
