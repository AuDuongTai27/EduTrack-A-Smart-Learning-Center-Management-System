/**
 * Ánh xạ DTO từ EduTrack.API.Models.DTOs.ClassScheduleDto
 */
export interface ClassScheduleDto {
  scheduleId: number;
  classId: number;
  className: string;
  dayOfWeek: string;
  startTime: string; // e.g. "17:30:00"
  endTime: string;   // e.g. "19:00:00"
  room?: string | null;
}
