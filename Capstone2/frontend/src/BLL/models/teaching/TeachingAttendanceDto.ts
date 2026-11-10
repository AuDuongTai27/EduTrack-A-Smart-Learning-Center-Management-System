export interface TeachingSessionItemDto {
  sessionId: number;
  classId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  timePeriod: string;
  room: string;
  status: string;
  title: string;
  isRecorded: boolean;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  totalRecorded: number;
  hasStarted?: boolean;
  canTakeAttendance?: boolean;
}

export interface TeachingStudentAttendanceItemDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarUrl: string;
  attendanceId?: number;
  status: string; // 'present' | 'absent' | 'late' | 'excused'
  note?: string | null;
  recordedBy?: number | null;
  recorderName?: string | null;
  recordedAt?: string | null;
  isRecorded: boolean;
}

export interface TeachingAttendanceStatsDto {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

export interface TeachingClassAttendanceSheetDto {
  classId: number;
  className: string;
  subjectName: string;
  room: string;
  currentSession: TeachingSessionItemDto | null;
  availableSessions: TeachingSessionItemDto[];
  students: TeachingStudentAttendanceItemDto[];
  stats: TeachingAttendanceStatsDto;
}

export interface StudentAttendanceInputPayload {
  studentId: number;
  status: string;
  note?: string;
}

export interface SaveBulkTeachingAttendancePayload {
  classId: number;
  sessionId: number;
  recordedBy: number;
  items: StudentAttendanceInputPayload[];
}

export interface UpdateSingleAttendancePayload {
  status: string;
  note?: string;
  recordedBy: number;
}

