"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Special character (!@#$%^&*)",
    test: (p: string) => /[!@#$%^&*]/.test(p),
  },
];

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="rounded-[var(--radius-default)] border border-border bg-surface p-8 text-center">
        <span className="mb-4 block text-4xl">❌</span>
        <h1 className="mb-2 font-[family-name:var(--font-anybody)] text-xl font-bold">
          Invalid reset link
        </h1>
        <p className="mb-4 text-sm text-text2">
          This reset link is invalid or has been used.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-fire transition-colors hover:text-fire-light"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-[var(--radius-default)] border border-border bg-surface p-8 text-center">
        <span className="mb-4 block text-4xl">✅</span>
        <h1 className="mb-2 font-[family-name:var(--font-anybody)] text-xl font-bold">
          Password reset!
        </h1>
        <p className="mb-4 text-sm text-text2">
          Your password has been updated. You can now log in with your new
          password.
        </p>
        <Link
          href="/login"
          className="text-sm text-fire transition-colors hover:text-fire-light"
        >
          Go to login
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-default)] border border-border bg-surface p-8">
      <h1 className="mb-2 font-[family-name:var(--font-anybody)] text-2xl font-bold">
        Set new password
      </h1>
      <p className="mb-6 text-sm text-text2">
        Choose a strong password for your account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-[var(--radius-xs)] border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-text2"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
          />
          <div className="mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => (
              <div key={rule.label} className="flex items-center gap-2 text-xs">
                <span
                  className={
                    rule.test(password) ? "text-green" : "text-text4"
                  }
                >
                  {rule.test(password) ? "✓" : "○"}
                </span>
                <span
                  className={
                    rule.test(password) ? "text-text2" : "text-text4"
                  }
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium text-text2"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-sm)] bg-fire px-4 py-2.5 font-semibold text-black transition-colors hover:bg-fire-light disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
