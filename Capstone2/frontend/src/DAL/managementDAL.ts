import {
  managementApi,
  type CreateClassRequest,
  type UpdateClassRequest,
} from '../api/managementApi';
import type { UserDto } from '../BLL/models/UserDto';
import type { ClassDto } from '../BLL/models/ClassDto';
import type { SubjectDto } from '../BLL/models/SubjectDto';
import type { ParentStudentDto } from '../api/parentStudentApi';
import { MOCK_CLASSES, MOCK_SUBJECTS } from './mockData';

export interface ClassActionResult {
  success: boolean;
  data?: ClassDto;
  message?: string;
  isLiveApi: boolean;
}

/**
 * [Bounded Context: Management]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 1 (Center Manager & Admin Staff)
 * Chứa toàn bộ các thao tác thêm/sửa/xóa đã hoàn thiện của 4 tính năng (Users, ParentStudents, Subjects, Classes)
 * và là nơi Thành viên 1 viết tiếp các hàm cho các trang còn lại của Center Manager & Admin Staff.
 */
export const managementDAL = {
  // ==========================================================================
  // 1. QUẢN LÝ NGƯỜI DÙNG & HỌC SINH (USERS)
  // ==========================================================================
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
      const created = await managementApi.createUser(dto);
      console.log('🟢 [managementDAL] Tạo tài khoản người dùng thành công qua API:', created);
      return { data: created, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API createUser thất bại, fallback local:', err.message);
      const fallbackId = Date.now();
      const prefix =
        dto.role === 'center_manager'
          ? 'MGR'
          : dto.role === 'admin_staff'
          ? 'ADM'
          : dto.role === 'teaching_assistant'
          ? 'TA'
          : 'TEA';
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
      const updated = await managementApi.updateUser(id, dto);
      console.log('🟢 [managementDAL] Cập nhật người dùng thành công qua API:', updated);
      return { data: updated, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API updateUser thất bại, fallback local:', err.message);
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

  async updateUserStatus(id: number, status: string): Promise<{ success: boolean; isLiveApi: boolean }> {
    try {
      await managementApi.updateUserStatus(id, status);
      console.log(`🟢 [managementDAL] Cập nhật trạng thái user #${id} thành ${status} qua API thành công.`);
      return { success: true, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API updateUserStatus thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false };
    }
  },

  async deleteUser(id: number): Promise<{ success: boolean; isLiveApi: boolean; message?: string }> {
    try {
      const res = await managementApi.deleteUser(id);
      console.log(`🟢 [managementDAL] Xóa user #${id} thành công qua API.`);
      return { success: true, isLiveApi: true, message: res.message };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API deleteUser thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false, message: err.message };
    }
  },

  // ==========================================================================
  // 2. LIÊN KẾT PHỤ HUYNH - HỌC SINH (PARENT - STUDENT LINKS)
  // ==========================================================================
  async assignLink(dto: {
    parentId: number;
    studentId: number;
    relationship?: string;
    isPrimaryContact?: boolean;
  }): Promise<{ data: ParentStudentDto; isLiveApi: boolean }> {
    try {
      const res = await managementApi.assignParentStudent(dto);
      console.log('🟢 [managementDAL] Gán liên kết thành công:', res);
      return { data: res, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API assignParentStudent thất bại, fallback local:', err.message);
      const fallback: ParentStudentDto = {
        parentId: dto.parentId,
        parentName: `Phụ huynh #${dto.parentId}`,
        parentPhone: '0901 234 567',
        parentEmail: 'parent@edutrack.edu.vn',
        studentId: dto.studentId,
        studentName: `Học sinh #${dto.studentId}`,
        studentCode: `STU${dto.studentId}`,
        relationship: dto.relationship || 'Parent',
        isPrimaryContact: dto.isPrimaryContact ?? true,
        createdAt: new Date().toISOString(),
      };
      return { data: fallback, isLiveApi: false };
    }
  },

  async removeLink(parentId: number, studentId: number): Promise<{ success: boolean; isLiveApi: boolean }> {
    try {
      await managementApi.removeParentStudent(parentId, studentId);
      console.log(`🟢 [managementDAL] Hủy liên kết Parent ${parentId} - Student ${studentId} thành công.`);
      return { success: true, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API removeParentStudent thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false };
    }
  },

  // ==========================================================================
  // 3. QUẢN LÝ MÔN HỌC (SUBJECTS)
  // ==========================================================================
  async createSubject(dto: {
    subjectCode: string;
    subjectName: string;
    description?: string;
  }): Promise<{ data: SubjectDto; isLiveApi: boolean }> {
    try {
      const created = await managementApi.createSubject(dto);
      console.log('🟢 [managementDAL] Tạo môn học thành công qua API:', created);
      return { data: created, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API createSubject thất bại, fallback local:', err.message);
      const fallback: SubjectDto = {
        subjectId: Date.now(),
        subjectCode: dto.subjectCode.toUpperCase(),
        subjectName: dto.subjectName,
        description: dto.description || null,
        totalClasses: 0,
      };
      return { data: fallback, isLiveApi: false };
    }
  },

  async updateSubject(
    id: number,
    dto: { subjectCode?: string; subjectName: string; description?: string }
  ): Promise<{ data: SubjectDto; isLiveApi: boolean }> {
    try {
      const updated = await managementApi.updateSubject(id, dto);
      console.log('🟢 [managementDAL] Cập nhật môn học thành công qua API:', updated);
      return { data: updated, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API updateSubject thất bại, fallback local:', err.message);
      const fallback: SubjectDto = {
        subjectId: id,
        subjectCode: dto.subjectCode || `SUB${id}`,
        subjectName: dto.subjectName,
        description: dto.description || null,
        totalClasses: 1,
      };
      return { data: fallback, isLiveApi: false };
    }
  },

  async deleteSubject(id: number): Promise<{ success: boolean; isLiveApi: boolean; message?: string }> {
    try {
      const res = await managementApi.deleteSubject(id);
      console.log('🟢 [managementDAL] Xóa môn học thành công qua API:', res);
      return { success: true, isLiveApi: true, message: res.message };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] API deleteSubject thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false, message: err.message };
    }
  },

  // ==========================================================================
  // 4. QUẢN LÝ LỚP HỌC (CLASSES)
  // ==========================================================================
  async createClass(dto: CreateClassRequest): Promise<ClassActionResult> {
    try {
      const created = await managementApi.createClass(dto);
      return {
        success: true,
        data: created,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [managementDAL] Lỗi Backend khi tạo lớp học, fallback local mock:', err.message);
      const newId = MOCK_CLASSES.length > 0 ? Math.max(...MOCK_CLASSES.map((c) => c.classId)) + 1 : 100;
      const subject = MOCK_SUBJECTS.find((s) => s.subjectId === dto.subjectId);
      const mockNew: ClassDto = {
        classId: newId,
        className: dto.className,
        subjectId: dto.subjectId,
        subjectName: subject?.subjectName || 'Môn học',
        subjectCode: subject?.subjectCode || 'MH',
        room: dto.room ?? null,
        tuitionFee: dto.tuitionFee,
        startDate: dto.startDate,
        endDate: dto.endDate ?? null,
        status: dto.status || 'active',
      };
      return {
        success: true,
        data: mockNew,
        message: 'Đã lưu lớp học (chế độ cục bộ)',
        isLiveApi: false,
      };
    }
  },

  async updateClass(id: number, dto: UpdateClassRequest): Promise<ClassActionResult> {
    try {
      const updated = await managementApi.updateClass(id, dto);
      return {
        success: true,
        data: updated,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [managementDAL] Lỗi Backend khi cập nhật lớp #${id}, fallback local mock:`, err.message);
      const subject = MOCK_SUBJECTS.find((s) => s.subjectId === dto.subjectId);
      const mockUpdated: ClassDto = {
        classId: id,
        className: dto.className,
        subjectId: dto.subjectId,
        subjectName: subject?.subjectName || 'Môn học',
        subjectCode: subject?.subjectCode || 'MH',
        room: dto.room ?? null,
        tuitionFee: dto.tuitionFee,
        startDate: dto.startDate,
        endDate: dto.endDate ?? null,
        status: dto.status,
      };
      return {
        success: true,
        data: mockUpdated,
        message: 'Đã cập nhật lớp học (chế độ cục bộ)',
        isLiveApi: false,
      };
    }
  },

  async deleteClass(id: number): Promise<{ success: boolean; message?: string; isLiveApi: boolean }> {
    try {
      const res = await managementApi.deleteClass(id);
      return {
        success: true,
        message: res.message,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [managementDAL] Lỗi Backend khi xóa lớp #${id}:`, err.message);
      return {
        success: false,
        message: err.message || 'Không thể xóa lớp học.',
        isLiveApi: false,
      };
    }
  },

  // TODO [Thành viên 1 - Center Manager & Admin Staff]:
  // Viết bổ sung các hàm điều phối dữ liệu cho các trang còn lại tại đây.
};

export default managementDAL;
