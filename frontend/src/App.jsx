import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import MovieDetailPage from "./pages/MovieDetailPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import BookingsPage from "./pages/BookingsPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  return (
    <div className="app-shell min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/shows/:id/seats" element={<ProtectedRoute><SeatSelectionPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingConfirmationPage /></ProtectedRoute>} />
        <Route path="*" element={<main className="px-5 py-24 text-center"><h1 className="font-display text-3xl font-extrabold">Page not found</h1><a href="/" className="btn-primary mt-6">Back home</a></main>} />
      </Routes>
      <Footer />
    </div>
  );
}
