import { DEMO_STATISTICS } from './landingContent';
import { Icon } from './LandingUI';
export function CountsSection() {
  // User-approved demo figures; disclosure is retained in configuration and the technical report.
  return <section className="et-container et-statistics" aria-label="Illustrative center statistics"><div className="et-stats-bar">{DEMO_STATISTICS.map(s => <div className="et-stat" key={s.label}><Icon name={s.icon}/><div><strong>{s.value}</strong><span>{s.label}</span></div></div>)}</div></section>;
}
