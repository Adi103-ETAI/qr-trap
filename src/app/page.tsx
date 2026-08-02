import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhatThisIsNot } from '@/components/landing/WhatThisIsNot';
import { AttackVectors } from '@/components/landing/AttackVectors';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <Hero />
      <HowItWorks />
      <WhatThisIsNot />
      <AttackVectors />
      <LandingFooter />
    </main>
  );
}
