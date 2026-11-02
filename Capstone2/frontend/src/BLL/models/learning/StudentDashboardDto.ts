export interface StudentEnrolledClassApiDto {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  teacherInitials: string;
  scheduleText: string;
  room: string;
  attendedLessons: number;
  totalLessons: number;
  status: string;
}

export interface StudentDashboardApiDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarInitials: string;
  enrolledClassesCount: number;
  pendingAssignmentsCount: number;
  classes: StudentEnrolledClassApiDto[];
}
