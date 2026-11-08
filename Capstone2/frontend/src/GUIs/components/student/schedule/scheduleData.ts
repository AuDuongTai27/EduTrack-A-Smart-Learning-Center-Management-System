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

export type SessionSlot = SessionItem;

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
  { id: 's1', className: '[FE-Mock] Lớp Toán A1', subject: 'Toán học', startH: 15, startM: 0, endH: 16, endM: 30, teacher: 'Nguyễn Văn An', initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 0, status: 'upcoming' },
  { id: 's2', className: '[FE-Mock] Lớp Văn B2', subject: 'Ngữ văn', startH: 9, startM: 0, endH: 10, endM: 30, teacher: 'Trần Thị Mai', initials: 'TM', avatarBg: '#7C3AED', room: 'P.B105', day: 1, status: 'completed' },
  { id: 's3', className: '[FE-Mock] Lớp Toán A1', subject: 'Toán học', startH: 14, startM: 0, endH: 15, endM: 30, teacher: 'Nguyễn Văn An', initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 1, status: 'completed' },
  { id: 's4', className: '[FE-Mock] Lớp Anh C1', subject: 'Tiếng Anh', startH: 9, startM: 30, endH: 11, endM: 0, teacher: 'Lê Minh Tuấn', initials: 'LT', avatarBg: '#0EA5E9', room: 'P.C302', day: 2, status: 'completed' },
  { id: 's5', className: '[FE-Mock] Lớp Lý A3', subject: 'Vật lý', startH: 17, startM: 0, endH: 18, endM: 30, teacher: 'Phạm Thu Hà', initials: 'PH', avatarBg: '#0D9488', room: 'P.D104', day: 3, status: 'upcoming' },
  { id: 's6', className: '[FE-Mock] Lớp Hóa B1', subject: 'Hóa học', startH: 8, startM: 0, endH: 9, endM: 30, teacher: 'Hoàng Văn Nam', initials: 'HN', avatarBg: '#D97706', room: 'P.A101', day: 4, status: 'completed' },
  { id: 's7', className: '[FE-Mock] Lớp Toán A2', subject: 'Toán học', startH: 15, startM: 0, endH: 16, endM: 30, teacher: 'Nguyễn Văn An', initials: 'NA', avatarBg: '#2563EB', room: 'P.A203', day: 4, status: 'ongoing' },
  { id: 's8', className: '[FE-Mock] Lớp Sinh C2', subject: 'Sinh học', startH: 10, startM: 0, endH: 11, endM: 30, teacher: 'Vũ Thị Lan', initials: 'VL', avatarBg: '#059669', room: 'P.B202', day: 5, status: 'upcoming' },
  { id: 's9', className: '[FE-Mock] Lớp Sử D1', subject: 'Lịch sử', startH: 14, startM: 0, endH: 15, endM: 30, teacher: 'Đặng Minh Khoa', initials: 'ĐK', avatarBg: '#DC2626', room: 'P.C401', day: 6, status: 'cancelled' },
  { id: 's10', className: '[FE-Mock] Lớp Địa E1', subject: 'Địa lý', startH: 8, startM: 30, endH: 10, endM: 0, teacher: 'Bùi Thị Nga', initials: 'BN', avatarBg: '#9333EA', room: 'P.E201', day: 3, status: 'completed' },
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

import type { ClassScheduleDto } from '../../../../BLL/models/ClassScheduleDto';
import type { TeachingScheduleItemDto } from '../../../../BLL/models/teaching/TeachingScheduleDto';

const DAY_MAP: Record<string, number> = {
  monday: 0,
  mon: 0,
  'thứ 2': 0,
  'thứ hai': 0,
  tuesday: 1,
  tue: 1,
  'thứ 3': 1,
  'thứ ba': 1,
  wednesday: 2,
  wed: 2,
  'thứ 4': 2,
  'thứ tư': 2,
  thursday: 3,
  thu: 3,
  'thứ 5': 3,
  'thứ năm': 3,
  friday: 4,
  fri: 4,
  'thứ 6': 4,
  'thứ sáu': 4,
  saturday: 5,
  sat: 5,
  'thứ 7': 5,
  'thứ bảy': 5,
  sunday: 6,
  sun: 6,
  'chủ nhật': 6,
  cn: 6,
};

/**
 * Chuyển đổi ClassScheduleDto từ Backend .NET sang SessionItem cho lưới thời khóa biểu học sinh
 */
