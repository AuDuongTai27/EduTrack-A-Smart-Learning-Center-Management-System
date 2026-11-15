import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { HeroSection } from '../../components/landing/HeroSection';
import { CountsSection } from '../../components/landing/CountsSection';
import { AboutSection } from '../../components/landing/AboutSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { CoursesSection } from '../../components/landing/CoursesSection';
import { TrainersSection } from '../../components/landing/TrainersSection';
import { EnrollmentSection } from '../../components/landing/EnrollmentSection';
import { FaqSection } from '../../components/landing/FaqSection';
import { ContactSection } from '../../components/landing/ContactSection';
import type { LandingContext } from '../../components/landing/useLandingOverview';
export function LandingPage() {
  const { data, status, retry } = useOutletContext<LandingContext>();
  const [selected, select] = useState<number | null>(null);
  return <main id="main-content"><HeroSection/><CountsSection/><AboutSection/>
    <FeaturesSection subjects={data?.subjects ?? []} status={status} retry={retry} select={select}/>
    <CoursesSection subjects={data?.subjects ?? []} selected={selected} select={select}/>
    <TrainersSection trainers={data?.trainers ?? []} status={status} retry={retry}/>
    <EnrollmentSection/><FaqSection/><ContactSection info={data?.centerInfo} status={status} retry={retry}/>
  </main>;
}
export default LandingPage;
