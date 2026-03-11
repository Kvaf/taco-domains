"use client";

import { Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  userName: string;
  userImage?: string | null;
  onMenuToggle: () => void;
}

export function DashboardHeader({
  userName,
  userImage,
  onMenuToggle,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md lg:px-6">
      {/* Hamburger (mobile/tablet) */}
      <button
        onClick={onMenuToggle}
        className="rounded-[var(--radius-xs)] p-2 text-text2 transition-colors hover:bg-surface hover:text-text lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User avatar (mobile only, desktop has it in sidebar) */}
      <div className="lg:hidden">
        <Avatar name={userName} image={userImage} size="sm" />
      </div>
    </header>
  );
}
