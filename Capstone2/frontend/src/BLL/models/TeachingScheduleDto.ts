export interface TeachingScheduleItemDto {
  scheduleId: number;
  classId: number;
  className: string;
  subjectName?: string;
  room?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  studentCount: number;
  teacherName?: string;
  taName?: string;
  partnerName?: string;
  status: string;
}

