export interface ParentChildClassApiDto {
  id: number;
  name: string;
  subject: string;
  subjectClass: string;
  badge: string;
  teacher: string;
  teacherInitials: string;
  schedule: string;
  room: string;
  attendedLessons: number;
  totalLessons: number;
  notes: string;
}

export interface ParentChildOverviewApiDto {
  id: number;
  code: string;
  name: string;
  avatar: string;
  grade: string;
  school: string;
  dob: string;
  phone?: string;
  relationship: string;
  isPrimaryContact: boolean;
  classesCount: number;
  attendanceRate: number;
  averageScore: number;
  unpaidAmount: number;
  classes: ParentChildClassApiDto[];
}

