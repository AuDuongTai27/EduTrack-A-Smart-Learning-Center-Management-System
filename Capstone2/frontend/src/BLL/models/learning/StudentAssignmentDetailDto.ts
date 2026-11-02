export interface StudentSubmissionDetailApiDto {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  fileUrl: string;
  fileName: string;
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  aiScore?: number | null;
  aiFeedbackJson?: string | null;
  aiSummary?: string | null;
  status: string;
}

export interface StudentAssignmentDetailApiDto {
  assignmentId: number;
  classId: number;
  className: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  dueDate: string;
  maxScore: number;
  isAiGradingEnabled: boolean;
  rubricJson?: string | null;
  submission?: StudentSubmissionDetailApiDto | null;
}

export interface SubmitHomeworkPayload {
  assignmentId: number;
  studentId: number;
  fileName?: string;
  fileUrl?: string;
  fileSizeText?: string;
}
