import type { Class } from './Class';
import type { ContentUnit } from './ContentUnit';
import type { User } from './User';
import type { Submission } from './Submission';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Assignment (bảng assignments)
 */
export interface Assignment {
  assignmentId: number;
  contentUnitId?: number | null;
  classId: number;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  dueDate: string;
  maxScore: number;
  createdBy: number;
  answerKeyText?: string | null;
  answerKeyFileUrl?: string | null;
  rubricJson?: string | null;
  isAiGradingEnabled: boolean;

  // Navigation Properties
  class?: Class;
  contentUnit?: ContentUnit | null;
  creator?: User;
  submissions?: Submission[];
}
