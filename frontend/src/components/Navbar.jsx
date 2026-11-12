import { Clapperboard, LogOut, Ticket, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-[#f7f3ff]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-lavender text-white shadow-raised"><Clapperboard size={21} /></span>
          Movie<span className="text-lavender">Mate</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-3">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? "nav-active" : ""}`}>Home</NavLink>
          <NavLink to="/#movies" className="nav-link hidden sm:block">Movies</NavLink>
          {user ? (
            <>
              <NavLink to="/bookings" className="nav-link"><Ticket size={16} /><span className="hidden sm:inline">My Bookings</span></NavLink>
              <button onClick={handleLogout} className="nav-link" aria-label="Log out"><LogOut size={17} /><span className="hidden sm:inline">Logout</span></button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-2.5"><UserRound size={16} /> Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