export function mapClassScheduleDtoToSessionItem(dto: ClassScheduleDto, index = 0): SessionItem {
  const dayKey = (dto.dayOfWeek || '').toLowerCase().trim();
  const day = DAY_MAP[dayKey] ?? (index % 7);

  const startParts = (dto.startTime || '18:00:00').split(':');
  const startH = parseInt(startParts[0], 10) || 18;
  const startM = parseInt(startParts[1], 10) || 0;

  const endParts = (dto.endTime || '20:00:00').split(':');
  const endH = parseInt(endParts[0], 10) || 20;
  const endM = parseInt(endParts[1], 10) || 0;

  let subject = 'Môn học';
  let avatarBg = '#2563EB';
  const nameLower = (dto.className || '').toLowerCase();
  if (nameLower.includes('toán') || nameLower.includes('math')) {
    subject = 'Toán học';
    avatarBg = '#2563EB';
  } else if (nameLower.includes('lý') || nameLower.includes('phys')) {
    subject = 'Vật lý';
    avatarBg = '#7C3AED';
  } else if (nameLower.includes('hóa') || nameLower.includes('chem')) {
    subject = 'Hóa học';
    avatarBg = '#D97706';
  } else if (nameLower.includes('anh') || nameLower.includes('eng')) {
    subject = 'Tiếng Anh';
    avatarBg = '#0EA5E9';
  } else if (nameLower.includes('văn') || nameLower.includes('lit')) {
    subject = 'Ngữ văn';
    avatarBg = '#DC2626';
  } else if (nameLower.includes('sinh') || nameLower.includes('bio')) {
    subject = 'Sinh học';
    avatarBg = '#059669';
  }

  return {
    id: `sched_${dto.scheduleId}`,
    className: dto.className,
    subject,
    startH,
    startM,
    endH,
    endM,
    teacher: 'Giáo viên phụ trách',
    initials: 'GV',
    avatarBg,
    room: dto.room || 'P.A101',
    day,
    status: 'upcoming',
  };
}

/**
 * Chuyển đổi TeachingScheduleItemDto từ Giáo viên / Trợ giảng sang SessionItem cho lưới thời khóa biểu
 */
export function mapTeachingScheduleDtoToSessionItem(
  dto: TeachingScheduleItemDto,
  isTa = false,
  index = 0
): SessionItem {
  const dayKey = (dto.dayOfWeek || '').toLowerCase().trim();
  const day = DAY_MAP[dayKey] ?? (index % 7);

  const startParts = (dto.startTime || '08:00:00').split(':');
  const startH = parseInt(startParts[0], 10) || 8;
  const startM = parseInt(startParts[1], 10) || 0;

  const endParts = (dto.endTime || '10:00:00').split(':');
  const endH = parseInt(endParts[0], 10) || 10;
  const endM = parseInt(endParts[1], 10) || 0;

  let subject = dto.subjectName || 'Môn học';
  let avatarBg = '#2563EB';
  const nameLower = `${dto.subjectName || ''} ${dto.className || ''}`.toLowerCase();
  if (nameLower.includes('toán') || nameLower.includes('math')) {
    subject = dto.subjectName || 'Toán học';
    avatarBg = '#2563EB';
  } else if (nameLower.includes('lý') || nameLower.includes('phys')) {
    subject = dto.subjectName || 'Vật lý';
    avatarBg = '#7C3AED';
  } else if (nameLower.includes('hóa') || nameLower.includes('chem')) {
    subject = dto.subjectName || 'Hóa học';
    avatarBg = '#D97706';
  } else if (nameLower.includes('anh') || nameLower.includes('eng')) {
    subject = dto.subjectName || 'Tiếng Anh';
    avatarBg = '#0EA5E9';
  } else if (nameLower.includes('văn') || nameLower.includes('lit')) {
    subject = dto.subjectName || 'Ngữ văn';
    avatarBg = '#DC2626';
  } else if (nameLower.includes('sinh') || nameLower.includes('bio')) {
    subject = dto.subjectName || 'Sinh học';
    avatarBg = '#059669';
  }

  // Đối tác cùng lớp:
  // Nếu là Giáo viên chính -> hiện tên Trợ giảng (TA)
  // Nếu là Trợ giảng -> hiện tên Giáo viên chính
  const partnerName = isTa
    ? (dto.teacherName || dto.partnerName || 'Giáo viên phụ trách')
    : (dto.taName || dto.partnerName || 'Trợ giảng');

  const words = partnerName.trim().split(/\s+/).filter(Boolean);
  const initials = words.length >= 2
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : (words[0]?.slice(0, 2).toUpperCase() || (isTa ? 'GV' : 'TG'));

  const stLower = (dto.status || '').toLowerCase();
  let status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'upcoming';

  if (stLower.includes('cancel') || stLower.includes('hủy') || stLower === 'inactive') {
    status = 'cancelled';
  } else if (stLower.includes('ongoing') || stLower.includes('diễn ra')) {
    status = 'ongoing';
  } else if (stLower.includes('completed') || stLower.includes('hoàn thành')) {
    status = 'completed';
  } else {
    // So sánh thời gian động với thời điểm hiện tại:
    // Kiểm tra xem session có diễn ra vào hôm nay không
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    if (day === currentDay) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        status = 'ongoing';
      } else if (currentMinutes >= endMinutes) {
        status = 'completed';
      } else {
        status = 'upcoming';
      }
    } else if (day < currentDay) {
      status = 'completed';
    } else {
      status = 'upcoming';
    }
  }

  return {
    id: `sched_${dto.scheduleId || index}`,
    className: dto.className,
    subject,
    startH,
    startM,
    endH,
    endM,
    teacher: partnerName,
    initials,
    avatarBg,
    room: dto.room || 'Phòng học',
    day,
    status,
  };
}
