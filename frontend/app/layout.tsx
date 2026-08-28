import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import ScrubVideo from "@/components/ScrubVideo";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-display",
});

export const metadata: Metadata = {
  title: "Keystroke — Typing Speed Game",
  description: "Test your typing speed. Beat your best. Climb the leaderboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <AuthProvider>
          <ScrubVideo />
          <Navbar />
          <main className="relative z-[1] mx-auto min-h-[calc(100vh-73px)] max-w-6xl px-5 pb-16 pt-8 sm:px-8 md:px-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
