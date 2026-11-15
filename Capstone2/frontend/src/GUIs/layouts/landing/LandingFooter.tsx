import { footerLinks } from '../../components/landing/landingStaticData';
import { Brand } from '../../components/landing/LandingUI';
import { NAV_ITEMS } from '../../components/landing/landingContent';
export function LandingFooter() {
  return <footer className="et-footer"><div className="et-container et-footer-grid"><div><Brand/><p>Room to learn.<br/>Confidence to grow.</p></div><div><h2>Explore EduTrack</h2><nav aria-label="Footer navigation">{NAV_ITEMS.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav></div><div><h2>Your Next Step</h2>{footerLinks.map(([href, label]) => <a key={href} href={href}>{label}</a>)}</div><div className="et-footer-note"><p>Find your subject.<br/>Discover your possibilities.</p><a href="#contact">Let's talk <span aria-hidden="true">↗</span></a></div></div><div className="et-container et-copyright">© {new Date().getFullYear()} EduTrack. All rights reserved.<a href="#hero">Back to top ↑</a></div></footer>;
}
