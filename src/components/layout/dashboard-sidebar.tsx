"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Server,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";

interface DashboardSidebarProps {
  userName: string;
  userImage?: string | null;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", active: true },
  { icon: Globe, label: "My Domains", href: "/dashboard/domains", active: true },
  { icon: Server, label: "DNS Records", href: "/dashboard/dns", active: true },
  { icon: ShoppingBag, label: "Marketplace", href: "/dashboard/marketplace", active: false },
  { icon: Settings, label: "Settings", href: "/dashboard/settings", active: true },
];

export function DashboardSidebar({
  userName,
  userImage,
  isOpen,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
          // Mobile: slide in/out
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: always visible
          "lg:translate-x-0",
          // Collapsed on desktop
          collapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Image
              src="/taco_logo.png"
              alt="Taco Domains"
              width={32}
              height={32}
              className="rounded-lg"
            />
            {!collapsed && (
              <span className="font-[family-name:var(--font-anybody)] text-base font-bold">
                Taco Domains
              </span>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            if (!item.active) {
              return (
                <div
                  key={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[var(--radius-xs)] px-3 py-2 text-sm text-text4 cursor-default",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span>{item.label}</span>
                      <span className="ml-auto rounded-full bg-surface2 px-2 py-0.5 text-[10px] text-text4">
                        Soon
                      </span>
                    </>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  // Close mobile sidebar on navigation
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-xs)] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-l-2 border-fire bg-surface2 text-fire"
                    : "text-text2 hover:bg-surface2/50 hover:text-text",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border px-3 py-3">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar name={userName} image={userImage} size="sm" />
              <LogoutButton variant="icon" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name={userName} image={userImage} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">
                  {userName}
                </p>
              </div>
              <LogoutButton variant="icon" />
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden border-t border-border px-3 py-2 text-text3 transition-colors hover:bg-surface2 hover:text-text lg:block"
        >
          {collapsed ? (
            <ChevronRight className="mx-auto h-4 w-4" />
          ) : (
            <ChevronLeft className="mx-auto h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}
