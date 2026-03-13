"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Globe,
  Search,
  Server,
  ShoppingBag,
  UserPlus,
  Wrench,
} from "lucide-react";

interface SiteSettings {
  domainSearch: boolean;
  domainRegistration: boolean;
  dnsManagement: boolean;
  marketplace: boolean;
  signup: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  domainCount: number;
  listingCount: number;
}

const featureConfig = [
  { key: "domainSearch" as const, label: "Domain Search", icon: Search, description: "Public domain availability search" },
  { key: "domainRegistration" as const, label: "Domain Registration", icon: Globe, description: "Allow users to register domains" },
  { key: "dnsManagement" as const, label: "DNS Management", icon: Server, description: "DNS record editor in dashboard" },
  { key: "marketplace" as const, label: "Marketplace", icon: ShoppingBag, description: "Buy/sell domain marketplace" },
  { key: "signup" as const, label: "User Signup", icon: UserPlus, description: "New user registration" },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  const fetchData = useCallback(async () => {
    try {
      const [settingsRes, usersRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/admin/users"),
      ]);

      if (settingsRes.ok) {
        const s = await settingsRes.json();
        setSettings(s);
        setMaintenanceMsg(s.maintenanceMessage ?? "");
      }
      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u.users);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.replace("/dashboard");
      return;
    }
    fetchData();
  }, [status, isAdmin, router, fetchData]);

  async function toggleFeature(key: keyof SiteSettings, value: boolean) {
    setUpdating(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } finally {
      setUpdating(null);
    }
  }

  async function toggleMaintenance() {
    if (!settings) return;
    const newMode = !settings.maintenanceMode;
    setUpdating("maintenanceMode");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maintenanceMode: newMode,
          maintenanceMessage: maintenanceMsg || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
      }
    } finally {
      setUpdating(null);
    }
  }

  async function toggleUserRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-text3">Loading admin panel...</div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fire/10">
          <Shield className="h-5 w-5 text-fire" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Panel</h1>
          <p className="text-sm text-text3">Manage features and users</p>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div
        className={`rounded-xl border p-6 ${
          settings?.maintenanceMode
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border bg-surface"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle
              className={`h-5 w-5 ${
                settings?.maintenanceMode ? "text-amber-500" : "text-text4"
              }`}
            />
            <div>
              <h2 className="font-semibold text-text">Maintenance Mode</h2>
              <p className="text-sm text-text3">
                When enabled, all features return 503 for non-admin users
              </p>
            </div>
          </div>
          <button
            onClick={toggleMaintenance}
            disabled={updating === "maintenanceMode"}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {settings?.maintenanceMode ? (
              <>
                <ToggleRight className="h-6 w-6 text-amber-500" />
                <span className="text-amber-500">ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-6 w-6 text-text4" />
                <span className="text-text4">OFF</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-3">
          <input
            type="text"
            value={maintenanceMsg}
            onChange={(e) => setMaintenanceMsg(e.target.value)}
            placeholder="Maintenance message (optional)"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text4 focus:border-fire focus:outline-none"
          />
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-2">
          <Wrench className="h-5 w-5 text-text3" />
          <h2 className="font-semibold text-text">Feature Toggles</h2>
        </div>
        <div className="space-y-3">
          {featureConfig.map((feat) => {
            const Icon = feat.icon;
            const enabled = settings?.[feat.key] ?? true;
            return (
              <div
                key={feat.key}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-bg/50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${enabled ? "text-lime" : "text-text4"}`} />
                  <div>
                    <p className="text-sm font-medium text-text">{feat.label}</p>
                    <p className="text-xs text-text4">{feat.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFeature(feat.key, !enabled)}
                  disabled={updating === feat.key}
                  className="disabled:opacity-50"
                >
                  {enabled ? (
                    <ToggleRight className="h-6 w-6 text-lime" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-text4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Management */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-text3" />
            <h2 className="font-semibold text-text">Users ({users.length})</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text3">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Domains</th>
                <th className="pb-2 font-medium">Listings</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-text">
                        {user.name ?? "No name"}
                      </p>
                      <p className="text-xs text-text4">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-fire/10 text-fire"
                          : "bg-surface2 text-text3"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-text2">{user.domainCount}</td>
                  <td className="py-3 text-text2">{user.listingCount}</td>
                  <td className="py-3 text-text3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    {user.id !== session?.user?.id && (
                      <button
                        onClick={() => toggleUserRole(user.id, user.role)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                          user.role === "ADMIN"
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-fire/10 text-fire hover:bg-fire/20"
                        }`}
                      >
                        {user.role === "ADMIN" ? "Demote" : "Promote"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
