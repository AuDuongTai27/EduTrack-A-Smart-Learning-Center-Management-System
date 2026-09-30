export interface SessionItem {
  id: string;
  className: string;
  subject: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  teacher: string;
  initials: string;
  avatarBg: string;
  room: string;
  day: number; // 0 = Mon, 6 = Sun
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export const GRID_START = 7;
export const GRID_END = 21;
export const TOTAL_H = GRID_END - GRID_START; // 14 hours
export const HOUR_PX = 80;
export const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

export const STATUS_CLASS: Record<string, string> = {
  upcoming: 'session-card-upcoming',
  ongoing: 'session-card-ongoing',
  completed: 'session-card-completed',
  cancelled: 'session-card-cancelled',
};

export const SESSIONS: SessionItem[] = [
  { id: 's1', className: 'Lớp Toán A1', subject: 'Toán học', startH: 15, startM: 0, endH: 16, endM: 30, teacher: 'Nguyễn Văn An', initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 0, status: 'upcoming' },
  { id: 's2', className: 'Lớp Văn B2', subject: 'Ngữ văn', startH: 9, startM: 0, endH: 10, endM: 30, teacher: 'Trần Thị Mai', initials: 'TM', avatarBg: '#7C3AED', room: 'P.B105', day: 1, status: 'completed' },
  { id: 's3', className: 'Lớp Toán A1', subject: 'Toán học', startH: 14, startM: 0, endH: 15, endM: 30, teacher: 'Nguyễn Văn An', initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 1, status: 'completed' },
  { id: 's4', className: 'Lớp Anh C1', subject: 'Tiếng Anh', startH: 9, startM: 30, endH: 11, endM: 0, teacher: 'Lê Minh Tuấn', initials: 'LT', avatarBg: '#0EA5E9', room: 'P.C302', day: 2, status: 'completed' },
  { id: 's5', className: 'Lớp Lý A3', subject: 'Vật lý', startH: 17, startM: 0, endH: 18, endM: 30, teacher: 'Phạm Thu Hà', initials: 'PH', avatarBg: '#0D9488', room: 'P.D104', day: 3, status: 'upcoming' },
  { id: 's6', className: 'Lớp Hóa B1', subject: 'Hóa học', startH: 8, startM: 0, endH: 9, endM: 30, teacher: 'Hoàng Văn Nam', initials: 'HN', avatarBg: '#D97706', room: 'P.A101', day: 4, status: 'completed' },
  { id: 's7', className: 'Lớp Toán A2', subject: 'Toán học', startH: 15, startM: 0, endH: 16, endM: 30, teacher: 'Nguyễn Văn An', initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 4, status: 'ongoing' },
  { id: 's8', className: 'Lớp Sinh C2', subject: 'Sinh học', startH: 10, startM: 0, endH: 11, endM: 30, teacher: 'Vũ Thị Lan', initials: 'VL', avatarBg: '#059669', room: 'P.B202', day: 5, status: 'upcoming' },
  { id: 's9', className: 'Lớp Sử D1', subject: 'Lịch sử', startH: 14, startM: 0, endH: 15, endM: 30, teacher: 'Đặng Minh Khoa', initials: 'ĐK', avatarBg: '#DC2626', room: 'P.C401', day: 6, status: 'cancelled' },
  { id: 's10', className: 'Lớp Địa E1', subject: 'Địa lý', startH: 8, startM: 30, endH: 10, endM: 0, teacher: 'Bùi Thị Nga', initials: 'BN', avatarBg: '#9333EA', room: 'P.E201', day: 3, status: 'completed' },
];

export function getMonday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const wd = x.getDay();
  x.setDate(x.getDate() - wd + (wd === 0 ? -6 : 1));
  return x;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function fmtDayMon(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

export function fmtTime(h: number, m: number): string {
  return `${pad2(h)}:${pad2(m)}`;
}
