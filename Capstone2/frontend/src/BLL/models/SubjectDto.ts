/**
 * Ánh xạ DTO từ EduTrack.API.Models.DTOs.SubjectDto
 */
export interface SubjectDto {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description?: string | null;
  totalClasses?: number;
}
