export interface TeachingProfileSummaryDto {
  userId: number;
  userCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  specialty?: string;
  avatarUrl?: string;
  roleTitle: string;
  role: string;
}

export interface TeachingKpiSummaryDto {
  activeAssignments: number;
  assignmentsDueToday: number;
  activeClasses: number;
  classesToday: number;
  totalStudents: number;
  pendingAttendance?: number;
}

export interface TodayClassSessionItemDto {
  sessionId?: number;
  classId: number;
  className: string;
  subjectName?: string;
  room?: string;
  timePeriod: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  studentsCount?: number;
  attendanceTaken?: boolean;
}

export interface TeachingNotificationItemDto {
  notificationId: number;
  title: string;
  description: string;
  sender: string;
  initials: string;
  initialsBgClass: string;
  initialsColorClass: string;
  isNew: boolean;
  isRead: boolean;
  timeAgo: string;
  createdAt: string;
}

export interface TeachingDashboardDto {
  profile: TeachingProfileSummaryDto;
  kpis: TeachingKpiSummaryDto;
  todayClasses: TodayClassSessionItemDto[];
  notifications: TeachingNotificationItemDto[];
}

