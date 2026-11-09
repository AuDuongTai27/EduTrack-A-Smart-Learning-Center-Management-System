/**
 * DTOs phục vụ màn hình Chi Tiết Tiến Độ Học Viên (Student Progress Detail) & Đánh Giá Cá Nhân
 * [Bounded Context: Teaching - Teacher & Teaching Assistant]
 */

export interface TeachingStudentAssignmentDetailItemDto {
  assignmentId: number;
  title: string;
  weekTitle: string;
  dueDate: string;
  submittedAt?: string;
  status: "graded" | "submitted" | "late" | "missing" | "pending";
  score?: number | null;
  maxScore: number;
  aiScore?: number | null;
  submissionFileUrl?: string;
  teacherFeedback?: string;
  aiFeedback?: string;
}

export interface TeachingStudentEvaluationItemDto {
  id: number;
  evaluatorName: string;
  evaluatorRole: string;
  evaluationType: string;
  typeLabel: string;
  rating: "excellent" | "good" | "needs_improvement" | "concern";
  ratingLabel: string;
  content: string;
  suggestions?: string;
  createdAt: string;
}

export interface TeachingStudentProgressDetailDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarInitials: string;
  email: string;
  phone: string;
  presentDays: number;
  absentDays: number;
  totalDays: number;
  attendancePercentage: number;
  className: string;
  subjectName: string;
  avgScore: string;
  assignments: TeachingStudentAssignmentDetailItemDto[];
  evaluations: TeachingStudentEvaluationItemDto[];
}

export interface CreateTeachingEvaluationPayload {
  classId: number;
  studentId: number;
  evaluatorName?: string;
  evaluatorRole?: string;
  evaluationType: string;
  typeLabel?: string;
  rating: "excellent" | "good" | "needs_improvement" | "concern";
  ratingLabel?: string;
  content: string;
  suggestions?: string;
}
