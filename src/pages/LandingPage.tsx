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
  { src: './AZFIT_BACKGROUND_2.png', filter: 'brightness-60 contrast-110' },
  { src: './AZFIT_BACKGROUND_1.png', filter: 'brightness-75 contrast-125' },
  { src: './AZFIT_BACKGROUND_2.png', filter: 'brightness-50 saturate-80' },
  { src: './AZFIT_BACKGROUND_1.png', filter: 'brightness-75 hue-rotate-15' },
  { src: './AZFIT_BACKGROUND_2.png', filter: 'brightness-60 contrast-130' },
]

const LOGO_TRANSPARENT = './AzFIT_LOGO_Transparent.png'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-az-black">
      <BackgroundSlider images={HERO_IMAGES} interval={5000} overlayOpacity={0.6} />
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
