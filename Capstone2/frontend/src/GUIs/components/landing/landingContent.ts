// User-approved illustrative statistics. Never overwrite with API counts.
export const DEMO_STATISTICS = [
  { value: '1,230+', label: 'Students', icon: 'people' },
  { value: '64+', label: 'Classes', icon: 'books' },
  { value: '24+', label: 'Teachers & Teaching Assistants', icon: 'cap' },
] as const;
export const NAV_ITEMS = [
  ['hero', 'Home'], ['about', 'About Us'], ['programs', 'Programs'],
  ['classes', 'Classes'], ['teachers', 'Teachers'], ['contact', 'Contact'],
] as const;
const SUBJECTS: Record<string, { name: string; icon: string; color: string }> = {
  MATH: { name: 'Mathematics', icon: 'math', color: 'mint' },
  PHYS: { name: 'Physics', icon: 'atom', color: 'blue' },
  CHEM: { name: 'Chemistry', icon: 'flask', color: 'peach' },
  ENG: { name: 'English', icon: 'book', color: 'lilac' },
  BIO: { name: 'Biology', icon: 'leaf', color: 'mint' },
  IT: { name: 'Computer Science', icon: 'computer', color: 'blue' },
  LIT: { name: 'Literature', icon: 'book', color: 'peach' },
  HIST: { name: 'History', icon: 'book', color: 'lilac' },
  GEO: { name: 'Geography', icon: 'globe', color: 'mint' },
};
export const subjectInfo = (code: string, sourceName?: string, id?: number) => SUBJECTS[code?.trim().toUpperCase()] ?? {
  name: englishText(sourceName) || (code && /^[A-Z0-9_-]{1,20}$/i.test(code) ? `Subject ${code}` : `Subject${id ? ` ${id}` : ''}`),
  icon: 'book', color: 'mint',
};
// Preserve English titles; identify untranslated records without inventing grades.
export function classTitle(course: { className: string; classId: number; subjectCode: string; subjectName?: string; subjectId?: number }) {
  return /^[\x20-\x7E]+$/.test(course.className) && !/\b(lop|toan|hoa|ly|van|tieng)\b/i.test(course.className)
    ? course.className : `${subjectInfo(course.subjectCode, course.subjectName, course.subjectId).name} · Class ${course.classId}`;
}
export function englishText(value: string | undefined) {
  return value && /^[\x20-\x7E]+$/.test(value) ? value : '';
}
export function specialtyLabel(value: string | undefined) {
  if (!value) return '';
  const names: Array<[RegExp, string]> = [
    [/toán/i, 'Mathematics'], [/vật lý/i, 'Physics'], [/hóa học/i, 'Chemistry'],
    [/tiếng anh/i, 'English'], [/sinh học/i, 'Biology'], [/tin học/i, 'Computer Science'],
    [/ngữ văn/i, 'Literature'], [/lịch sử/i, 'History'], [/địa lý/i, 'Geography'],
  ];
  // Only translate a recognized subject. Do not invent a qualification or biography.
  return englishText(value) || names.find(([pattern]) => pattern.test(value))?.[1] || '';
}
export function safeImageUrl(value: string | undefined) {
  if (!value || value.startsWith('//')) return undefined;
  if (value.startsWith('/') && !value.includes('\\')) return value;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined; }
  catch { return undefined; }
}
export function teacherImageUrl(value: string | undefined) {
  // Presentation only: preserve the user's stored avatar unchanged.
  if (!value || /dicebear|avataaars|adorable|emoji|robohash|avatar\.iran|ui-avatars|\/assets\/img\/trainer-\d/i.test(value)) return undefined;
  return safeImageUrl(value);
}
export function gradeLabel(value?: string | null) {
  if (!value) return '';
  const match = /^(?:Grade|Khối|Lớp)\s*(\d{1,2})$/i.exec(value.trim());
  return match ? `Grade ${match[1]}` : englishText(value);
}
export function scheduleLines(sessions?: Array<{ date: string; startTime: string; endTime: string }>) {
  return (sessions ?? []).slice(0, 2).flatMap(s => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date) || !/^\d{2}:\d{2}$/.test(s.startTime) || !/^\d{2}:\d{2}$/.test(s.endTime)) return [];
    const date = new Date(`${s.date}T12:00:00+07:00`);
    if (!Number.isFinite(date.getTime())) return [];
    const time = (text: string) => {
      const [h, m] = text.split(':').map(Number);
      return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
    };
    return [`${new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Bangkok' }).format(date)} · ${time(s.startTime)}–${time(s.endTime)}`];
  });
}
export function contactLinks(info?: { email?: string; hotline?: string }) {
  const email = info?.email?.trim() ?? '';
  const phone = info?.hotline?.trim() ?? '';
  return {
    email: /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email) ? email : '',
    phone: /^\+?[\d\s().-]{7,24}$/.test(phone) ? phone : '',
    tel: phone.replace(/[^+\d]/g, ''),
  };
}
