import { useMemo } from "react";

export default function SeatLayout({ seats, selectedIds, onToggle }) {
  const rows = useMemo(() => {
    const grouped = {};
    for (const seat of seats) (grouped[seat.row] ||= []).push(seat);
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  return (
    <div className="rounded-[2rem] bg-white/70 p-5 shadow-clay sm:p-8">
      <div className="mx-auto mb-10 max-w-2xl">
        <div className="h-2 rounded-full bg-gradient-to-r from-transparent via-lavender/70 to-transparent" />
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[.38em] text-ink/40">Screen this way</p>
      </div>
      <div className="space-y-3">
        {rows.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="w-5 text-xs font-bold text-ink/40">{row}</span>
            <div className="flex gap-1.5 sm:gap-2">
              {rowSeats.map((seat) => {
                const selected = selectedIds.includes(seat.id);
                const stateClass = seat.is_booked ? "cursor-not-allowed bg-slate-200 text-slate-400" : selected ? "bg-lavender text-white shadow-raised" : "bg-mint text-emerald-800 hover:-translate-y-1 hover:bg-emerald-200";
                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={seat.is_booked}
                    onClick={() => onToggle(seat)}
                    aria-label={`Seat ${seat.seat_number}${seat.is_booked ? ", booked" : selected ? ", selected" : ", available"}`}
                    aria-pressed={selected}
                    className={`grid h-8 w-8 place-items-center rounded-xl text-[10px] font-bold transition-all sm:h-10 sm:w-10 sm:rounded-2xl sm:text-xs ${stateClass}`}
                  >{seat.column}</button>
                );
              })}
            </div>
            <span className="w-5 text-xs font-bold text-ink/40">{row}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-ink/55">
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-mint" /> Available</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-lavender" /> Selected</span>
        <span className="flex items-center gap-2"><i className="h-3 w-3 rounded bg-slate-200" /> Booked</span>
      </div>
    </div>
  );
}
