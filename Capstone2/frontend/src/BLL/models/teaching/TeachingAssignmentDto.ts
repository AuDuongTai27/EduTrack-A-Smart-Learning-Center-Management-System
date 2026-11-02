export interface CreateTeachingAssignmentRequest {
  classId: number;
  title: string;
  description?: string;
  dueDate: string;
  assignmentType?: string;
  fileUrl?: string;
  maxScore?: number;
  createdBy?: number;
  isAiGradingEnabled?: boolean;
}

export interface TeachingAssignmentItemDto {
  assignmentId: number;
  classId: number;
  className: string;
  title: string;
  description?: string;
  fileUrl?: string;
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

