import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import WhiteLabel from '../components/landing/WhiteLabel';
import CTA from '../components/landing/CTA';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-dark text-white selection:bg-primary/30">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <WhiteLabel />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
