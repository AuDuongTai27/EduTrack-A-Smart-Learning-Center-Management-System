export interface EnrolledClassItem {
  classId: number;
  className: string;
  badge: string;
  subjectThemeClass: string;
  teacherName: string;
  teacherInitials: string;
  scheduleText: string;
  room: string;
}

export const MOCK_ENROLLED_CLASSES: EnrolledClassItem[] = [
  {
    classId: 1,
    className: 'Toán 9A – Đại Số',
    badge: 'Toán học',
    subjectThemeClass: 'theme-math',
    teacherName: 'Nguyễn Văn Minh',
    teacherInitials: 'NM',
    scheduleText: 'Thứ 2, 4, 6 (17:30 - 19:00)',
    room: 'Phòng A101',
  },
  {
    classId: 2,
    className: 'Vật Lý 9B – Cơ Học',
    badge: 'Vật lý',
    subjectThemeClass: 'theme-physics',
    teacherName: 'Trần Thị Hà',
    teacherInitials: 'TH',
    scheduleText: 'Thứ 3, 5 (18:00 - 19:30)',
    room: 'Phòng B202',
  },
  {
    classId: 3,
    className: 'Hóa Học 9A – Hóa Vô Cơ',
    badge: 'Hóa học',
    subjectThemeClass: 'theme-chemistry',
    teacherName: 'Lê Hoàng Nam',
    teacherInitials: 'LN',
    scheduleText: 'Thứ 7, CN (08:00 - 09:30)',
    room: 'Phòng C301',
  },
  {
    classId: 4,
    className: 'Tiếng Anh 9 – Giao Tiếp',
    badge: 'Tiếng Anh',
    subjectThemeClass: 'theme-english',
    teacherName: 'Phạm Thu Thảo',
    teacherInitials: 'PT',
    scheduleText: 'Thứ 2, 6 (19:30 - 21:00)',
    room: 'Phòng Lab 1',
  },
  {
    classId: 5,
    className: 'Ngữ Văn 9 – Luyện Đề',
    badge: 'Ngữ văn',
    subjectThemeClass: 'theme-literature',
    teacherName: 'Võ Thị Mai',
    teacherInitials: 'VM',
    scheduleText: 'Thứ 5, CN (17:00 - 18:30)',
    room: 'Phòng A105',
  },
  {
    classId: 6,
    className: 'Sinh Học 9 – Di Truyền Học',
    badge: 'Sinh học',
    subjectThemeClass: 'theme-biology',
    teacherName: 'Đỗ Tuấn Anh',
    teacherInitials: 'DA',
    scheduleText: 'Thứ 4, 7 (14:00 - 15:30)',
    room: 'Phòng B104',
  },
];

import type { ClassDto } from '../../../../BLL/models/ClassDto';

/**
 * Chuyển đổi dữ liệu ClassDto từ Backend (.NET API) sang định dạng hiển thị EnrolledClassItem
 */
export function mapClassDtoToEnrolledItem(dto: ClassDto): EnrolledClassItem {
  let subjectThemeClass = 'theme-math';
  let badge = dto.subjectName || 'Toán học';
  const code = (dto.subjectCode || '').toUpperCase();

  if (code.includes('PHYS') || code.includes('VAT') || code.includes('LY')) {
    subjectThemeClass = 'theme-physics';
    badge = 'Vật lý';
  } else if (code.includes('CHEM') || code.includes('HOA')) {
    subjectThemeClass = 'theme-chemistry';
    badge = 'Hóa học';
  } else if (code.includes('ENG') || code.includes('ANH')) {
    subjectThemeClass = 'theme-english';
    badge = 'Tiếng Anh';
  } else if (code.includes('LIT') || code.includes('VAN')) {
    subjectThemeClass = 'theme-literature';
    badge = 'Ngữ văn';
  } else if (code.includes('BIO') || code.includes('SINH')) {
    subjectThemeClass = 'theme-biology';
    badge = 'Sinh học';
  }

  return {
    classId: dto.classId,
    className: dto.className,
    badge: badge,
    subjectThemeClass: subjectThemeClass,
    teacherName: 'Giáo viên phụ trách',
    teacherInitials: dto.className.slice(0, 2).toUpperCase(),
    scheduleText: dto.startDate ? `Khai giảng: ${new Date(dto.startDate).toLocaleDateString('vi-VN')}` : 'Đang cập nhật lịch',
    room: dto.room || 'Phòng học chính',
  };
}

