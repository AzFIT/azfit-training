import BackgroundSlider, { type SlideImage } from '../components/landing/BackgroundSlider'
import LandingNavbar from '../components/landing/LandingNavbar'
import HeroSection from '../components/landing/HeroSection'
import StatsBar from '../components/landing/StatsBar'
import FeatureSection from '../components/landing/FeatureSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import RoleCardsSection from '../components/landing/RoleCardsSection'
import TestimonialsSection from '../components/landing/TestimonialsSection'
import CTASection from '../components/landing/CTASection'
import LandingFooter from '../components/landing/LandingFooter'

const HERO_IMAGES: SlideImage[] = [
  { src: './hero-bg.jpg', alt: 'Modern gym with neon lighting' },
  { src: './background_ai_landingpage.png', alt: 'AI-powered fitness lab' },
  { src: './AZFIT_BACKGROUND_2.png', alt: 'Futuristic training interface' },
]

const LOGO_TRANSPARENT = './AzFIT_LOGO_Transparent.png'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-az-black">
      <BackgroundSlider images={HERO_IMAGES} interval={6000} overlayOpacity={0.55} />
      <LandingNavbar logoSrc={LOGO_TRANSPARENT} />
      <HeroSection
        logoSrc={LOGO_TRANSPARENT}
        headline="Train Smarter. Train AzFIT."
        subheadline="AI-powered personal training for Hong Kong"
      />
      <StatsBar />
      <FeatureSection />
      <HowItWorksSection />
      <RoleCardsSection />
      <TestimonialsSection />
      <CTASection />
      <LandingFooter logoSrc={LOGO_TRANSPARENT} />
    </div>
  )
}
