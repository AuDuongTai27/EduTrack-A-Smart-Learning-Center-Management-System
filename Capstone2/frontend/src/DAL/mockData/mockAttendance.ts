import type { Attendance } from '../../BLL/models/Attendance';

/**
 * Dữ liệu mẫu điểm danh bám sát DbSeeder.cs (bảng attendance)
 */
export const MOCK_ATTENDANCES: Attendance[] = [
  {
    attendanceId: 1,
    sessionId: 1,
    studentId: 6, // STU001 - An
    status: 'present',
    note: 'On time and engaged',
    recordedBy: 3,
    recordedAt: '2026-09-08T18:05:00Z',
  },
  {
    attendanceId: 2,
    sessionId: 1,
    studentId: 7, // STU002 - Bích
    status: 'present',
    note: 'Active in class discussions',
    recordedBy: 3,
    recordedAt: '2026-09-08T18:05:00Z',
  },
  {
    attendanceId: 3,
    sessionId: 1,
    studentId: 8, // STU003 - Cường
    status: 'late',
    note: 'Arrived 15 minutes late with notice',
    recordedBy: 5,
    recordedAt: '2026-09-08T18:20:00Z',
  },
  {
    attendanceId: 4,
    sessionId: 2,
    studentId: 6, // STU001 - An
    status: 'present',
    note: null,
    recordedBy: 3,
    recordedAt: '2026-09-10T18:02:00Z',
  },
  {
    attendanceId: 5,
    sessionId: 2,
    studentId: 7, // STU002 - Bích
    status: 'absent',
    note: 'Sick leave approved',
    recordedBy: 5,
    recordedAt: '2026-09-10T18:10:00Z',
  },
  {
    attendanceId: 6,
    sessionId: 2,
    studentId: 8, // STU003 - Cường
    status: 'present',
    note: null,
    recordedBy: 3,
    recordedAt: '2026-09-10T18:05:00Z',
  },
];
