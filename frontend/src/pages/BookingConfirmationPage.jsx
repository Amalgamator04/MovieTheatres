import { useEffect, useState } from "react";
import { Check, Clapperboard } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TicketCard from "../components/TicketCard";

export default function BookingConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!location.state?.booking);
  const [error, setError] = useState("");

  useEffect(() => {
    if (booking) return;
    api.get(`/bookings/${id}/`)
      .then(({ data }) => setBooking(data))
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, [id, booking]);

  if (loading) return <LoadingSpinner label="Getting your ticket ready…" />;
  return (
    <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {booking && <>
        <div className="mb-8 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mint text-emerald-700 shadow-clay"><Check size={30} /></span><p className="mt-5 text-xs font-bold uppercase tracking-widest text-lavender">You're all set</p><h1 className="mt-2 font-display text-3xl font-extrabold text-ink">Your movie night awaits!</h1></div>
        <TicketCard booking={booking} />
        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden"><Link to="/bookings" className="btn-primary"><Clapperboard size={16} /> My bookings</Link><Link to="/" className="btn-soft">Find another movie</Link></div>
      </>}
    </main>
  );
}
