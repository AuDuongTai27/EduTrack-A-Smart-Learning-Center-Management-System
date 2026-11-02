export interface StudentScheduleSlotApiDto {
  id: string;
  classId: number;
  className: string;
  subject: string;
  subjectCode: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  teacher: string;
  initials: string;
  room: string;
  day: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface StudentProgressFeedbackApiDto {
  assignmentTitle: string;
  quote: string;
  teacherName: string;
  statusType: 'dat' | 'chuadat' | 'canluuy' | 'chuacham';
  statusIcon: string;
  statusLabel: string;
}

export interface StudentProgressClassApiDto {
  id: string;
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
  attended: number;
  total: number;
  percentage: number;
  isCompleted: boolean;
  feedbacks: StudentProgressFeedbackApiDto[];
}

export interface StudentProgressOverviewApiDto {
  studentId: number;
  studentName: string;
  overallAttendanceRate: number;
  attendedSessionsCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalSessionsCount: number;
  enrolledClassesCount: number;
  currentClasses: StudentProgressClassApiDto[];
}
