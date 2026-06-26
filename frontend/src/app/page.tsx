

import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { Stats } from '@/components/home/Stats';
import { LiveBattles } from '@/components/home/LiveBattles';
import { BuiltFor } from '@/components/home/BuiltFor';
import { Features } from '@/components/home/Features';
import { LevelUpFeatures } from '@/components/home/LevelUpFeatures';
import { HowItWorks } from '@/components/home/HowItWorks';
import { LeaderboardPreview } from '@/components/home/LeaderboardPreview';
import { TournamentPreview } from '@/components/home/TournamentPreview';
import { AISection } from '@/components/home/AISection';
import { CTA } from '@/components/home/CTA';
import { Footer } from '@/components/layout/Footer';

export default function Home() {
  return (
    <>
      <style>{`
        .glass-panel {
            background: rgba(49, 53, 60, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <main className="flex-grow w-full flex flex-col">
        <Hero />
        
        <div className="flex flex-col gap-[60px] px-margin-page max-w-7xl mx-auto w-full pb-xl">

        {/* 2. Platform Stats */}
        <Stats />

        </div>

        {/* 4. Built For */}
        <BuiltFor />

        <div className="flex flex-col gap-[60px] px-margin-page max-w-7xl mx-auto w-full pb-xl pt-[60px]">


        {/* 6. Level Up Features Grid */}
        <LevelUpFeatures />

        {/* 7. How It Works Pipeline */}
        <HowItWorks />

        {/* 8. Leaderboard Preview */}
        <LeaderboardPreview />

        {/* 10. AI Section & 11. CTA Banner Wrapper */}
        <div className="flex flex-col gap-6">
          <AISection />
          <CTA />
        </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
