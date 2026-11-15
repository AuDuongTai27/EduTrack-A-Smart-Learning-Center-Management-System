import { Icon, SectionHeading } from './LandingUI';
export function AboutSection() {
  return <section id="about" className="et-section et-container"><SectionHeading title="A Better Learning Experience">Support for the way you learn. Encouragement for what comes next.</SectionHeading>
    <div className="et-benefits">{[
      ['target', 'Experienced Educators', 'Get to know the people who will guide your learning.'],
      ['books', 'Structured Learning Paths', 'Find a subject and class that fit your next step.'],
      ['chart', 'Learning Progress Tracking', 'Stay connected to your learning journey.'],
      ['people', 'Supportive Environment', 'A space to ask, explore, and build confidence.'],
    ].map(([icon, title, text]) => <article className="et-benefit" key={title}><span className="et-icon-circle"><Icon name={icon}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>;
}
