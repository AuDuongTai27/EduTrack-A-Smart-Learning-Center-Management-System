/**
 * Ánh xạ DTO từ EduTrack.API.Models.DTOs.AssignmentDto
 */
export interface AssignmentDto {
  assignmentId: number;
  classId: number;
  className: string;
  contentUnitId?: number | null;
  contentUnitTitle?: string | null;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  dueDate: string;
  maxScore: number;
  createdBy: number;
  creatorName: string;
  isAiGradingEnabled: boolean;
}
