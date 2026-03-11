"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe, Shield, AlertTriangle } from "lucide-react";

const stats = [
  {
    label: "Total Domains",
    value: "0",
    icon: Globe,
    color: "text-cyan",
  },
  {
    label: "Active",
    value: "0",
    icon: Shield,
    color: "text-green",
  },
  {
    label: "Expiring Soon",
    value: "0",
    icon: AlertTriangle,
    color: "text-gold",
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4">
                <div
                  className={`rounded-[var(--radius-sm)] bg-surface2 p-3 ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-text3">{stat.label}</p>
                  <p className="font-[family-name:var(--font-anybody)] text-2xl font-extrabold">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
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
    </div>
  );
}
