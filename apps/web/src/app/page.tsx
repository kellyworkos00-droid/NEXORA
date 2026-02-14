import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { ComparisonSection } from '@/components/landing/comparison-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CTASection } from '@/components/landing/cta-section'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <ComparisonSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
