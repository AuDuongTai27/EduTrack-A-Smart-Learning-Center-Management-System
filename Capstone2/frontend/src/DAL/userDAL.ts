import { userApi } from '../api/userApi';
import type { UserDto } from '../BLL/models/UserDto';
import { MOCK_USERS, MOCK_ROLES, MOCK_USER_ROLES } from './mockData/mockUsers';

export interface UsersFetchResult {
  data: UserDto[];
  isLiveApi: boolean;
  error?: string | null;
}

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

  /**
   * Tạo người dùng mới
   */
  async createUser(dto: {
    userCode?: string;
    fullName: string;
    email?: string;
    phone?: string;
    role: string;
    specialty?: string;
    gender?: string;
  }): Promise<{ data: UserDto; isLiveApi: boolean }> {
    try {
      const created = await userApi.create(dto);
      console.log('🟢 [userDAL] Tạo tài khoản người dùng thành công qua API:', created);
      return { data: created, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [userDAL] API create thất bại, fallback local:', err.message);
      const fallbackId = Date.now();
      const prefix = dto.role === 'center_manager' ? 'MGR' : dto.role === 'admin_staff' ? 'ADM' : dto.role === 'teaching_assistant' ? 'TA' : 'TEA';
      const fallback: UserDto = {
        userId: fallbackId,
        userCode: dto.userCode || `${prefix}${fallbackId.toString().slice(-4)}`,
        fullName: dto.fullName,
        email: dto.email || `${prefix.toLowerCase()}${fallbackId}@edutrack.edu.vn`,
        phone: dto.phone || '0901 234 567',
        roles: [dto.role],
        specialty: dto.specialty || 'General',
        gender: dto.gender || 'other',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      return { data: fallback, isLiveApi: false };
    }
  },

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(
    id: number,
    dto: {
      fullName: string;
      email?: string;
      phone?: string;
      role?: string;
      specialty?: string;
      gender?: string;
      status?: string;
    }
  ): Promise<{ data: UserDto; isLiveApi: boolean }> {
    try {
      const updated = await userApi.update(id, dto);
      console.log('🟢 [userDAL] Cập nhật người dùng thành công qua API:', updated);
      return { data: updated, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [userDAL] API update thất bại, fallback local:', err.message);
      const fallback: UserDto = {
        userId: id,
        userCode: `USR${id}`,
        fullName: dto.fullName,
        email: dto.email || undefined,
        phone: dto.phone || undefined,
        roles: dto.role ? [dto.role] : ['teacher'],
        specialty: dto.specialty || undefined,
        gender: dto.gender || 'other',
        status: dto.status || 'active',
        createdAt: new Date().toISOString(),
      };
      return { data: fallback, isLiveApi: false };
    }
  },

  /**
   * Cập nhật trạng thái người dùng (Active / Inactive / Locked)
   */
  async updateUserStatus(id: number, status: string): Promise<{ success: boolean; isLiveApi: boolean }> {
    try {
      await userApi.updateStatus(id, status);
      console.log(`🟢 [userDAL] Cập nhật trạng thái user #${id} thành ${status} qua API thành công.`);
      return { success: true, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [userDAL] API updateStatus thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false };
    }
  },

  /**
   * Xóa tài khoản người dùng
   */
  async deleteUser(id: number): Promise<{ success: boolean; isLiveApi: boolean; message?: string }> {
    try {
      const res = await userApi.delete(id);
      console.log(`🟢 [userDAL] Xóa user #${id} thành công qua API.`);
      return { success: true, isLiveApi: true, message: res.message };
    } catch (err: any) {
      console.warn('🟡 [userDAL] API delete thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false, message: err.message };
    }
  },
};

export default userDAL;

