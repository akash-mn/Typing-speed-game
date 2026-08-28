"use client";

import { useEffect, useState } from "react";
import { gqlRequest, GraphQLRequestError } from "@/lib/graphql-client";
import { LEADERBOARD_QUERY } from "@/lib/queries";
import type { LeaderboardEntry } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(2) + "s";
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await gqlRequest<{ leaderboard: LeaderboardEntry[] }>(LEADERBOARD_QUERY, {
          limit: 20,
        });
        if (!cancelled) setEntries(data.leaderboard);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof GraphQLRequestError ? err.message : "Couldn't load the leaderboard.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto min-h-[calc(100vh-145px)] max-w-2xl py-10 sm:py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-brass-dim">The fastest hands</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Leaderboard</h1>
        </div>
      </div>
      <p className="mt-3 text-base text-muted">Ranked by fastest completion time across all players.</p>

      {error && <p className="mt-6 rounded-md bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}

      {!error && entries === null && (
        <p className="mt-6 text-sm text-muted">Loading leaderboard…</p>
      )}

      {entries !== null && entries.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          No runs yet. Be the first to set a time on the board.
        </p>
      )}

      {entries !== null && entries.length > 0 && (
        <ol className="mt-8 divide-y divide-black/10 border-y border-black/15 bg-white">
          {entries.map((entry) => {
            const isMe = user?.username === entry.username;
            const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;
            const medalAnimation = entry.rank === 1 ? "animate-medal-gold" : entry.rank === 2 ? "animate-medal-silver" : "animate-medal-bronze";
            return (
              <li
                key={entry.rank}
                className={`flex items-center justify-between px-4 py-3 ${
                  isMe ? "bg-brass/10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex w-12 items-center gap-2 font-display text-sm text-muted">
                    {`#${entry.rank}`}
                    {medal && (
                      <span className={`text-lg leading-none ${medalAnimation}`} role="img" aria-label={`${entry.rank} place medal`}>
                        {medal}
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-medium ${isMe ? "text-brass-dim" : "text-ink"}`}>
                    {entry.username}
                    {isMe && <span className="ml-2 text-xs text-muted">(you)</span>}
                  </span>
                </div>
                <span className="font-display text-sm font-semibold text-brass-dim">
                  {formatSeconds(entry.bestTimeMs)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
