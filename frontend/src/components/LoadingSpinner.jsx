export default function LoadingSpinner({ label = "Finding the good stuff…" }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm font-semibold text-ink/60" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-lavender/20 border-t-lavender" />
      {label}
    </div>
  );
}
