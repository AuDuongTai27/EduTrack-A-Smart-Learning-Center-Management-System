import type { User } from './User';
import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.TeacherClass (bảng teacher_classes)
 */
export interface TeacherClass {
  teacherClassId: number;
  teacherId: number;
  classId: number;
  assignedAt: string;
  status: 'active' | 'inactive' | string;

  // Navigation Properties
  teacher?: User;
  class?: Class;
}
