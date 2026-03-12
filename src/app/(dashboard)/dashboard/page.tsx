"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe, Shield, AlertTriangle, ExternalLink, Lock, Eye, RefreshCw } from "lucide-react";

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

interface Stats {
  total: number;
  active: number;
  expiringSoon: number;
}

function StatusBadge({ status, expiresAt }: { status: string; expiresAt: string }) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const isExpiringSoon = status === "ACTIVE" && expiry <= thirtyDays;

  if (isExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold/10 text-gold">
        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[status] || styles.ACTIVE}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-green" : status === "EXPIRED" ? "bg-red" : "bg-gold"}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expiringSoon: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/domain/list");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains);
        setStats(data.stats);
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

  async function toggleSetting(domainId: string, setting: string, currentValue: boolean) {
    try {
      const res = await fetch("/api/domain/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId, setting, value: !currentValue }),
      });
      if (res.ok) {
        fetchDomains();
      }
    } catch (err) {
      console.error("Failed to toggle setting:", err);
    }
  }

  const statCards = [
    { label: "Total Domains", value: stats.total.toString(), icon: Globe, color: "text-cyan" },
    { label: "Active", value: stats.active.toString(), icon: Shield, color: "text-green" },
    { label: "Expiring Soon", value: stats.expiringSoon.toString(), icon: AlertTriangle, color: stats.expiringSoon > 0 ? "text-gold" : "text-text3" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-anybody)] text-2xl font-bold">
          Welcome back, {firstName}!
        </h1>
        <p className="text-sm text-text2">
          Here&apos;s your domain portfolio overview
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div className={`rounded-[var(--radius-sm)] bg-surface2 p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text3">{stat.label}</p>
                  <p className="font-[family-name:var(--font-anybody)] text-2xl font-extrabold">
                    {loading ? "—" : stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Expiring soon warning */}
      {stats.expiringSoon > 0 && (
        <div className="flex items-center gap-3 rounded-[--radius-sm] border border-gold/30 bg-gold/5 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-gold shrink-0" />
          <p className="text-sm text-gold">
            <strong>{stats.expiringSoon} domain{stats.expiringSoon > 1 ? "s" : ""}</strong> expiring within 30 days. Consider renewing.
          </p>
        </div>
      )}

      {/* Domains table */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
          </CardContent>
        </Card>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <span className="mb-4 text-5xl">🌮</span>
            <h2 className="mb-2 font-[family-name:var(--font-anybody)] text-xl font-bold">
              No domains yet
            </h2>
            <p className="mb-6 max-w-md text-sm text-text2">
              Start by searching for your perfect domain name. We&apos;ll check
              availability across all major TLDs in real-time.
            </p>
            <Link href="/">
              <Button>Search Domains</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text3 uppercase tracking-wider">
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3 text-center">Auto-Renew</th>
                  <th className="px-4 py-3 text-center">Lock</th>
                  <th className="px-4 py-3 text-center">WHOIS Privacy</th>
                  <th className="px-4 py-3">Redirect</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((domain) => (
                  <tr key={domain.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/domains/${domain.id}`} className="font-mono font-bold text-sm hover:text-fire transition-colors">
                        {domain.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={domain.status} expiresAt={domain.expiresAt} />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text2">
                      {new Date(domain.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleSetting(domain.id, "autoRenew", domain.autoRenew)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${domain.autoRenew ? "text-green bg-green/10" : "text-text3 bg-surface"}`}
                      >
                        <RefreshCw className="h-3 w-3" />
                        {domain.autoRenew ? "On" : "Off"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleSetting(domain.id, "locked", domain.locked)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${domain.locked ? "text-fire bg-fire/10" : "text-text3 bg-surface"}`}
                      >
                        <Lock className="h-3 w-3" />
                        {domain.locked ? "Locked" : "Unlocked"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleSetting(domain.id, "whoisPrivacy", domain.whoisPrivacy)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${domain.whoisPrivacy ? "text-cyan bg-cyan/10" : "text-text3 bg-surface"}`}
                      >
                        <Eye className="h-3 w-3" />
                        {domain.whoisPrivacy ? "On" : "Off"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {domain.redirectUrl ? (
                        <span className="inline-flex items-center gap-1 text-xs text-fire">
                          <ExternalLink className="h-3 w-3" />
                          {domain.redirectType}
                        </span>
                      ) : (
                        <span className="text-xs text-text4">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
