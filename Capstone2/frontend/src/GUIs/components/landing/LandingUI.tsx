import type { ReactNode } from 'react';
export function Icon({ name, className = '' }: { name: string; className?: string }) {
  const paths: Record<string, ReactNode> = {
    cap: <><path d="m2 8 10-5 10 5-10 5L2 8Z"/><path d="M6 10v7q6 5 12 0v-7M22 8v8"/></>,
    people: <><circle cx="9" cy="7" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3ZM17 4a3 3 0 0 1 0 6M19 14q4 1 3 7"/></>,
    books: <><path d="m3 5 9-3 9 3-9 3-9-3Zm0 0v6l9 4 9-4M3 12v6l9 4 9-4M21 5v6M21 12v6"/></>,
    book: <path d="M12 5Q7 2 2 4v15q5-2 10 1 5-3 10-1V4q-5-2-10 1v15"/>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    up: <path d="M12 20V4m-6 6 6-6 6 6"/>,
    star: <path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-14 4h3m4 0h3m-10 3h3"/></>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3Z"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 9-9"/></>,
    chart: <path d="M4 21V11h3v10m4 0V7h3v14m4 0V2h3v19"/>,
    math: <path d="m3 17 4 4L20 3H3m10 9h8m-4-4v8"/>,
    atom: <><ellipse cx="12" cy="12" rx="11" ry="4"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1"/></>,
    flask: <path d="M8 2h8m-6 0v7L3 20q0 2 3 2h12q3 0 3-2L14 9V2M7 14h10"/>,
    leaf: <path d="M20 3Q2 1 3 15q2 9 12 4 7-5 5-16ZM4 20 17 7"/>,
    computer: <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8m-4-5v5"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m2 6 10 7L22 6"/></>,
    phone: <path d="m5 2 4 4-2 4q2 5 7 7l4-2 4 4q-1 5-6 3Q2 17 2 6q0-3 3-4Z"/>,
    menu: <path d="M3 5h18M3 12h18M3 19h18"/>,
    close: <path d="m5 5 14 14M19 5 5 19"/>,
  };
  return <svg className={`et-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] ?? paths.book}</svg>;
}
export function Brand() {
  return <a className="et-brand" href="#hero" aria-label="EduTrack home"><Icon name="cap"/><span>Edu<span>Track</span></span></a>;
}
export function SectionHeading({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="et-heading"><h2>{title}</h2>{children && <p>{children}</p>}</div>;
}
export type DataStatus = 'loading' | 'ready' | 'error';
export function DataState({ status, empty, noun, retry }: { status: DataStatus; empty: boolean; noun: string; retry: () => void }) {
  if (status === 'loading') return <div className="et-skeleton-grid" role="status" aria-label={`Loading ${noun}`}><span className="et-sr-only">Loading {noun}…</span>{[1, 2, 3].map(n => <div className="et-skeleton" key={n}><div/><span/><span/></div>)}</div>;
  if (status === 'error') return <div className="et-data-state" role="alert"><Icon name="book"/><h3>Unable to load {noun}.</h3><p>Please check your connection and try again.</p><button className="et-button et-outline" onClick={retry}>Try Again <span aria-hidden="true">↻</span></button></div>;
  if (empty) return <div className="et-data-state"><Icon name="book"/><h3>No {noun} are currently available.</h3><p>Please check back for updates.</p></div>;
  return null;
}
