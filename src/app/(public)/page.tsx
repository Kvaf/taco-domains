import { HeroSection } from '@/components/landing/hero-section';
import { TaglineStrip } from '@/components/landing/tagline-strip';
import { ServicesStrip } from '@/components/landing/services-strip';
import { HowItWorks } from '@/components/landing/how-it-works';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { TacoSpecials } from '@/components/landing/taco-specials';
import { PricingSection } from '@/components/landing/pricing-section';
import { Footer } from '@/components/landing/footer';
import { SearchBar } from '@/components/domain/search-bar';

export const metadata = {
  title: 'Taco Domains — Get Your Domain. No Salsa Required.',
  description:
    'The spiciest domain registrar on the internet. Search, register, and manage domains with a fun taco-themed experience.',
};

export default function HomePage() {
  return (
    <>
      <HeroSection>
        <SearchBar />
      </HeroSection>
      <TaglineStrip />
      <ServicesStrip />
      <HowItWorks />
      <FeaturesGrid />
      <TacoSpecials />
      <PricingSection />
      <Footer />
    </>
  );
}
