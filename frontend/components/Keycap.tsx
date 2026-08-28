"use client";

export type KeyFlash = "idle" | "correct" | "wrong";

interface KeycapProps {
  letter: string | null;
  flash: KeyFlash;
}

export default function Keycap({ letter, flash }: KeycapProps) {
  return (
    <div className={[
        "relative flex h-64 w-full max-w-md select-none items-center justify-center transition-transform sm:h-72",
        flash === "wrong"
          ? "animate-shake"
          : flash === "correct"
            ? "animate-press"
            : "",
      ].join(" ")}
      aria-live="polite"
    >
      <span className="flex h-32 w-32 items-center justify-center rounded-[18%] border-2 border-black/15 bg-white font-display text-6xl font-bold text-ink shadow-[8px_8px_0_rgba(17,17,17,0.18)]">
        {letter ?? "—"}
      </span>
    </div>
  );
}
