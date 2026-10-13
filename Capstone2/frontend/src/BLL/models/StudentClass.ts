import type { User } from './User';
import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.StudentClass (bảng student_classes)
 */
export interface StudentClass {
  scId: number;
  studentId: number;
  classId: number;
  enrolledDate?: string | null;
  status: 'active' | 'dropped' | 'completed' | string;
  droppedAt?: string | null;
  dropReason?: string | null;

  // Navigation Properties
  student?: User;
  class?: Class;
}
