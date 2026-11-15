export interface SchedulePerson {
  userId: number;
  name: string;
}

export interface ScheduleSession {
  sessionId: number;
  classId: number;
  className: string;
  scheduleId: number | null;
  scheduleVersionId?: number | null;
  plannedOccurrenceDate?: string | null;
  occurrenceWeekStart?: string | null;
  subjectId: number;
  subjectName: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room: string | null;
  status: string;
  teachers: SchedulePerson[];
  teachingAssistants: SchedulePerson[];
  hasAttendance: boolean;
}

export interface ScheduleFilters {
  weekday?: string;
  search: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  taId: string;
  room: string;
  status: string;
}

export type ScheduleRole = 'center-manager' | 'admin-staff' | 'teacher' | 'teaching-assistant' | 'student';

export type SemesterPeriod = 'current' | 'previous' | 'next';

export interface ScheduleClassSummary {
  classId: number;
  className: string;
  startDate: string;
  endDate: string | null;
  status: string;
}

export interface SemesterWeekOption {
  monday: string;
  weekNumber: number;
  label: string;
}
