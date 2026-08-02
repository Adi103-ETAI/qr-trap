import { Hero } from '@/components/landing/Hero';
import { WhatIsCyberClub } from '@/components/landing/WhatIsCyberClub';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <Hero />
      <WhatIsCyberClub />
      <LandingFooter />
    </main>
  );
}
