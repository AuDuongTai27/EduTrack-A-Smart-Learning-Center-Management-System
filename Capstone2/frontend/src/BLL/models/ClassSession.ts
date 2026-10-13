import type { Class } from './Class';
import type { ClassSchedule } from './ClassSchedule';
import type { Attendance } from './Attendance';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.ClassSession (bảng class_sessions)
 */
export interface ClassSession {
  sessionId: number;
  classId: number;
  scheduleId?: number | null;
  sessionDate: string;
  startTime: string; // "15:00:00"
  endTime: string;   // "16:30:00"
  room?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | string;

  // Navigation Properties
  class?: Class;
  schedule?: ClassSchedule | null;
  attendances?: Attendance[];
}
