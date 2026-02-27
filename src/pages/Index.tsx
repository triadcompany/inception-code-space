import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import QuickLinks from "@/components/QuickLinks";
import FeaturedSermon from "@/components/FeaturedSermon";
import Schedule from "@/components/Schedule";
import RecentSermons from "@/components/RecentSermons";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <QuickLinks />
        <FeaturedSermon />
        <Schedule />
        <RecentSermons />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
