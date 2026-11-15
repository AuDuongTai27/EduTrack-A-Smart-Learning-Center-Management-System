import { benefits } from './landingStaticData';
import { Icon, SectionHeading } from './LandingUI';
export function AboutSection() {
  return <section id="about" className="et-section et-container"><SectionHeading title="A Better Learning Experience">Support for the way you learn. Encouragement for what comes next.</SectionHeading>
    <div className="et-benefits">{benefits.map(([icon, title, text]) => <article className="et-benefit" key={title}><span className="et-icon-circle"><Icon name={icon}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}
