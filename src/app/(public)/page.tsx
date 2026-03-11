import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-4 text-center">
      <Image
        src="/taco_logo.png"
        alt="Taco Domains"
        width={120}
        height={120}
        className="mb-8 rounded-3xl"
        priority
      />

      <h1 className="mb-4 font-[family-name:var(--font-anybody)] text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
        Get Your{" "}
        <span className="bg-gradient-to-r from-fire via-fire-light to-gold bg-clip-text text-transparent">
          Domain.
        </span>
        <br />
        No Salsa Required.
      </h1>

      <p className="mb-8 max-w-xl text-lg text-text2">
        The spiciest domain registrar on the internet. Hot domains. Fresh ideas.
        Zero crumbs.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href="/signup">
          <Button size="lg">Search Your Domain</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">
            Log In
          </Button>
        </Link>
      </div>
    </section>
  );
}
