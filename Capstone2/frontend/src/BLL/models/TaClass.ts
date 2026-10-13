import type { User } from './User';
import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.TaClass (bảng ta_classes)
 */
export interface TaClass {
  taClassId: number;
  taId: number;
  classId: number;
  assignedAt: string;
  status: 'active' | 'inactive' | string;

  // Navigation Properties
  ta?: User;
  class?: Class;
}
