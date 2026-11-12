import { Clock3, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  return (
    <article className="movie-card group overflow-hidden rounded-[1.8rem] bg-white/75 p-3 shadow-clay">
      <Link to={`/movies/${movie.id}`} className="block">
        <div className="relative overflow-hidden rounded-[1.35rem] bg-lilac">
          <img
            src={movie.poster || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=85"}
            alt={`${movie.title} poster`}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink backdrop-blur">{movie.genre.split(",")[0]}</span>
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#fff9df] px-2.5 py-1 text-xs font-bold text-amber-800"><Star size={12} className="fill-amber-400 text-amber-400" /> {movie.rating}</span>
        </div>
        <div className="px-2 pb-1 pt-4">
          <h3 className="truncate font-display text-lg font-extrabold text-ink">{movie.title}</h3>
          <div className="mt-2 flex items-center justify-between text-sm text-ink/55">
            <span className="flex items-center gap-1.5"><Clock3 size={15} /> {movie.duration} min</span>
            <span>{movie.language}</span>
          </div>
          <span className="btn-primary mt-4 w-full justify-center">Book now <span aria-hidden="true">→</span></span>
        </div>
      </Link>
    </article>
  );
}
