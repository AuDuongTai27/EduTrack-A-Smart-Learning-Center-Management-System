// Browser-only boundary coverage. These synthetic records never enter the landing bundle.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FeaturesSection } from '../src/GUIs/components/landing/FeaturesSection';
import { CoursesSection } from '../src/GUIs/components/landing/CoursesSection';
import { classes, subjects } from '../src/GUIs/components/landing/landingStaticData';

subjects.push(...Array.from({ length: 5 }, (_, index) => ({
  ...subjects[0], subjectId: 100 + index, subjectCode: `QA${index}`, subjectName: `QA Subject ${index}`,
})));
classes.push(...Array.from({ length: 5 }, (_, index) => ({ ...classes[0], classId: 100 + index })));

export function Harness() {
  const [selected, select] = useState<number | null>(null);
  return <div className="et-landing"><FeaturesSection subjects={subjects} select={select}/>
    <CoursesSection subjects={subjects} selected={selected} select={select}/></div>;
}
createRoot(document.getElementById('root')!).render(<Harness/>);
