import type { Class } from './Class';
import type { ClassSession } from './ClassSession';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.ClassSchedule (bảng class_schedules)
 */
export interface ClassSchedule {
  scheduleId: number;
  classId: number;
  dayOfWeek: string;
  startTime: string; // "15:00:00"
  endTime: string;   // "16:30:00"
  room?: string | null;

  // Navigation Properties
  class?: Class;
  classSessions?: ClassSession[];
}
