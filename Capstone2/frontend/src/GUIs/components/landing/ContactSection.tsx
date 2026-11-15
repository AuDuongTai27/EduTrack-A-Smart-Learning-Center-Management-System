import type { LandingCenterInfoDto } from '../../../BLL/models/LandingOverviewDto';
import { contactLinks } from './landingContent';
import { Icon } from './LandingUI';
export function ContactSection({ info }: { info?: LandingCenterInfoDto }) {
  const contact = contactLinks(info);
  return <section id="contact" className="et-section et-container"><div className="et-contact-banner"><div className="et-contact-art"><Icon name="cap"/></div><div><h2>Let's Find the Right Class for You</h2><p>Share your goals. Ask your questions. Start with a conversation.</p></div><a className="et-button et-white" href="#contact-details"><Icon name="calendar"/>Book a Consultation<Icon name="arrow"/></a></div><div id="contact-details" className="et-contact-details"><h3>Talk to the Center</h3><p>Arrange a consultation using the center's published contact details.</p><div className="et-contact-links">{contact.phone && <a className="et-button et-outline" href={`tel:${contact.tel}`}><Icon name="phone"/>{contact.phone}</a>}{contact.email && <a className="et-button et-outline" href={`mailto:${contact.email}`}><Icon name="mail"/>{contact.email}</a>}{!contact.phone && !contact.email && <p>Contact details have not been published yet. Please check back later.</p>}</div></div></section>;
}
