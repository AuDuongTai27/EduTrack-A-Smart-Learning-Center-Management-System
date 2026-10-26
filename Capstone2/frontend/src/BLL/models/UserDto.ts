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
  enrolledSince?: string | null;
  status: string;
  createdAt: string;
  roles?: string[];
}
