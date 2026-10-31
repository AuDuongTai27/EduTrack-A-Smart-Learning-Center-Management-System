export interface LandingCenterInfoDto {
  centerName: string;
  slogan: string;
  address: string;
  hotline: string;
  email: string;
  academicYear: string;
}

export interface LandingStatsDto {
  totalStudents: number;
  totalCourses: number;
  totalSchedules: number;
  totalTrainers: number;
}

export interface LandingSubjectItemDto {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description: string;
  activeClassesCount: number;
}

export interface LandingCourseItemDto {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  tuitionFee: number;
  room: string;
  teacherName: string;
  teacherAvatar?: string | null;
  studentsCount: number;
  likesCount: number;
  imageUrl: string;
}

export interface LandingTrainerItemDto {
  userId: number;
  userCode: string;
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  avatarUrl: string;
  roleTitle: string;
}

export interface LandingOverviewDto {
  centerInfo: LandingCenterInfoDto;
  stats: LandingStatsDto;
  subjects: LandingSubjectItemDto[];
  courses: LandingCourseItemDto[];
  trainers: LandingTrainerItemDto[];
}

