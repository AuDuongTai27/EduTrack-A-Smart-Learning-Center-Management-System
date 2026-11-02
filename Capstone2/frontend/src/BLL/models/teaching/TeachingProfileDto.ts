export interface TeacherProfileDto {
  userId: number;
  userCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  enrolledSince: string;
  specialty: string;
  avatarUrl: string;
  address: string;
  roleTitle: string;
  role: string;
  activeClassesCount?: number;
  totalStudentsCount?: number;
}

export interface UpdateTeacherProfilePayload {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  specialty?: string;
  avatarUrl?: string;
  address?: string;
}

