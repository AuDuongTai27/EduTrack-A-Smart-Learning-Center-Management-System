import { useState } from 'react';
import { HeroSection } from '../../components/landing/HeroSection';
import { CountsSection } from '../../components/landing/CountsSection';
import { AboutSection } from '../../components/landing/AboutSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { CoursesSection } from '../../components/landing/CoursesSection';
import { TrainersSection } from '../../components/landing/TrainersSection';
import { EnrollmentSection } from '../../components/landing/EnrollmentSection';
import { FaqSection } from '../../components/landing/FaqSection';
import { ContactSection } from '../../components/landing/ContactSection';
import { subjects, teachers, contactInfo } from '../../components/landing/landingStaticData';

export function LandingPage() {
  const [selected, select] = useState<number | null>(null);
  return (
    <main id="main-content">
      <HeroSection />
      <CountsSection />
      <AboutSection />
      <FeaturesSection subjects={subjects} select={select} />
      <CoursesSection subjects={subjects} selected={selected} select={select} />
      <TrainersSection trainers={teachers} />
      <EnrollmentSection />
      <FaqSection />
      <ContactSection info={contactInfo} />
    </main>
  );
}

export default LandingPage;
