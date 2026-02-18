import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { WhatIsSection } from '@/components/landing/WhatIsSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { IntegrationsSection } from '@/components/landing/IntegrationsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05010d] via-[#060015] to-[#020008] text-slate-100 relative overflow-hidden">
      {/* Premium background effects - always dark */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#05010d] via-[#060015] to-[#020008] pointer-events-none z-0" />
      
      <LandingNavbar />
      <main className="relative z-10">
        <HeroSection />
        <WhatIsSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <IntegrationsSection />
        <FAQSection />
        <CTASection />
      <LandingFooter />
      </main>
    </div>
  );
};

export default LandingPage;
