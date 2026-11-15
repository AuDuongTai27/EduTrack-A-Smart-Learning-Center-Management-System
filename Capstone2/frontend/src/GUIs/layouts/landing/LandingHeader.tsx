import { useEffect, useRef, useState } from 'react';
import { Brand, Icon } from '../../components/landing/LandingUI';
import { NAV_ITEMS } from '../../components/landing/landingContent';
export function LandingHeader({ onOpenWorkspace }: { onOpenWorkspace: () => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-15% 0px -60% 0px' });
    NAV_ITEMS.forEach(([id]) => { const section = document.getElementById(id); if (section) observer.observe(section); });
    return () => observer.disconnect();
  }, []);
  return <header className="et-header"><a href="#main-content" className="et-skip">Skip to content</a><div className="et-container et-header-inner"><Brand/><button ref={toggle} className="et-menu-toggle" aria-expanded={open} aria-controls="landing-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'}/></button><div id="landing-navigation" className={`et-navigation ${open ? 'is-open' : ''}`} onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } }}><nav aria-label="Main navigation">{NAV_ITEMS.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} className={active === id ? 'is-active' : ''} onClick={() => { setOpen(false); setActive(id); }}>{label}</a>)}</nav><div className="et-header-actions"><button className="et-button et-outline" onClick={() => { setOpen(false); onOpenWorkspace(); }}><Icon name="user"/>Student Login</button><a className="et-button et-primary" href="#contact" onClick={() => setOpen(false)}><Icon name="calendar"/>Book a Consultation</a></div></div></div></header>;
}
