import { useId, useState } from 'react';
import { SectionHeading } from './LandingUI';

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return <div className="et-faq-item">
    <h3><button id={`${id}-question`} className="et-faq-toggle" aria-expanded={open}
      aria-controls={`${id}-answer`} onClick={() => setOpen(!open)}>
      <span>{question}</span><span className="et-faq-symbol" aria-hidden="true"/>
    </button></h3>
    <div id={`${id}-answer`} className={`et-faq-panel${open ? ' is-open' : ''}`}
      role="region" aria-labelledby={`${id}-question`} aria-hidden={!open} inert={!open}>
      <div><p>{answer}</p></div>
    </div>
  </div>;
}
export function FaqSection() {
  return <section className="et-section et-faq" id="faq"><div className="et-container">
    <SectionHeading title="Your Questions, Answered"/>
    <div className="et-faq-list">{[
      ['How do I choose the right class?', 'Start with the subjects and featured classes above. Contact the center to discuss your learning goals and find a suitable option.'],
      ['Where can I find the class schedule?', 'Please contact the center to confirm the latest schedule and available places for the class you are interested in.'],
      ['What does the tuition fee include?', 'Listed fees come from the center’s class records. Contact the center to confirm the billing period, included materials, and any other costs before enrolling.'],
      ['Can I book a consultation online?', 'Use the contact details below to arrange a consultation directly with the center. This page does not submit online bookings.'],
    ].map(([question, answer]) => <FaqItem key={question} question={question} answer={answer}/>)}</div>
  </div></section>;
}
