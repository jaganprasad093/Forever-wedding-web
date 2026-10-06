import LandingNav from '@/components/landing/LandingNav'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import TemplatesPreviewSection from '@/components/landing/TemplatesPreviewSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import FaqSection from '@/components/landing/FaqSection'
import LandingFooter from '@/components/landing/LandingFooter'

export default function HomePage() {
  return (
    <main className="overflow-x-hidden min-h-screen bg-stone-50 selection:bg-amber-100 selection:text-amber-900">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <TemplatesPreviewSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
      <LandingFooter />
    </main>
  )
}
