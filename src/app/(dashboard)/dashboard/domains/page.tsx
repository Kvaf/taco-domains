"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Globe,
  AlertTriangle,
  Lock,
  Eye,
  RefreshCw,
  ExternalLink,
  Search,
  Plus,
  X,
} from "lucide-react";

interface DomainData {
  id: string;
  name: string;
  tld: string;
  status: string;
  registeredAt: string;
  expiresAt: string;
  autoRenew: boolean;
  locked: boolean;
  whoisPrivacy: boolean;
  redirectUrl: string | null;
  redirectType: string | null;
  _count: { dnsRecords: number };
}

function StatusBadge({ status, expiresAt }: { status: string; expiresAt: string }) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isExpiringSoon = status === "ACTIVE" && expiry <= thirtyDays;

  if (isExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-0.5 text-[11px] font-bold text-gold">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        Expiring
      </span>
    );
  }

  const styles: Record<string, string> = {
    ACTIVE: "bg-green/10 text-green",
    PENDING: "bg-gold/10 text-gold",
    EXPIRED: "bg-red/10 text-red",
    TRANSFERRED: "bg-text3/10 text-text3",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
        styles[status] ?? "bg-surface2 text-text3"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "ACTIVE" ? "bg-green" : status === "EXPIRED" ? "bg-red" : "bg-gold"
        }`}
      />
      {status}
    </span>
  );
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/domain/list");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains);
      }
    } catch (err) {
      console.error("Failed to fetch domains:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  async function addDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setAdding(true);
    setAddError("");

    try {
      const res = await fetch("/api/domain/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDomain.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Failed to add domain");
        return;
      }

      setNewDomain("");
      setShowAddForm(false);
      fetchDomains();
    } catch {
      setAddError("Failed to add domain");
    } finally {
      setAdding(false);
    }
  }

  const filtered = domains.filter((d) =>
    d.name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-text3">Loading domains...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan/10">
            <Globe className="h-5 w-5 text-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text">My Domains</h1>
            <p className="text-sm text-text3">{domains.length} domain{domains.length !== 1 ? "s" : ""} registered</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddError(""); }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface2"
          >
            <Plus className="h-4 w-4" />
            Add Domain
          </button>
          <Link
            href="/"
            className="rounded-lg bg-fire px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-fire-light"
          >
            Register New
          </Link>
        </div>
      </div>

      {/* Add domain form */}
      {showAddForm && (
        <form
          onSubmit={addDomain}
          className="rounded-xl border border-fire/20 bg-surface p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text">Add Existing Domain</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-text4 hover:text-text"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => { setNewDomain(e.target.value); setAddError(""); }}
              placeholder="example.com"
              className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text4 focus:border-fire focus:outline-none"
            />
            <button
              type="submit"
              disabled={adding || !newDomain.trim()}
              className="rounded-lg bg-fire px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-fire-light disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
          </div>
          {addError && (
            <p className="mt-2 text-sm text-red-400">{addError}</p>
          )}
        </form>
      )}

      {/* Search */}
      {domains.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text4" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter domains..."
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm text-text placeholder:text-text4 focus:border-fire focus:outline-none"
          />
        </div>
      )}

      {/* Empty state */}
      {domains.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <Globe className="mx-auto h-12 w-12 text-text4" />
          <h2 className="mt-4 text-lg font-semibold text-text">No domains yet</h2>
          <p className="mt-2 text-sm text-text3">
            Search for your perfect domain and register it with Taco Domains
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-fire px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-fire-light"
          >
            Search Domains
          </Link>
        </div>
      )}

      {/* Expiring soon warning */}
      {domains.some((d) => {
        const exp = new Date(d.expiresAt);
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return d.status === "ACTIVE" && exp <= thirtyDays;
      }) && (
        <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-gold" />
          <p className="text-sm text-gold">
            Some domains are expiring soon. Enable auto-renew or renew manually.
          </p>
        </div>
      )}

      {/* Domain list */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((domain) => (
            <Link
              key={domain.id}
              href={`/dashboard/domains/${domain.id}`}
              className="group block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-fire/30 hover:bg-surface2/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg">
                    <Globe className="h-4 w-4 text-fire" />
                  </div>
                  <div>
                    <p className="font-semibold text-text group-hover:text-fire">
                      {domain.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-text4">
                      <span>
                        Expires{" "}
                        {new Date(domain.expiresAt).toLocaleDateString()}
                      </span>
                      {domain._count.dnsRecords > 0 && (
                        <span>{domain._count.dnsRecords} DNS records</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Feature icons */}
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {domain.autoRenew && (
                      <span title="Auto-renew">
                        <RefreshCw className="h-3.5 w-3.5 text-lime" />
                      </span>
                    )}
                    {domain.locked && (
                      <span title="Locked">
                        <Lock className="h-3.5 w-3.5 text-cyan" />
                      </span>
                    )}
                    {domain.whoisPrivacy && (
                      <span title="WHOIS Privacy">
                        <Eye className="h-3.5 w-3.5 text-gold" />
                      </span>
                    )}
                    {domain.redirectUrl && (
                      <span title={`Redirect → ${domain.redirectUrl}`}>
                        <ExternalLink className="h-3.5 w-3.5 text-fire" />
                      </span>
                    )}
                  </div>

                  <StatusBadge
                    status={domain.status}
                    expiresAt={domain.expiresAt}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filter && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-text3">
          No domains matching &ldquo;{filter}&rdquo;
        </p>
      )}
    </div>
  );
}
