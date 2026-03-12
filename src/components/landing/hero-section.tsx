import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps {
  children?: React.ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Orb background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-fire opacity-[0.12] blur-[120px]"
          style={{ animation: 'orbFloat 20s ease-in-out infinite' }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gold opacity-[0.12] blur-[120px]"
          style={{ animation: 'orbFloat 20s ease-in-out infinite', animationDelay: '-7s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/2 w-[350px] h-[350px] rounded-full bg-cyan opacity-[0.12] blur-[120px]"
          style={{ animation: 'orbFloat 20s ease-in-out infinite', animationDelay: '-14s' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-6">
        {/* Chip badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 text-sm text-text2"
          style={{ animation: 'fadeUp 0.6s ease-out both' }}
        >
          <span
            className="w-2 h-2 rounded-full bg-lime"
            style={{ animation: 'pulse 2s ease-in-out infinite' }}
          />
          Now serving .taco domains
        </div>

        {/* Logo */}
        <div style={{ animation: 'fadeUp 0.6s ease-out 0.1s both' }}>
          <Image
            src="/taco_logo.png"
            alt="Taco Domains"
            width={140}
            height={140}
            className="rounded-[28px] drop-shadow-2xl"
            priority
          />
        </div>

        {/* Headline */}
        <h1
          className="font-[family-name:var(--font-anybody)] font-black text-[clamp(2.4rem,7.5vw,5.5rem)] leading-[1.05] tracking-tight"
          style={{ animation: 'fadeUp 0.6s ease-out 0.2s both' }}
        >
          Get Your{' '}
          <span className="bg-gradient-to-r from-fire via-fire-light to-gold bg-clip-text text-transparent">
            Domain.
          </span>
          <br />
          No Salsa Required.
        </h1>

        {/* Subtitle */}
        <p
          className="text-lg md:text-xl text-text2 max-w-xl"
          style={{ animation: 'fadeUp 0.6s ease-out 0.3s both' }}
        >
          The spiciest domain registrar on the internet. Hot domains. Fresh ideas. Zero crumbs.
        </p>

        {/* CTA buttons */}
        <div
          className="flex flex-col sm:flex-row gap-3 mt-2"
          style={{ animation: 'fadeUp 0.6s ease-out 0.4s both' }}
        >
          <Link
            href="#search"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-fire via-[#ff9800] to-gold text-black font-bold text-sm font-[family-name:var(--font-anybody)] hover:shadow-[0_6px_28px_rgba(255,87,34,0.3)] hover:-translate-y-0.5 transition-all"
          >
            Search Your Domain
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border-2 border-border text-text font-bold text-sm font-[family-name:var(--font-anybody)] hover:border-fire hover:text-fire transition-all"
          >
            How It Works
          </Link>
        </div>

        {/* Search bar slot */}
        {children && (
          <div
            className="w-full max-w-2xl mt-4"
            style={{ animation: 'fadeUp 0.6s ease-out 0.5s both' }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
