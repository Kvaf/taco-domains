'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { DomainCheckResult } from '@/lib/rdap/types';

interface SearchResultsProps {
  results: DomainCheckResult[];
  suggestions: string[];
  isLoading: boolean;
  onSearchSuggestion: (domain: string) => void;
}

function AvailabilityBadge({ available }: { available: boolean | 'unknown' }) {
  if (available === true) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green/10 text-green">
        <span className="w-1.5 h-1.5 rounded-full bg-green" />
        Available
      </span>
    );
  }
  if (available === false) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red/10 text-red">
        <span className="w-1.5 h-1.5 rounded-full bg-red" />
        Taken
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold/10 text-gold">
      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
      Unknown
    </span>
  );
}

function RegisterButton({ domain }: { domain: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function handleRegister() {
    if (!session) {
      router.push('/login');
      return;
    }

    setRegistering(true);
    try {
      const res = await fetch('/api/domain/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, years: 1, whoisPrivacy: true, autoRenew: true }),
      });

      if (res.ok) {
        setRegistered(true);
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        const data = await res.json();
        alert(data.error || 'Registration failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setRegistering(false);
    }
  }

  if (registered) {
    return (
      <span className="px-4 py-1.5 rounded-full bg-green/10 text-green text-xs font-bold">
        ✓ Registered!
      </span>
    );
  }

  return (
    <button
      onClick={handleRegister}
      disabled={registering}
      className="px-4 py-1.5 rounded-full bg-fire text-black text-xs font-bold hover:shadow-[0_4px_16px_rgba(255,87,34,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-60"
    >
      {registering ? 'Registering...' : 'Register'}
    </button>
  );
}

export function SearchResults({ results, suggestions, isLoading, onSearchSuggestion }: SearchResultsProps) {
  if (results.length === 0 && !isLoading) return null;

  return (
    <div className="w-full mt-4">
      {/* Results list */}
      <div className="space-y-1.5">
        {results.map((result, i) => (
          <div
            key={result.domain}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-bg2 border border-border rounded-[--radius-sm] px-[22px] py-[14px]"
            style={{ animation: `fadeUp 0.3s ease-out ${i * 0.05}s both` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono font-bold text-sm truncate">{result.domain}</span>
              <AvailabilityBadge available={result.available} />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-text2 font-mono">
                ${result.price.toFixed(2)}<span className="text-text3">/yr</span>
              </span>

              {result.available === true && (
                <RegisterButton domain={result.domain} />
              )}
              {result.available === false && (
                <button className="px-4 py-1.5 rounded-full bg-surface text-text2 border border-border text-xs font-bold hover:border-fire hover:text-fire transition-all">
                  Make Offer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-6 text-text3 text-sm">
          <span className="w-4 h-4 border-2 border-fire border-t-transparent rounded-full animate-spin" />
          Checking availability...
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && results.some((r) => r.available === false) && !isLoading && (
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-sm text-text3 mb-3 font-[family-name:var(--font-mono)] uppercase tracking-wider text-[11px]">
            {'// Suggestions'}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => onSearchSuggestion(suggestion)}
                className="px-3.5 py-1.5 rounded-full bg-surface border border-border text-sm text-text2 hover:border-fire hover:text-fire transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
