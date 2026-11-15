import { useState } from 'react';
import type { LandingSubjectItemDto } from '../../../BLL/models/LandingOverviewDto';
import { Icon, SectionHeading } from './LandingUI';
import { subjectInfo } from './landingContent';
export function FeaturesSection({ subjects, select }: { subjects: LandingSubjectItemDto[]; select: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  return <section id="programs" className="et-section et-programs"><div className="et-container">
    <SectionHeading title="Explore Our Programs">Different subjects. One shared goal: helping you move forward.</SectionHeading>

    <><div className="et-program-grid" id="program-grid">{(expanded ? subjects : subjects.slice(0, 8)).map(s => {
      const info = subjectInfo(s.subjectCode, s.subjectName, s.subjectId);
      return <a key={s.subjectId} href="#classes" className={`et-program et-${info.color}`} onClick={() => select(s.subjectId)}><Icon name={info.icon}/><h3>{info.name}</h3><span>Explore classes <Icon name="arrow"/></span></a>;
    })}</div>{subjects.length > 8 && <div className="et-centered"><button className="et-button et-outline" aria-expanded={expanded} aria-controls="program-grid" onClick={() => setExpanded(!expanded)}>{expanded ? 'Show Less' : 'Show More'}</button></div>}</>
  </div></section>;
}
