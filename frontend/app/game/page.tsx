"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { generateSequence } from "@/lib/generate-sequence";
import { getLocalBestMs, recordLocalBestMs } from "@/lib/local-best-score";
import { gqlRequest, GraphQLRequestError } from "@/lib/graphql-client";
import { SUBMIT_GAME_RESULT_MUTATION } from "@/lib/queries";
import type { GameOutcome, SubmitGameResultPayload } from "@/lib/types";
import Keycap, { type KeyFlash } from "@/components/Keycap";
import ProgressDots from "@/components/ProgressDots";

const TOTAL_CHARS = 20;
const PENALTY_MS = 500;
const FLASH_DURATION_MS = 160;

type Status = "idle" | "playing" | "finished";

interface FinalResult {
  timeMs: number;
  errorCount: number;
  outcome: GameOutcome;
  previousBestMs: number | null;
  source: "server" | "local";
}

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(2) + "s";
}

export default function GamePage() {
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<Status>("idle");
  const [sequence, setSequence] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [flash, setFlash] = useState<KeyFlash>("idle");
  const [finalResult, setFinalResult] = useState<FinalResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameAreaRef = useRef<HTMLDivElement | null>(null);

  // --- Timer loop -----------------------------------------------------
  useEffect(() => {
    if (status !== "playing") return;

    function tick() {
      if (startTimeRef.current !== null) {
        setElapsedMs(performance.now() - startTimeRef.current + penaltyMs);
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // penaltyMs is intentionally included so the displayed timer immediately
    // reflects newly-added penalties rather than waiting for the next frame.
  }, [status, penaltyMs]);

  // --- Keep the game area focused while playing -----------------------
  useEffect(() => {
    if (status === "playing") {
      gameAreaRef.current?.focus();
    }
  }, [status]);

  const finishGame = useCallback(
    async (finalTimeMsRaw: number, finalErrorCount: number) => {
      const finalTimeMs = Math.round(finalTimeMsRaw);
      setStatus("finished");

      const previousLocalBest = getLocalBestMs();
      const isLocalBest = recordLocalBestMs(finalTimeMs);

      // Optimistic local-only result (works even when logged out).
      let outcome: GameOutcome = isLocalBest ? "SUCCESS" : "FAILURE";
      let previousBestMs = previousLocalBest;
      let source: "server" | "local" = "local";

      if (user) {
        setSubmitting(true);
        setSubmitError(null);
        try {
          const data = await gqlRequest<{ submitGameResult: SubmitGameResultPayload }>(
            SUBMIT_GAME_RESULT_MUTATION,
            { timeMs: finalTimeMs, errorCount: finalErrorCount }
          );
          outcome = data.submitGameResult.outcome;
          previousBestMs = data.submitGameResult.previousBestMs;
          source = "server";
        } catch (err) {
          setSubmitError(
            err instanceof GraphQLRequestError
              ? err.message
              : "Couldn't save this result to your account, but your local best score was updated."
          );
        } finally {
          setSubmitting(false);
        }
      }

      setFinalResult({ timeMs: finalTimeMs, errorCount: finalErrorCount, outcome, previousBestMs, source });
    },
    [user]
  );

  // --- Key handling -----------------------------------------------------
  useEffect(() => {
    if (status !== "playing") return;

    function handleKeyDown(e: KeyboardEvent) {
      if (!/^[a-zA-Z]$/.test(e.key)) return;
      e.preventDefault();

      const target = sequence[currentIndex];
      const pressed = e.key.toUpperCase();

      if (pressed === target) {
        setFlash("correct");
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setFlash("idle"), FLASH_DURATION_MS);

        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        if (nextIndex >= TOTAL_CHARS) {
          const finalElapsed =
            (startTimeRef.current !== null ? performance.now() - startTimeRef.current : 0) +
            penaltyMs;
          finishGame(finalElapsed, errorCount);
        }
      } else {
        setFlash("wrong");
        if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
        flashTimeoutRef.current = setTimeout(() => setFlash("idle"), FLASH_DURATION_MS);
        setErrorCount((prev) => prev + 1);
        setPenaltyMs((prev) => prev + PENALTY_MS);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, sequence, currentIndex, errorCount, penaltyMs, finishGame]);

  function startGame() {
    setSequence(generateSequence(TOTAL_CHARS));
    setCurrentIndex(0);
    setErrorCount(0);
    setPenaltyMs(0);
    setElapsedMs(0);
    setFlash("idle");
    setFinalResult(null);
    setSubmitError(null);
    startTimeRef.current = performance.now();
    setStatus("playing");
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="mx-auto mt-16 max-w-md border border-black/15 bg-white p-8 text-center shadow-[10px_10px_0_rgba(17,17,17,0.07)]">
        <p className="font-display text-lg font-semibold text-brass-dim">Sign in to play</p>
        <p className="mt-2 text-sm text-muted">
          Log in or create an account to save your runs and appear on the leaderboard.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brass hover:text-ink"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-145px)] flex-col items-center gap-8 py-10">
      <div className="flex w-full max-w-lg items-center justify-between border-y border-black/15 py-4 font-display text-xs uppercase tracking-[0.12em] text-muted">
        <span>
          Progress:{" "}
          <span className="text-paper">
            {Math.min(currentIndex, TOTAL_CHARS)} <span className="text-brass">/ {TOTAL_CHARS}</span>
          </span>
        </span>
        <span>
          Time: <span className="text-paper">{formatSeconds(elapsedMs)}</span>
        </span>
        <span>
          Errors: <span className={errorCount > 0 ? "text-rose" : "text-paper"}>{errorCount}</span>
        </span>
      </div>

      {status === "idle" && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="max-w-sm text-center text-sm leading-relaxed text-muted">
            Press start, then type each highlighted letter as fast as you can.
            Every wrong key adds a 0.5s penalty.
          </p>
          <button
            onClick={startGame}
            className="rounded-full bg-ink px-10 py-3 font-display text-lg font-bold text-paper transition-colors hover:bg-brass hover:text-ink"
          >
            Start
          </button>
          {user.bestTimeMs !== null && (
            <p className="font-display text-xs text-muted">
              Your best: <span className="text-teal">{formatSeconds(user.bestTimeMs)}</span>
            </p>
          )}
        </div>
      )}

      {status === "playing" && (
        <div
          ref={gameAreaRef}
          tabIndex={0}
          onBlur={() => gameAreaRef.current?.focus()}
          className="flex flex-col items-center gap-8 rounded-2xl outline-none"
          aria-label="Typing game area — keep this focused and start typing"
        >
          <Keycap letter={sequence[currentIndex] ?? null} flash={flash} />
          <ProgressDots total={TOTAL_CHARS} currentIndex={currentIndex} />
          <p className="text-xs text-muted">Type the letter shown above</p>
        </div>
      )}

      {status === "finished" && finalResult && (
        <div className="w-full max-w-lg border border-black/15 bg-white p-8 text-center shadow-[12px_12px_0_rgba(17,17,17,0.08)]">
          <p
            className={`font-display text-2xl font-bold ${
              finalResult.outcome === "SUCCESS" ? "text-teal" : "text-rose"
            }`}
          >
            {finalResult.outcome === "SUCCESS" ? "Success!" : "Try Again"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {finalResult.outcome === "SUCCESS"
              ? "New personal best."
              : finalResult.previousBestMs !== null
                ? `Your best is still ${formatSeconds(finalResult.previousBestMs)}.`
                : "Keep going — every run sets your first best."}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-6 text-left">
            <div>
              <dt className="text-xs text-muted">Final time</dt>
              <dd className="font-display text-xl font-bold text-ink">
                {formatSeconds(finalResult.timeMs)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Errors</dt>
              <dd className="font-display text-xl font-bold text-ink">
                {finalResult.errorCount}
              </dd>
            </div>
          </dl>

          {submitting && <p className="mt-4 text-xs text-muted">Saving result…</p>}
          {submitError && <p className="mt-4 text-xs text-rose">{submitError}</p>}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={startGame}
                className="flex-1 rounded-full bg-ink py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brass hover:text-ink"
            >
              Play again
            </button>
            <Link
              href="/leaderboard"
              className="flex-1 rounded-full border border-black/20 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              View leaderboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
