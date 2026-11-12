import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage, listFrom } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SeatLayout from "../components/SeatLayout";
import BookingSummary from "../components/BookingSummary";

export default function SeatSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [showResponse, seatResponse] = await Promise.all([api.get(`/shows/${id}/`), api.get(`/shows/${id}/seats/`)]);
      setShow(showResponse.data);
      setSeats(listFrom(seatResponse));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [id]);

  const selectedSeats = useMemo(() => seats.filter((seat) => selectedIds.includes(seat.id)), [seats, selectedIds]);
  function toggleSeat(seat) {
    setSelectedIds((current) => {
      if (current.includes(seat.id)) return current.filter((id) => id !== seat.id);
      if (current.length >= 10) {
        setError("You can choose up to 10 seats per booking.");
        return current;
      }
      setError("");
      return [...current, seat.id];
    });
  }

  async function confirmBooking() {
    setSubmitting(true);
    setError("");
    try {
      const response = await api.post("/bookings/", { show_id: Number(id), seat_ids: selectedIds });
      navigate(`/bookings/${response.data.id}`, { state: { booking: response.data } });
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      if (requestError.response?.status === 409) {
        await load();
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingSpinner label="Picking out the seats…" />;
  if (!show) return <ErrorMessage onRetry={load}>{error || "That show could not be found."}</ErrorMessage>;
  const date = new Date(`${show.show_date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <Link to={`/movies/${show.movie.id}`} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-lavender"><ArrowLeft size={16} /> Movie details</Link>
      <div className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-lavender">Make it yours</p><h1 className="mt-2 font-display text-3xl font-extrabold text-ink">{show.movie.title}</h1><p className="mt-2 text-sm text-ink/55">{show.theatre.name} · {date} · {show.show_time.slice(0, 5)}</p></div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <div className="grid items-start gap-7 lg:grid-cols-[1.5fr_.7fr]">
        <SeatLayout seats={seats} selectedIds={selectedIds} onToggle={toggleSeat} />
        <BookingSummary show={show} seats={selectedSeats} onConfirm={confirmBooking} loading={submitting} />
      </div>
    </main>
  );
}
