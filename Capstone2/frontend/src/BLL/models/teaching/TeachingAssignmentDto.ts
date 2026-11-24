export interface CreateTeachingAssignmentRequest {
  classId: number;
  title: string;
  description?: string;
  dueDate: string;
  assignmentType?: string;
  fileUrl?: string;
  answerKeyFileUrl?: string;
  answerKeyText?: string;
  maxScore?: number;
  createdBy?: number;
  isAiGradingEnabled?: boolean;
}

export interface UpdateTeachingAssignmentRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  assignmentType?: string;
  fileUrl?: string;
  answerKeyFileUrl?: string;
  answerKeyText?: string;
  maxScore?: number;
  isAiGradingEnabled?: boolean;
}

export interface UpdateAssignmentRubricRequest {
  answerKeyFileUrl: string;
  answerKeyText?: string;
  requestedBy?: number;
}

export interface AiGradeSubmissionResponse {
  evaluationId: number;
  submissionId: number;
  assignmentId: number;
  aiScore: number;
  aiFeedback: string;
  evaluatedAt: string;
}

export interface TeachingAssignmentItemDto {
  assignmentId: number;
  classId: number;
  className: string;
  contentUnitId?: number;
  contentUnitTitle?: string;
  title: string;
  description?: string;
  fileUrl?: string;
  answerKeyFileUrl?: string | null;
  answerKeyText?: string | null;
  dueDate: string;
  dueDateFormatted: string;
  maxScore: number;
  createdBy: number;
  creatorName: string;
  assignmentType: string;
  submissionCount: number;
  gradedCount: number;
  status: 'active' | 'overdue' | 'graded' | string;
  isAiGradingEnabled: boolean;
  createdAt: string;
}

export interface TeachingSubmissionItemDto {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  fileUrl?: string;
  submittedAt: string;
  submittedAtFormatted: string;
  score?: number | null;
  feedback?: string | null;
  aiScore?: number | null;
  aiFeedback?: string | null;
  status: 'submitted' | 'graded' | string;
  gradedBy?: number | null;
  graderName?: string | null;
}

export interface GradeTeachingSubmissionRequest {
  score: number;
  feedback?: string;
  gradedBy?: number;
}
