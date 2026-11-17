import { SubjectIllustration } from './SubjectIllustration';
import '../../../assets/css/class-hero-academy.css';

/** Decorative only: each portal retains its own content, metrics and actions. */
export function ClassHeroDecoration({ subject }: { subject?: string | null }) {
  return (
    <div className="et-class-hero-decoration" aria-hidden="true">
      <div className="et-class-hero-watermark"><SubjectIllustration name={subject} /></div>
      <div className="et-class-hero-art" />
    </div>
  );
}
