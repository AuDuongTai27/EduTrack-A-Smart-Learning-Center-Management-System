import { enrollmentSteps } from './landingStaticData';
import { Icon, SectionHeading } from './LandingUI';
export function EnrollmentSection() {
  return <section className="et-section et-container" id="enrollment"><SectionHeading title="Get Started in 3 Simple Steps"/><div className="et-steps">{enrollmentSteps.map(([icon, title, text], i) => <article key={title}><span className="et-step-number">0{i + 1}</span><span className="et-icon-circle"><Icon name={icon}/></span><h3>{title}</h3><p>{text}</p>{i < 2 && <Icon name="arrow" className="et-step-arrow"/>}</article>)}</div></section>;
}
