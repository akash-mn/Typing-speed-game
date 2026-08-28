"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-1.5 text-sm font-medium transition-colors ${
      pathname === href
        ? "text-brass-dim"
        : "text-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 md:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
            Keystroke<span className="text-brass">(R)</span>
          </span>
          <span className="text-2xl leading-none text-ink">✳︎</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href={user ? "/game" : "/login"} className={linkClass("/game")}>
            Play
          </Link>
          <Link href="/leaderboard" className={linkClass("/leaderboard")}>
            Leaderboard
          </Link>

          {!loading && user && (
            <div className="ml-2 flex items-center gap-2 border-l border-black/15 pl-2 sm:ml-4 sm:pl-4">
              <span className="hidden font-display text-xs text-muted sm:inline">
                {user.username}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-rose"
              >
                Log out
              </button>
            </div>
          )}

          {!loading && !user && (
            <Link
              href="/login"
              className="ml-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-brass hover:text-ink sm:ml-4"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
