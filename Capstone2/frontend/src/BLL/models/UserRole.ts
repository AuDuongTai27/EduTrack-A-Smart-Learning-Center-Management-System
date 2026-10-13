import type { User } from './User';
import type { Role } from './Role';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.UserRole (bảng user_roles)
 */
export interface UserRole {
  userRoleId: number;
  userId: number;
  roleId: number;

  // Navigation Properties
  user?: User;
  role?: Role;
}
