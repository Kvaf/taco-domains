"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/taco_logo.png"
            alt="Taco Domains"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="font-[family-name:var(--font-anybody)] text-lg font-bold">
            Taco Domains
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/#features"
            className="text-sm text-text2 transition-colors hover:text-text"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-text2 transition-colors hover:text-text"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm text-text2 transition-colors hover:text-text"
          >
            Log In
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-[var(--radius-xs)] p-2 text-text2 transition-colors hover:bg-surface md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-bg2 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/#features"
              onClick={() => setMenuOpen(false)}
              className="rounded-[var(--radius-xs)] px-3 py-2 text-sm text-text2 transition-colors hover:bg-surface hover:text-text"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMenuOpen(false)}
              className="rounded-[var(--radius-xs)] px-3 py-2 text-sm text-text2 transition-colors hover:bg-surface hover:text-text"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-[var(--radius-xs)] px-3 py-2 text-sm text-text2 transition-colors hover:bg-surface hover:text-text"
            >
              Log In
            </Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)}>
              <Button className="w-full" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
