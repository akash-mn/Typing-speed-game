const BEST_SCORE_KEY = "typing-speed-best-ms";

/** Reads the locally-persisted best completion time (ms), or null if none yet. */
export function getLocalBestMs(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(BEST_SCORE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Compares a new time against the locally stored best and persists it if
 * it's an improvement. Returns whether this run is a new local best.
 */
export function recordLocalBestMs(timeMs: number): boolean {
  const current = getLocalBestMs();
  const isNewBest = current === null || timeMs < current;
  if (isNewBest) {
    window.localStorage.setItem(BEST_SCORE_KEY, String(timeMs));
  }
  return isNewBest;
}
