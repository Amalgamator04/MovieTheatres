import { Clapperboard, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-lavender/10 bg-white/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-ink/55 sm:flex-row lg:px-8">
        <span className="flex items-center gap-2 font-display font-bold text-ink"><Clapperboard size={17} className="text-lavender" /> MovieMate</span>
        <p>Made for movie nights <Heart size={14} className="inline fill-pink-400 text-pink-400" /></p>
      </div>
    </footer>
  );
}
