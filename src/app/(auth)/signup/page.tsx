"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError("Email already registered");
        setLoading(false);
        return;
      }

      if (res.status === 400 && data.issues) {
        const errors: Record<string, string> = {};
        for (const issue of data.issues) {
          const field = issue.path?.[0];
          if (field) errors[field] = issue.message;
        }
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign in after successful signup
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Account created but login failed. Please log in manually.");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-default)] border border-border bg-surface p-8">
      <h1 className="mb-2 font-[family-name:var(--font-anybody)] text-2xl font-bold">
        Create your account
      </h1>
      <p className="mb-6 text-sm text-text2">
        Start managing domains the spicy way
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-[var(--radius-xs)] border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-text2">
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Taco Lover"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
          />
          {fieldErrors.displayName && (
            <p className="mt-1 text-xs text-red">{fieldErrors.displayName}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-text2">
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
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-text2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red">{fieldErrors.password}</p>
          )}
          <div className="mt-2 space-y-1">
            {PASSWORD_RULES.map((rule) => (
              <div key={rule.label} className="flex items-center gap-2 text-xs">
                <span className={rule.test(password) ? "text-green" : "text-text4"}>
                  {rule.test(password) ? "✓" : "○"}
                </span>
                <span className={rule.test(password) ? "text-text2" : "text-text4"}>
                  {rule.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-sm)] bg-fire px-4 py-2.5 font-semibold text-black transition-colors hover:bg-fire-light focus:outline-none focus:ring-2 focus:ring-fire/40 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text3">
        Already have an account?{" "}
        <Link href="/login" className="text-fire hover:text-fire-light transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
}
