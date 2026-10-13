import type { UserRole } from './UserRole';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Role (bảng roles)
 */
export interface Role {
  roleId: number;
  roleName: 'admin' | 'center_manager' | 'teacher' | 'student' | 'parent' | string;
  description?: string | null;

  // Navigation Properties
  userRoles?: UserRole[];
}
