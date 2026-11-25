// One code-native outline family: 24-unit geometry, 20px viewport, true 2px strokes.
// Reuses the application's existing inline-SVG approach without a font/dependency.
const paths = {
  student: 'M2 9 12 4 22 9 12 14 2 9Zm4 2v6c4 3 8 3 12 0v-6m4-2v7',
  subject: 'M5 3h14v18H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm0 0v18M9 7h6M9 11h6M9 15h4',
  parent: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-8a4 4 0 0 1 0 8m6 10v-2a4 4 0 0 0-3-3.87',
  link: 'M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  unlink: 'm9 15-3 3m12-12-3 3M8 3H5a2 2 0 0 0-2 2v3m13 13h3a2 2 0 0 0 2-2v-3M3 3l18 18',
  edit: 'm16 3 5 5M3 21l5-1L21 7a2.12 2.12 0 0 0-3-3L5 17l-2 4Z',
  class: 'M12 5v15M12 5C9 3 5 3 2 4v14c3-1 7-1 10 2 3-1 7-3 10-2V4c-3-1-7-1-10 1Z',
  schedule: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 10h2m4 0h2m-8 4h2',
  tuition: 'M4 3h16v18l-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1V3Zm4 4h8M8 11h8m-8 4h4',
  notification: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  feedback: 'M21 15a3 3 0 0 1-3 3H8l-5 4V5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10Z',
  confirm: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-15 0 3 3 7-7',
  warning: 'm10.3 3.9-8.2 14.2A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01',
  lock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm2 0V7a5 5 0 0 1 10 0v4',
  unlock: 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm2 0V7a5 5 0 0 1 9.9-1',
  user: 'M20 21v-2a7 7 0 0 0-14 0v2M13 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  file: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h6',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3',
  shield: 'M12 22s8-4 8-11V4l-8-3-8 3v7c0 7 8 11 8 11Zm-4-11 3 3 5-6',
  award: 'M16 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2l2 1 2-.2 1 2 2 1-.2 2 1 2-1 2 .2 2-2 1-1 2-2-.2-2 1-2-1-2 .2-1-2-2-1 .2-2-1-2 1-2L5 6l2-1 1-2 2 .2 2-1ZM8 17l-1 5 5-3 5 3-1-5',
  sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm8-1v4m-2-2h4M4 18v4m-2-2h4',
  grade: 'm12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5',
} as const;

export type ModalIconName = keyof typeof paths;

export default function ModalIcon({ name }: { name: ModalIconName }) {
  return <span className="edu-modal-icon" data-modal-icon={name} aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      <path d={paths[name]} vectorEffect="non-scaling-stroke" />
    </svg>
  </span>;
}
