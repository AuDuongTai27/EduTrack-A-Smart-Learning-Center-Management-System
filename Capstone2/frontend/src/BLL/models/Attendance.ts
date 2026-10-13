import type { ClassSession } from './ClassSession';
import type { User } from './User';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Attendance (bảng attendance)
 */
export interface Attendance {
  attendanceId: number;
  sessionId: number;
  studentId: number;
  status: 'present' | 'absent' | 'late' | 'excused' | string;
  note?: string | null;
  recordedBy: number;
  recordedAt: string;

  // Navigation Properties
  session?: ClassSession;
  student?: User;
  recorder?: User;
}
