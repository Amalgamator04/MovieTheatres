import { useState } from "react";
import { Clapperboard, Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import ErrorMessage from "../components/ErrorMessage";

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) return <Navigate to="/bookings" replace />;
  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) await register(username.trim(), email.trim(), password);
      else await login(username.trim(), password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-5 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2.5rem] bg-white/75 shadow-clay md:grid-cols-2">
        <div className="relative hidden min-h-[510px] overflow-hidden bg-gradient-to-br from-lavender to-[#ba9fe9] p-10 text-white md:flex md:flex-col md:justify-between">
          <Clapperboard size={30} /><div className="absolute -right-20 top-20 h-72 w-72 rounded-full border-[35px] border-white/10" />
          <div className="relative"><p className="text-xs font-bold uppercase tracking-[.25em] text-white/70">A seat with your name on it</p><h1 className="mt-4 font-display text-4xl font-extrabold leading-tight">Your next<br />movie night<br />starts here.</h1><p className="mt-4 text-sm leading-6 text-white/75">Find your people. Pick your seats. Make a memory.</p></div>
          <span className="text-sm font-bold">MovieMate ✦</span>
        </div>
        <div className="p-7 sm:p-11">
          <p className="text-xs font-bold uppercase tracking-widest text-lavender">{isRegister ? "Join the fun" : "Welcome back"}</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink">{isRegister ? "Create your account" : "Let's get you in"}</h2>
          <p className="mt-2 text-sm text-ink/55">{isRegister ? "Your next favorite movie is a few clicks away." : "Your tickets are just around the corner."}</p>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="form-label">Username<input value={username} onChange={(event) => setUsername(event.target.value)} className="form-input" required autoComplete="username" /></label>
            {isRegister && <label className="form-label">Email <span className="font-normal text-ink/40">(optional)</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="form-input" autoComplete="email" /></label>}
            <label className="form-label">Password
              <span className="relative block"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="form-input !pr-12" required minLength={isRegister ? 8 : 1} autoComplete={isRegister ? "new-password" : "current-password"} /><button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>
            </label>
            <button disabled={loading} className="btn-primary w-full justify-center !py-3 disabled:opacity-60">{loading ? "One moment…" : isRegister ? "Create account" : "Login"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-ink/55">{isRegister ? "Already have an account?" : "New to MovieMate?"} <button className="font-bold text-lavender underline" onClick={() => { setIsRegister(!isRegister); setError(""); }}>{isRegister ? "Log in" : "Create account"}</button></p>
          <Link to="/" className="mt-4 block text-center text-xs text-ink/40 hover:text-lavender">Back to movies</Link>
        </div>
      </div>
    </main>
  );
}
