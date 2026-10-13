import type { Submission } from './Submission';
import type { User } from './User';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.AiEvaluation (bảng ai_evaluations)
 */
export interface AiEvaluation {
  evaluationId: number;
  submissionId: number;
  requestedBy: number;
  aiScore?: number | null;
  aiFeedback?: string | null;
  rawResponse?: string | null;
  status: string;
  createdAt: string;

  // Navigation Properties
  submission?: Submission;
  requester?: User;
}
