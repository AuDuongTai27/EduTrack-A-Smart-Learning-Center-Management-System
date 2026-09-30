import React from 'react';
import { HeroSection } from '../../components/landing/HeroSection';
import { AboutSection } from '../../components/landing/AboutSection';
import { CountsSection } from '../../components/landing/CountsSection';
import { WhyUsSection } from '../../components/landing/WhyUsSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { CoursesSection } from '../../components/landing/CoursesSection';
import { TrainersSection } from '../../components/landing/TrainersSection';

export const LandingPage: React.FC = () => {
  return (
    <main className="main">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. About Section */}
      <AboutSection />

      {/* 3. Counts Section */}
      <CountsSection />

      {/* 4. Why Us Section */}
      <WhyUsSection />

      {/* 5. Features Section */}
      <FeaturesSection />

      {/* 6. Courses Section */}
      <CoursesSection />

      {/* 7. Trainers Section */}
      <TrainersSection />
    </main>
  );
};

export default LandingPage;
