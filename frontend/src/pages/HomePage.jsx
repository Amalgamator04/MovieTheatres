import { useEffect, useMemo, useState } from "react";
import { ArrowDown, Search, Sparkles } from "lucide-react";
import api, { getErrorMessage, listFrom } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import MovieGrid from "../components/MovieGrid";

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMovies(search = "") {
    setLoading(true);
    setError("");
    try {
      const response = search
        ? await api.get("/movies/search/", { params: { search } })
        : await api.get("/movies/");
      setMovies(listFrom(response));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMovies(); }, []);

  const genres = useMemo(() => ["All", ...new Set(movies.flatMap((movie) => movie.genre.split(",").map((item) => item.trim())))], [movies]);
  const visibleMovies = genre === "All" ? movies : movies.filter((movie) => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  const featured = movies[0];

  function search(event) {
    event.preventDefault();
    loadMovies(query.trim());
  }

  return (
    <>
      <section className="hero-wrap relative overflow-hidden">
        <div className="hero-blob blob-one" /><div className="hero-blob blob-two" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 py-14 md:grid-cols-[1.05fr_.95fr] md:py-20 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-widest text-lavender shadow-clay"><Sparkles size={14} /> Your next movie night</span>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-6xl">A little movie<br /><span className="text-lavender">magic,</span> made easy.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink/60 sm:text-lg">Discover stories worth sharing, find your perfect seats, and let the night take it from here.</p>
            <form onSubmit={search} className="mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white p-2 shadow-clay">
              <Search size={19} className="ml-3 shrink-0 text-lavender" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search movies, genres…" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-ink outline-none placeholder:text-ink/40" aria-label="Search movies" />
              <button className="btn-primary !px-5">Search</button>
            </form>
            <a href="#movies" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-ink/55 hover:text-lavender">Explore movies <ArrowDown size={16} /></a>
          </div>
          {featured && (
            <div className="featured-poster relative mx-auto w-full max-w-sm">
              <div className="absolute -left-8 top-8 z-10 rounded-3xl bg-[#fff9df] px-4 py-3 shadow-clay rotate-[-6deg]"><p className="text-xs font-bold text-amber-900">TONIGHT'S PICK</p><p className="font-display text-sm font-extrabold text-ink">A story to love ✨</p></div>
              <img src={featured.poster} alt="" className="h-[390px] w-full rounded-[2.4rem] object-cover shadow-raised sm:h-[440px]" />
              <div className="absolute inset-x-0 bottom-0 rounded-b-[2.4rem] bg-gradient-to-t from-black/75 to-transparent p-7 pt-24 text-white">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-white/75">{featured.genre}</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold">{featured.title}</h2>
                <p className="mt-1 text-sm text-white/75">★ {featured.rating} · {featured.duration} min</p>
              </div>
            </div>
          )}
        </div>
      </section>
      <section id="movies" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-lavender">The good stuff</p><h2 className="mt-2 font-display text-3xl font-extrabold text-ink">Now showing</h2></div>
          <div className="flex flex-wrap gap-2">{genres.map((item) => <button key={item} onClick={() => setGenre(item)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${genre === item ? "bg-lavender text-white shadow-raised" : "bg-white/80 text-ink/60 shadow-clay hover:text-lavender"}`}>{item}</button>)}</div>
        </div>
        {error && <ErrorMessage onRetry={() => loadMovies()}>{error}</ErrorMessage>}
        {loading ? <LoadingSpinner /> : <MovieGrid movies={visibleMovies} />}
      </section>
    </>
  );
}
