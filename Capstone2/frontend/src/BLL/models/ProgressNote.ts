import type { User } from './User';
import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.ProgressNote (bảng progress_notes)
 */
export interface ProgressNote {
  noteId: number;
  studentId: number;
  classId: number;
  writtenBy: number;
  content: string;
  noteType: 'feedback' | 'evaluation' | string;
  createdAt: string;

  // Navigation Properties
  student?: User;
  class?: Class;
  author?: User;
}
