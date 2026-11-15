import { useEffect, useState } from 'react';
import { Icon } from './LandingUI';
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [bottom, setBottom] = useState(24);
  useEffect(() => {
    const update = () => {
      const mobile = window.innerWidth <= 600;
      const size = mobile ? 42 : 48;
      const right = window.innerWidth - (mobile ? 12 : 24);
      const targets = [...document.querySelectorAll<HTMLElement>('a.et-button, button:not(.et-back-to-top), select, input, summary')]
        .filter(el => el.getClientRects().length).map(el => el.getBoundingClientRect());
      // Move up within the corner rail when a CTA occupies the default position.
      const free = [mobile ? 12 : 24, 72, 132, 192].find(offset => {
        const top = window.innerHeight - offset - size;
        return targets.every(r => r.right < right - size - 8 || r.left > right + 8 || r.bottom < top - 8 || r.top > top + size + 8);
      });
      setVisible(window.scrollY > 600 && free !== undefined);
      setBottom(free ?? 24);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  if (!visible) return null;
  return <button className="et-back-to-top" style={{ bottom: `max(${bottom}px, env(safe-area-inset-bottom))` }} aria-label="Back to top" onClick={() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.querySelector<HTMLAnchorElement>('.et-header .et-brand')?.focus({ preventScroll: true });
  }}><Icon name="up"/></button>;
}
