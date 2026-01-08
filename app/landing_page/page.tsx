import Navbar from '../../components/landing/navbar';
import HeroSection from '../../components/landing/hero-section';
import FeaturesSection from '../../components/landing/features-section';
import StepsSection from '../../components/landing/steps-section';
import Footer from '../../components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <Footer />
    </div>
  );
}