"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show success to prevent email enumeration
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[var(--radius-default)] border border-border bg-surface p-8 text-center">
        <span className="mb-4 block text-4xl">📧</span>
        <h1 className="mb-2 font-[family-name:var(--font-anybody)] text-xl font-bold">
          Check your email
        </h1>
        <p className="mb-4 text-sm text-text2">
          If an account exists with that email, we&apos;ve sent a password reset
          link. In development, check your server console.
        </p>
        <Link
          href="/login"
          className="text-sm text-fire transition-colors hover:text-fire-light"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-default)] border border-border bg-surface p-8">
      <h1 className="mb-2 font-[family-name:var(--font-anybody)] text-2xl font-bold">
        Forgot password?
      </h1>
      <p className="mb-6 text-sm text-text2">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-text2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-sm)] bg-fire px-4 py-2.5 font-semibold text-black transition-colors hover:bg-fire-light disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text3">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-fire transition-colors hover:text-fire-light"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
