import { TicketCheck } from "lucide-react";

export default function BookingSummary({ show, seats, onConfirm, loading }) {
  return (
    <aside className="h-fit rounded-[2rem] bg-white p-6 shadow-clay">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-rose-500"><TicketCheck /></span>
        <div><p className="font-display font-extrabold text-ink">Your tickets</p><p className="text-xs text-ink/50">Looking like a good night</p></div>
      </div>
      <div className="space-y-3 border-y border-dashed border-lavender/20 py-4 text-sm">
        <div className="flex justify-between gap-4"><span className="text-ink/55">Movie</span><strong className="text-right">{show.movie.title}</strong></div>
        <div className="flex justify-between gap-4"><span className="text-ink/55">Seats</span><strong>{seats.length ? seats.map((seat) => seat.seat_number).join(", ") : "Choose seats"}</strong></div>
        <div className="flex justify-between gap-4"><span className="text-ink/55">Price</span><strong>${Number(show.ticket_price).toFixed(2)} × {seats.length}</strong></div>
      </div>
      <div className="flex justify-between py-4 font-display font-extrabold text-ink"><span>Total</span><span>${(Number(show.ticket_price) * seats.length).toFixed(2)}</span></div>
      <button className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50" onClick={onConfirm} disabled={!seats.length || loading}>
        {loading ? "Booking…" : "Confirm booking"}
      </button>
      <p className="mt-3 text-center text-xs text-ink/45">Up to 10 seats · Cancel before showtime</p>
    </aside>
  );
}
