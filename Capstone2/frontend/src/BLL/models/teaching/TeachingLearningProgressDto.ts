/**
 * [Bounded Context: Teaching]
 * DTO đại diện cho tiến độ học tập và điểm danh của một học sinh trong lớp
 */
export interface TeachingStudentProgressItemDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarInitials: string;
  email: string;
  phone: string;

  // Điểm danh (Attendance)
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalDays: number;
  attendancePercentage: number;
  attendanceStatus: 'Present' | 'Late' | 'Absent' | string;

  // Bài tập mới nhất
  latestAssignmentTitle: string;
  latestAssignmentStatus: 'Submitted' | 'Late' | 'Missing' | 'Pending' | 'Graded' | string;
  latestAssignmentScore?: number | null;
  maxScore?: number | null;

  // Ghi chú gần nhất
  latestNote?: string | null;
}

/**
 * DTO đại diện cho báo cáo tiến độ học tập toàn bộ lớp học
 */
export interface TeachingClassProgressDto {
  classId: number;
  className: string;
  subjectName: string;
  teacherName: string;
  totalStudents: number;
  totalSessions: number;
  completedSessions: number;
  latestAssignmentTitle: string;
  students: TeachingStudentProgressItemDto[];
}

