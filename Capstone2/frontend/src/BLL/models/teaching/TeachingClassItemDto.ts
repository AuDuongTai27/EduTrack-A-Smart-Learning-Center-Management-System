export interface TeachingClassItemDto {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  room?: string;
  tuitionFee: number;
  startDate: string;
  endDate?: string;
  status: string;
  studentCount: number;
  teacherName?: string;
  taName?: string;
  partnerName?: string;
  scheduleSummary?: string;
}

export interface TeachingClassStudentItemDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  email?: string;
  phone?: string;
  gender?: string;
  dob?: string;
  enrollmentDate?: string;
  status: string;
  parentName?: string;
  parentPhone?: string;
  attendanceRate: number;
  totalAttendedSessions: number;
  totalSessions: number;
}
