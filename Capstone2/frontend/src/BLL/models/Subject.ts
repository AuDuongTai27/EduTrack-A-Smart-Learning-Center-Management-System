import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Subject (bảng subjects)
 */
export interface Subject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  description?: string | null;

  // Navigation Properties
  classes?: Class[];
}
