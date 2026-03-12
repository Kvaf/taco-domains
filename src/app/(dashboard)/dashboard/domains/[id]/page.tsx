"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Globe, Lock, Eye, RefreshCw, ExternalLink, Shield, Calendar } from "lucide-react";
import Link from "next/link";

interface DomainDetail {
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
}

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [domain, setDomain] = useState<DomainDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [redirectType, setRedirectType] = useState<"301" | "302">("301");
  const [redirectSaving, setRedirectSaving] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState("");

  const fetchDomain = useCallback(async () => {
    try {
      const res = await fetch("/api/domain/list");
      if (res.ok) {
        const data = await res.json();
        const found = data.domains.find((d: DomainDetail) => d.id === id);
        if (found) {
          setDomain(found);
          setRedirectUrl(found.redirectUrl || "");
          setRedirectType((found.redirectType as "301" | "302") || "301");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchDomain();
  }, [fetchDomain]);

  async function toggleSetting(setting: string, currentValue: boolean) {
    try {
      const res = await fetch("/api/domain/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id, setting, value: !currentValue }),
      });
      if (res.ok) fetchDomain();
    } catch (err) {
      console.error(err);
    }
  }

  async function saveRedirect() {
    setRedirectSaving(true);
    setRedirectMessage("");
    try {
      const res = await fetch("/api/domain/redirect", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id, redirectUrl, redirectType }),
      });
      if (res.ok) {
        setRedirectMessage("Redirect saved!");
        fetchDomain();
      } else {
        const data = await res.json();
        setRedirectMessage(data.error || "Failed to save");
      }
    } catch {
      setRedirectMessage("Network error");
    } finally {
      setRedirectSaving(false);
    }
  }

  async function removeRedirect() {
    setRedirectSaving(true);
    try {
      const res = await fetch("/api/domain/redirect", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId: id, redirectUrl: "", redirectType: "301" }),
      });
      if (res.ok) {
        setRedirectUrl("");
        setRedirectMessage("Redirect removed");
        fetchDomain();
      }
    } catch {
      setRedirectMessage("Failed to remove");
    } finally {
      setRedirectSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-fire" />
      </div>
    );
  }

  if (!domain) return null;

  const expiresAt = new Date(domain.expiresAt);
  const registeredAt = new Date(domain.registeredAt);
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-text3 hover:text-text transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-[family-name:var(--font-anybody)] text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-fire" />
            {domain.name}
          </h1>
          <p className="text-sm text-text2">Manage your domain settings</p>
        </div>
      </div>

      {/* Expiry warning */}
      {isExpiringSoon && (
        <div className="flex items-center gap-3 rounded-[--radius-sm] border border-gold/30 bg-gold/5 px-4 py-3">
          <Calendar className="h-5 w-5 text-gold shrink-0" />
          <p className="text-sm text-gold">
            This domain expires in <strong>{daysUntilExpiry} days</strong> ({expiresAt.toLocaleDateString()}).
            {!domain.autoRenew && " Auto-renew is off — enable it or renew manually."}
          </p>
        </div>
      )}

      {/* Domain info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <h3 className="font-[family-name:var(--font-anybody)] font-bold">Domain Info</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text3">Status</span>
              <span className={domain.status === "ACTIVE" ? "text-green" : "text-red"}>{domain.status}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text3">TLD</span>
              <span>.{domain.tld}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text3">Registered</span>
              <span className="font-mono text-xs">{registeredAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text3">Expires</span>
              <span className={`font-mono text-xs ${isExpiringSoon ? "text-gold font-bold" : ""}`}>
                {expiresAt.toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Settings toggles */}
        <Card>
          <CardHeader>
            <h3 className="font-[family-name:var(--font-anybody)] font-bold">Settings</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              onClick={() => toggleSetting("autoRenew", domain.autoRenew)}
              className="w-full flex items-center justify-between p-3 rounded-[--radius-xs] bg-surface hover:bg-surface2 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 text-text3" />
                Auto-Renew
              </div>
              <span className={`text-xs font-bold ${domain.autoRenew ? "text-green" : "text-text3"}`}>
                {domain.autoRenew ? "ON" : "OFF"}
              </span>
            </button>

            <button
              onClick={() => toggleSetting("locked", domain.locked)}
              className="w-full flex items-center justify-between p-3 rounded-[--radius-xs] bg-surface hover:bg-surface2 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <Lock className="h-4 w-4 text-text3" />
                Transfer Lock
              </div>
              <span className={`text-xs font-bold ${domain.locked ? "text-fire" : "text-text3"}`}>
                {domain.locked ? "LOCKED" : "UNLOCKED"}
              </span>
            </button>

            <button
              onClick={() => toggleSetting("whoisPrivacy", domain.whoisPrivacy)}
              className="w-full flex items-center justify-between p-3 rounded-[--radius-xs] bg-surface hover:bg-surface2 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4 text-text3" />
                WHOIS Privacy
              </div>
              <span className={`text-xs font-bold ${domain.whoisPrivacy ? "text-cyan" : "text-text3"}`}>
                {domain.whoisPrivacy ? "ON" : "OFF"}
              </span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* URL Redirect */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-fire" />
            <h3 className="font-[family-name:var(--font-anybody)] font-bold">URL Redirect</h3>
          </div>
          <p className="text-xs text-text3 mt-1">
            Redirect HTTP/HTTPS traffic from this domain to another URL
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                label="Redirect URL"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="sm:w-32">
              <label className="block text-xs text-text3 mb-1.5">Type</label>
              <select
                value={redirectType}
                onChange={(e) => setRedirectType(e.target.value as "301" | "302")}
                className="w-full px-3 py-2.5 rounded-[--radius-xs] bg-bg border border-border text-sm text-text outline-none focus:border-fire"
              >
                <option value="301">301 (Permanent)</option>
                <option value="302">302 (Temporary)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={saveRedirect} loading={redirectSaving} size="sm">
              <Shield className="h-4 w-4 mr-1" />
              Save Redirect
            </Button>
            {domain.redirectUrl && (
              <Button onClick={removeRedirect} variant="ghost" size="sm" loading={redirectSaving}>
                Remove
              </Button>
            )}
            {redirectMessage && (
              <span className="text-xs text-text2">{redirectMessage}</span>
            )}
          </div>

          {domain.redirectUrl && (
            <div className="rounded-[--radius-xs] bg-surface p-3 text-xs font-mono text-text2">
              {domain.name} → {domain.redirectType} → {domain.redirectUrl}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
