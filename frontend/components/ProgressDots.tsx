"use client";

interface ProgressDotsProps {
  total: number;
  currentIndex: number; // 0-based index of the character currently being typed
}

export default function ProgressDots({ total, currentIndex }: ProgressDotsProps) {
  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={currentIndex}
      aria-label={`Progress: ${currentIndex} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        return (
          <span
            key={i}
            className={[
              "h-2.5 w-2.5 rounded-full transition-colors sm:h-3 sm:w-3",
              state === "done" && "bg-teal",
              state === "current" && "bg-brass ring-2 ring-brass/40",
              state === "upcoming" && "border border-black/20 bg-transparent",
            ]
              .filter(Boolean)
              .join(" ")}
          />
        );
      })}
    </div>
  );
}
