import type { Metadata } from "next";
import { Anybody, Outfit, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-anybody",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Taco Domains",
  description:
    "Search, register, and manage domains with a fun taco-themed experience. Your one-stop domain registrar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anybody.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-bg text-text antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
