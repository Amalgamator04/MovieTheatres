import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Globe2, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api, { getErrorMessage, listFrom } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import TheatreCard from "../components/TheatreCard";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [location, setLocation] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [movieResponse, showResponse] = await Promise.all([
        api.get(`/movies/${id}/`),
        api.get("/shows/", { params: { movie: id } }),
      ]);
      setMovie(movieResponse.data);
      setShows(listFrom(showResponse));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingSpinner label="Getting the details…" />;
  if (error) return <ErrorMessage onRetry={load}>{error}</ErrorMessage>;
  if (!movie) return null;
  const locations = ["All", ...new Set(shows.map((show) => show.theatre.location))];
  const visibleShows = location === "All" ? shows : shows.filter((show) => show.theatre.location === location);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <Link to="/" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-lavender"><ArrowLeft size={16} /> All movies</Link>
      <section className="grid gap-8 rounded-[2.5rem] bg-white/65 p-5 shadow-clay sm:p-8 md:grid-cols-[.7fr_1.3fr]">
        <img src={movie.poster} alt={`${movie.title} poster`} className="mx-auto h-[420px] w-full max-w-sm rounded-[2rem] object-cover shadow-raised" />
        <div className="flex flex-col justify-center py-3 md:py-8">
          <span className="w-fit rounded-full bg-lilac px-4 py-2 text-xs font-bold text-lavender">{movie.genre}</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold text-ink sm:text-5xl">{movie.title}</h1>
          <div className="mt-4 flex flex-wrap gap-5 text-sm font-semibold text-ink/55">
            <span className="flex items-center gap-1.5"><Star size={16} className="fill-amber-400 text-amber-400" /> {movie.rating}/10</span>
            <span className="flex items-center gap-1.5"><Clock3 size={16} /> {movie.duration} min</span>
            <span className="flex items-center gap-1.5"><Globe2 size={16} /> {movie.language}</span>
          </div>
          <p className="mt-6 max-w-2xl leading-7 text-ink/65">{movie.description}</p>
          <p className="mt-5 text-xs font-bold uppercase tracking-widest text-ink/45">Pick a showtime</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {shows.slice(0, 4).map((show) => <Link key={show.id} to={`/shows/${show.id}/seats`} className="rounded-full bg-lilac px-4 py-2 text-sm font-bold text-lavender hover:bg-lavender hover:text-white">{show.show_time.slice(0, 5)}</Link>)}
          </div>
        </div>
      </section>
      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-lavender">Find your seat</p><h2 className="mt-1 font-display text-2xl font-extrabold text-ink">Theatres & showtimes</h2></div><div className="flex flex-wrap gap-2">{locations.map((item) => <button key={item} onClick={() => setLocation(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${location === item ? "bg-lavender text-white shadow-raised" : "bg-white/80 text-ink/60 shadow-clay hover:text-lavender"}`}>{item}</button>)}</div></div>
        {visibleShows.length ? <div className="space-y-4">{visibleShows.map((show) => <TheatreCard key={show.id} show={show} />)}</div> : <div className="rounded-3xl bg-white/70 p-8 text-center text-ink/55 shadow-clay">{shows.length ? "No shows in this location." : "No upcoming shows for this movie just yet."}</div>}
      </section>
    </main>
  );
}
