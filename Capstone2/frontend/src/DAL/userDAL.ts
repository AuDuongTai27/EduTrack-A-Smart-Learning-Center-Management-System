import { userApi } from '../api/userApi';
import type { UserDto } from '../BLL/models/UserDto';
import { MOCK_USERS, MOCK_ROLES, MOCK_USER_ROLES } from './mockData/mockUsers';

export interface UsersFetchResult {
  data: UserDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * [CQRS Query Side] Tầng DAL đọc dữ liệu Người dùng (Users) dùng chung cho cả 6 Roles
 */
export const userDAL = {
  /**
   * Lấy toàn bộ danh sách người dùng (có Fallback)
   */
  async getAllUsers(): Promise<UsersFetchResult> {
    try {
      const data = await userApi.getAll();
      console.log('🟢 [userDAL] Kết nối Backend Users thành công, nhận', data.length, 'người dùng.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [userDAL] Backend API Users không phản hồi, tự động dùng mockData:', err.message);

      const fallback: UserDto[] = MOCK_USERS.map((u) => {
        const userRoles = MOCK_USER_ROLES.filter((ur) => ur.userId === u.userId)
          .map((ur) => MOCK_ROLES.find((r) => r.roleId === ur.roleId)?.roleName || '')
          .filter(Boolean);
        return {
          userId: u.userId,
          userCode: u.userCode,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          avatarUrl: u.avatarUrl,
          dateOfBirth: u.dateOfBirth,
          gender: u.gender,
          specialty: u.specialty,
          enrolledSince: u.enrolledSince,
          status: u.status,
          createdAt: u.createdAt,
          roles: userRoles,
        };
      });

      return {
        data: fallback,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết người dùng theo ID (có Fallback)
   */
  async getUserById(id: number): Promise<UserDto | null> {
    try {
      return await userApi.getById(id);
    } catch (err) {
      console.warn(`🟡 [userDAL] Không thể gọi API cho user #${id}, tìm trong mockData:`, err);
      const found = MOCK_USERS.find((u) => u.userId === id);
      if (!found) return null;
      const userRoles = MOCK_USER_ROLES.filter((ur) => ur.userId === found.userId)
        .map((ur) => MOCK_ROLES.find((r) => r.roleId === ur.roleId)?.roleName || '')
        .filter(Boolean);
      return {
        userId: found.userId,
        userCode: found.userCode,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone,
        avatarUrl: found.avatarUrl,
        dateOfBirth: found.dateOfBirth,
        gender: found.gender,
        specialty: found.specialty,
        enrolledSince: found.enrolledSince,
        status: found.status,
        createdAt: found.createdAt,
        roles: userRoles,
      };
    }
  },
};

export default userDAL;
