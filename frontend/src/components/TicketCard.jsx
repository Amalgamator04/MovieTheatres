import { CalendarDays, MapPin, Ticket } from "lucide-react";

export default function TicketCard({ booking, onCancel, cancelling = false }) {
  const show = booking.show;
  const cancelled = booking.booking_status === "cancelled";
  return (
    <article className={`ticket-card relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-clay sm:p-7 ${cancelled ? "opacity-70" : ""}`}>
      <div className="absolute -right-7 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-[#f7f3ff] shadow-inner" />
      <div className="absolute -left-7 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full bg-[#f7f3ff] shadow-inner" />
      <div className="flex flex-col gap-5 sm:flex-row">
        <img src={show.movie.poster} alt="" className="h-36 w-28 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-lavender">MovieMate ticket</p><h2 className="mt-1 font-display text-xl font-extrabold text-ink">{show.movie.title}</h2></div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${cancelled ? "bg-slate-100 text-slate-500" : "bg-mint text-emerald-800"}`}>{booking.booking_status}</span>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-ink/60"><MapPin size={14} /> {show.theatre.name} · {show.theatre.location}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/60"><CalendarDays size={14} /> {new Date(`${show.show_date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {show.show_time.slice(0, 5)}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-lavender/20 pt-4">
            <div><p className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Seats · {booking.seats.join(", ")}</p><p className="mt-1 flex items-center gap-1 text-sm font-bold text-ink"><Ticket size={14} className="text-lavender" /> {booking.booking_reference}</p></div>
            <div className="flex items-center gap-3"><strong className="font-display text-lg text-ink">${Number(booking.total_amount).toFixed(2)}</strong>{onCancel && !cancelled && <button onClick={() => onCancel(booking.id)} disabled={cancelling} className="text-sm font-bold text-rose-500 underline disabled:opacity-50">{cancelling ? "Cancelling…" : "Cancel"}</button>}</div>
          </div>
        </div>
      </div>
      <button onClick={() => window.print()} className="print:hidden mt-4 text-xs font-bold text-lavender underline">Print ticket</button>
    </article>
  );
}
