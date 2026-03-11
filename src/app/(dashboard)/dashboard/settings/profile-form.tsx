"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isDirty = displayName !== initialName;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-[var(--radius-xs)] border border-red/20 bg-red/10 px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-[var(--radius-xs)] border border-green/20 bg-green/10 px-4 py-3 text-sm text-green">
          Profile updated!
        </div>
      )}

      <div>
        <label
          htmlFor="displayName"
          className="mb-1 block text-sm font-medium text-text2"
        >
          Display Name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-[var(--radius-sm)] border border-border bg-bg2 px-3 py-2 text-text placeholder:text-text4 focus:border-fire focus:outline-none focus:ring-1 focus:ring-fire/30"
        />
      </div>

      <Button type="submit" loading={loading} disabled={!isDirty}>
        {isDirty ? "Save Changes" : "No Changes"}
      </Button>
    </form>
  );
}
