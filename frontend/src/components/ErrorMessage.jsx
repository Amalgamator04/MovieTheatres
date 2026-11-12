import { TriangleAlert } from "lucide-react";

export default function ErrorMessage({ children, onRetry }) {
  return (
    <div className="mx-auto my-8 flex max-w-xl items-center gap-3 rounded-3xl bg-rose-50 p-5 text-rose-800 shadow-clay" role="alert">
      <TriangleAlert size={20} className="shrink-0" />
      <p className="flex-1 text-sm">{children}</p>
      {onRetry && <button className="text-sm font-bold underline" onClick={onRetry}>Try again</button>}
    </div>
  );
}
