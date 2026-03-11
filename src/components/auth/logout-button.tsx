"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "text" | "icon";
  className?: string;
}

export function LogoutButton({ variant = "text", className = "" }: LogoutButtonProps) {
  const handleLogout = () => {
    signOut({ redirectTo: "/" });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleLogout}
        className={`rounded-[var(--radius-xs)] p-2 text-text2 transition-colors hover:bg-surface hover:text-text ${className}`}
        title="Log out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 text-sm text-text2 transition-colors hover:text-text ${className}`}
    >
      <LogOut className="h-4 w-4" />
      Log out
    </button>
  );
}
