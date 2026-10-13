import type { Assignment } from './Assignment';
import type { User } from './User';
import type { AiEvaluation } from './AiEvaluation';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Submission (bảng submissions)
 */
export interface Submission {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  fileUrl?: string | null;
  submittedAt?: string | null;
  score?: number | null;
  feedback?: string | null;
  aiScore?: number | null;
  aiFeedbackJson?: string | null;
  status: 'submitted' | 'graded' | 'late' | string;
  gradedBy?: number | null;

  // Navigation Properties
  assignment?: Assignment;
  student?: User;
  grader?: User | null;
  aiEvaluations?: AiEvaluation[];
}
