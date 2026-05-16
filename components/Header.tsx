"use client";
import Link from "next/link";

interface Props {
  onLeaderboard: () => void;
  showLeaderboard: boolean;
}

export default function Header({ onLeaderboard, showLeaderboard }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-[#080810]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[#c9a227] text-xl">⚡</span>
          <span className="font-display font-black text-white tracking-tight text-lg">
            SHOW<span className="text-[#c9a227]">VOTE</span>
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <button
            onClick={onLeaderboard}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              showLeaderboard
                ? "bg-[#c9a227] text-black"
                : "text-white/60 hover:text-white border border-white/10 hover:border-white/30"
            }`}
          >
            {showLeaderboard ? "🗳️ Vote" : "🏆 Leaderboard"}
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-[#c9a227] rounded-xl transition-all"
          >
            Admin →
          </Link>
        </nav>
      </div>
    </header>
  );
}
