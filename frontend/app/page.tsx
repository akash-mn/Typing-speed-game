"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const delay = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        index += 1;
        setDisplayed(text.slice(0, index));
        if (index >= text.length) {
          setDone(true);
          if (interval) clearInterval(interval);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(delay);
      if (interval) clearInterval(interval);
    };
  }, [speed, startDelay, text]);

  return { displayed, done };
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="3.5" y="1.5" width="6.5" height="7" rx="1" stroke="currentColor" />
      <path d="M2.5 4.5H2a1 1 0 0 0-1 1V10a1 1 0 0 0 1 1h4.5a1 1 0 0 0 1-1v-.5" stroke="currentColor" />
    </svg>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const greeting = useTypewriter("Ready, set, type. How fast can your fingers really move?");
  const [actionsVisible, setActionsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setActionsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  async function copyEmail() {
    await navigator.clipboard.writeText("hello@mainframe.co");
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const pillClass = "mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center whitespace-nowrap rounded-full border border-black/10 bg-white px-4 py-[0.3em] text-[13px] text-ink transition-colors duration-200 hover:bg-ink hover:text-paper sm:px-5 sm:text-[15px]";

  return (
    <section className="fixed inset-x-0 bottom-0 top-[73px] z-[1] flex items-end overflow-hidden px-5 pb-12 sm:px-8 md:items-center md:px-10 md:pb-0">
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(247,246,242,0.68)_0%,rgba(247,246,242,0.26)_32%,rgba(247,246,242,0)_62%)]" />
      <div className="relative z-10 max-w-xl">
        <p className="pointer-events-none mb-5 select-none whitespace-pre-line text-[clamp(18px,4vw,26px)] leading-[1.3] text-black blur-[4px] sm:mb-6">
          Ready, set, type.{"\n"}Keystroke&apos;s adaptive typing challenge
        </p>
        <p className="mb-5 min-h-[54px] whitespace-pre-line text-[clamp(18px,4vw,26px)] leading-[1.35] text-black sm:mb-6">
          {greeting.displayed}
          {!greeting.done && <span className="ml-[2px] inline-block h-[1.1em] w-[2px] animate-blink bg-black align-middle" />}
        </p>
        <div className={`flex flex-wrap gap-y-1 transition-all duration-500 ${actionsVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <Link href={user ? "/game" : "/login"} className={pillClass}>Play the game</Link>
          <Link href="/register" className={pillClass}>Come work here</Link>
          <Link href="/leaderboard" className={pillClass}>See the board</Link>
          <button onClick={copyEmail} className="mx-[0.2em] mb-[0.4em] inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-black bg-transparent px-4 py-[0.3em] text-[13px] text-black transition-colors hover:bg-black hover:text-white sm:gap-3 sm:px-5 sm:text-[15px]">
            <span className="underline underline-offset-1">{copied ? "Copied" : "Reach us: hello@mainframe.co"}</span>
            <CopyIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
