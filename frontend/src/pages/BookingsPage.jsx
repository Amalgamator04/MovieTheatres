import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket } from "lucide-react";
import api, { getErrorMessage, listFrom } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TicketCard from "../components/TicketCard";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setBookings(listFrom(await api.get("/bookings/")));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function cancel(id) {
    if (!window.confirm("Cancel this booking? The seats will be released.")) return;
    setCancelling(id);
    setError("");
    try {
      await api.post(`/bookings/${id}/cancel/`);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setCancelling(null);
    }
  }

  return (
    <main className="mx-auto min-h-[55vh] max-w-5xl px-5 py-12 lg:px-8">
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-lavender">Your movie nights</p><h1 className="mt-2 font-display text-4xl font-extrabold text-ink">My bookings</h1></div>
      {error && <ErrorMessage onRetry={load}>{error}</ErrorMessage>}
      {loading ? <LoadingSpinner label="Finding your tickets…" /> : bookings.length ? <div className="space-y-5">{bookings.map((booking) => <TicketCard key={booking.id} booking={booking} onCancel={cancel} cancelling={cancelling === booking.id} />)}</div> : (
        <div className="rounded-[2rem] bg-white/70 px-6 py-16 text-center shadow-clay"><Ticket size={35} className="mx-auto text-lavender" /><h2 className="mt-4 font-display text-xl font-extrabold text-ink">No tickets yet</h2><p className="mt-2 text-sm text-ink/55">Your next favorite movie night is waiting.</p><Link to="/" className="btn-primary mt-5">Explore movies</Link></div>
      )}
    </main>
  );
}
