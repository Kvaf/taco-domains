"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
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
        Welcome back
      </h1>
      <p className="mb-6 text-sm text-text2">
        Log in to manage your domains
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-[var(--radius-xs)] border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
            {error}
          </div>
        )}

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
            placeholder="Enter your password"
            className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[var(--radius-sm)] bg-fire px-4 py-2.5 font-semibold text-black transition-colors hover:bg-fire-light focus:outline-none focus:ring-2 focus:ring-fire/40 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm">
        <p>
          <Link href="/forgot-password" className="text-text2 hover:text-fire transition-colors">
            Forgot password?
          </Link>
        </p>
        <p className="text-text3">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-fire hover:text-fire-light transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
