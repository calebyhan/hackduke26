import React from "react";
import LandingNavbar from "../components/layout/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import ConceptSection from "../components/landing/ConceptSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import Footer from "../components/layout/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <HeroSection />
      <ConceptSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
