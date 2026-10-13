import type { User } from './User';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.ParentStudent (bảng parent_students)
 */
export interface ParentStudent {
  parentId: number;
  studentId: number;
  relationship: string;
  isPrimaryContact: boolean;
  createdAt: string;

  // Navigation Properties
  parent?: User;
  student?: User;
}
