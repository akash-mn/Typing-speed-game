"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { GraphQLRequestError } from "@/lib/graphql-client";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register, guest } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, username, password);
      }
      router.push("/game");
    } catch (err) {
      if (err instanceof GraphQLRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Is the backend running?");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuest() {
    setError(null);
    setSubmitting(true);
    try {
      await guest();
      router.push("/game");
    } catch (err) {
      if (err instanceof GraphQLRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Is the backend running?");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md border border-black/15 bg-white p-6 shadow-[12px_12px_0_rgba(17,17,17,0.08)] sm:p-7">
      <div className="mb-7 flex border-b border-black/15">
        <Link
          href="/login"
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
            mode === "login" ? "border-b-2 border-brass text-ink" : "text-muted hover:text-ink"
          }`}
        >
          Log in
        </Link>
        <Link
          href="/register"
          className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
            mode === "register" ? "border-b-2 border-brass text-ink" : "text-muted hover:text-ink"
          }`}
        >
          Create account
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none focus:border-brass"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>

        {mode === "register" && (
          <div>
            <label htmlFor="username" className="mb-1 block text-xs font-medium text-muted">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              minLength={3}
              maxLength={20}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none focus:border-brass"
              placeholder="fast_fingers"
              autoComplete="username"
            />
          </div>
        )}

        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-b border-line bg-transparent px-0 py-2 text-sm text-ink outline-none focus:border-brass"
            placeholder="At least 8 characters"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-rose/10 px-3 py-2 text-sm text-rose">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-ink py-3 text-sm font-semibold text-paper transition-colors hover:bg-brass hover:text-ink disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>

      {mode === "login" && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            <span>or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <button
            type="button"
            onClick={handleGuest}
            disabled={submitting}
            className="w-full rounded-full border border-black/20 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
          >
            Continue as guest
          </button>
          <p className="mt-2 text-center text-xs text-muted">
            A unique guest username will be created for you.
          </p>
        </>
      )}
    </div>
  );
}
