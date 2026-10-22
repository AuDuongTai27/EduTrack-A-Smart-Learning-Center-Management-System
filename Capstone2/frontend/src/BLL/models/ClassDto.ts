/**
 * Ánh xạ DTO từ EduTrack.API.Models.DTOs.ClassDto
 */
export interface ClassDto {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  room?: string | null;
  tuitionFee: number;
  startDate: string;
  endDate?: string | null;
  status: string;
}
