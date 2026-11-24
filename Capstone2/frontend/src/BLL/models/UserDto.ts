export interface UserSpecialtyGroupDto {
  subjectId: number;
  subjectName: string;
  gradeIds: number[];
  gradeNames: string[];
}

export interface UserSubjectGradeInputDto {
  subjectId: number;
  gradeIds: number[];
}

export interface UserDto {
  userId: number;
  userCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  specialty?: string | null;
  gradeId?: number | null;
  gradeName?: string | null;
  subjectGrades?: UserSpecialtyGroupDto[];
  subjectIds?: number[];
  subjectNames?: string[];
  gradeIds?: number[];
  gradeNames?: string[];
  enrolledSince?: string | null;
  status: string;
  createdAt: string;
  roles?: string[];
}
