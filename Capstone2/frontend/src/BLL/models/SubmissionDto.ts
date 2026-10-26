/**
 * Ánh xạ DTO từ EduTrack.API.Models.DTOs.SubmissionDto
 */
export interface SubmissionDto {
  submissionId: number;
  assignmentId: number;
  assignmentTitle?: string;
  studentId: number;
  studentName?: string;
  studentCode?: string;
  fileUrl?: string | null;
  submittedAt?: string | null;
  score?: number | null;
  feedback?: string | null;
  aiScore?: number | null;
  aiFeedbackJson?: string | null;
  status: string;
  gradedBy?: number | null;
  graderName?: string | null;
}
