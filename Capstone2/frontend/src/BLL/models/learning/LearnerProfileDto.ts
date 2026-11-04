export interface LearnerProfileApiDto {
  userId: number;
  userCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  enrolledSince: string;
  avatarUrl: string;
  address: string;
  identityCard: string;
  relationship: string;
}

export interface UpdateLearnerProfilePayload {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  address?: string;
}

