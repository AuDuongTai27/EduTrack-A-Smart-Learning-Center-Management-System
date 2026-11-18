export interface EnrolledClassItem {
  classId: number;
  className: string;
  badge: string;
  subjectThemeClass: string;
  teacherName: string;
  teacherInitials: string;
  scheduleText: string;
  room: string;
  attendanceRate?: number;
  attendedSessions?: number;
  totalSessions?: number;
  isCompleted?: boolean;
}

export const MOCK_ENROLLED_CLASSES: EnrolledClassItem[] = [
  {
    classId: 1,
    className: '[FE-Mock] Math 9A – Algebra',
    badge: 'Math',
    subjectThemeClass: 'theme-math',
    teacherName: 'Nguyen Van Minh',
    teacherInitials: 'NM',
    scheduleText: 'Mon, Wed, Fri (17:30 - 19:00)',
    room: 'Room A101',
    attendanceRate: 95,
    attendedSessions: 19,
    totalSessions: 20,
    isCompleted: false,
  },
  {
    classId: 2,
    className: '[FE-Mock] Physics 9B – Mechanics',
    badge: 'Physics',
    subjectThemeClass: 'theme-physics',
    teacherName: 'Tran Thi Ha',
    teacherInitials: 'TH',
    scheduleText: 'Tue, Thu (18:00 - 19:30)',
    room: 'Room B202',
    attendanceRate: 90,
    attendedSessions: 18,
    totalSessions: 20,
    isCompleted: false,
  },
  {
    classId: 3,
    className: '[FE-Mock] Chemistry 9A – Inorganic Chemistry',
    badge: 'Chemistry',
    subjectThemeClass: 'theme-chemistry',
    teacherName: 'Le Hoang Nam',
    teacherInitials: 'LN',
    scheduleText: 'Sat, Sun (08:00 - 09:30)',
    room: 'Room C301',
    attendanceRate: 85,
    attendedSessions: 17,
    totalSessions: 20,
    isCompleted: false,
  },
  {
    classId: 4,
    className: '[FE-Mock] English 9 – Communication',
    badge: 'English',
    subjectThemeClass: 'theme-english',
    teacherName: 'Pham Thu Thao',
    teacherInitials: 'PT',
    scheduleText: 'Mon, Fri (19:30 - 21:00)',
    room: 'Lab Room 1',
    attendanceRate: 100,
    attendedSessions: 20,
    totalSessions: 20,
    isCompleted: false,
  },
  {
    classId: 5,
    className: '[FE-Mock] Literature 9 – Exam Prep',
    badge: 'Literature',
    subjectThemeClass: 'theme-literature',
    teacherName: 'Vo Thi Mai',
    teacherInitials: 'VM',
    scheduleText: 'Thu, Sun (17:00 - 18:30)',
    room: 'Room A105',
    attendanceRate: 80,
    attendedSessions: 16,
    totalSessions: 20,
    isCompleted: false,
  },
  {
    classId: 6,
    className: '[FE-Mock] Biology 9 – Genetics',
    badge: 'Biology',
    subjectThemeClass: 'theme-biology',
    teacherName: 'Do Tuan Anh',
    teacherInitials: 'DA',
    scheduleText: 'Wed, Sat (14:00 - 15:30)',
    room: 'Room B104',
    attendanceRate: 95,
    attendedSessions: 19,
    totalSessions: 20,
    isCompleted: false,
  },
];

import type { ClassDto } from '../../../../BLL/models/ClassDto';

/**
 * Convert ClassDto data from Backend (.NET API) to EnrolledClassItem display format
 */
export function mapClassDtoToEnrolledItem(dto: ClassDto): EnrolledClassItem {
  let subjectThemeClass = 'theme-math';
  let badge = dto.subjectName || 'Math';
  const code = (dto.subjectCode || '').toUpperCase();

  if (code.includes('PHYS') || code.includes('VAT') || code.includes('LY')) {
    subjectThemeClass = 'theme-physics';
    badge = 'Physics';
  } else if (code.includes('CHEM') || code.includes('HOA')) {
    subjectThemeClass = 'theme-chemistry';
    badge = 'Chemistry';
  } else if (code.includes('ENG') || code.includes('ANH')) {
    subjectThemeClass = 'theme-english';
    badge = 'English';
  } else if (code.includes('LIT') || code.includes('VAN')) {
    subjectThemeClass = 'theme-literature';
    badge = 'Literature';
  } else if (code.includes('BIO') || code.includes('SINH')) {
    subjectThemeClass = 'theme-biology';
    badge = 'Biology';
  }

  return {
    classId: dto.classId,
    className: dto.className,
    badge: badge,
    subjectThemeClass: subjectThemeClass,
    teacherName: 'Assigned Teacher',
    teacherInitials: dto.className.slice(0, 2).toUpperCase(),
    scheduleText: dto.startDate ? `Starts: ${new Date(dto.startDate).toLocaleDateString('en-US')}` : 'Schedule updating',
    room: dto.room || 'Main Classroom',
  };
}

