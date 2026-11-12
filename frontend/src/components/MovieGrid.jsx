import MovieCard from "./MovieCard";

export default function MovieGrid({ movies }) {
  if (!movies.length) return <div className="rounded-3xl bg-white/60 py-16 text-center text-ink/60 shadow-clay">No movies found. Try another title or genre.</div>;
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</div>;
}
