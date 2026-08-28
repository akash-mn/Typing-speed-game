"use client";

import { useEffect, useRef } from "react";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4";
const SENSITIVITY = 0.8;

export default function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const previousXRef = useRef<number | null>(null);
  const seekingRef = useRef(false);

  useEffect(() => {
    if (!videoRef.current) return;
    const videoElement: HTMLVideoElement = videoRef.current;

    function seekNext() {
      if (seekingRef.current || !Number.isFinite(videoElement.duration)) return;
      seekingRef.current = true;
      videoElement.currentTime = targetTimeRef.current;
    }

    function handleSeeked() {
      seekingRef.current = false;
      if (Math.abs(videoElement.currentTime - targetTimeRef.current) > 0.01) seekNext();
    }

    function handleMouseMove(event: MouseEvent) {
      if (!Number.isFinite(videoElement.duration)) return;
      const previousX = previousXRef.current ?? event.clientX;
      previousXRef.current = event.clientX;
      const delta = event.clientX - previousX;
      targetTimeRef.current = Math.max(
        0,
        Math.min(videoElement.duration, targetTimeRef.current + (delta / window.innerWidth) * SENSITIVITY * videoElement.duration)
      );
      seekNext();
    }

    videoElement.addEventListener("seeked", handleSeeked);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      videoElement.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full object-cover object-[70%_center] opacity-[0.78] saturate-[0.85] contrast-[1.05]"
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      src={VIDEO_URL}
    />
  );
}