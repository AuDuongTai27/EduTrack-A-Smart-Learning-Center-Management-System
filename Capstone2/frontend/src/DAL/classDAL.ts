import { classApi, type CreateClassRequest, type UpdateClassRequest } from '../api/classApi';
import { MOCK_CLASSES, MOCK_SUBJECTS } from './mockData';
import type { ClassDto } from '../BLL/models/ClassDto';

export interface ClassesFetchResult {
  data: ClassDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export interface ClassActionResult {
  success: boolean;
  data?: ClassDto;
  message?: string;
  isLiveApi: boolean;
}

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu Lớp học
 * - Ưu tiên gọi API Backend qua `classApi`
 * - Nếu server offline, tự động fallback sang `mockData`
 */
export const classDAL = {
  /**
   * Lấy toàn bộ danh sách lớp học
   */
  async getAllClasses(): Promise<ClassesFetchResult> {
    try {
      const apiClasses = await classApi.getAll();
      return {
        data: apiClasses,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [classDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: ClassDto[] = MOCK_CLASSES.map((cls) => {
        const subject = MOCK_SUBJECTS.find((s) => s.subjectId === cls.subjectId);
        return {
          classId: cls.classId,
          className: cls.className,
          subjectId: cls.subjectId,
          subjectName: subject?.subjectName || 'Môn học',
          subjectCode: subject?.subjectCode || 'MH',
          room: cls.room ?? null,
          tuitionFee: cls.tuitionFee,
          startDate: cls.startDate,
          endDate: cls.endDate ?? null,
          status: cls.status,
        };
      });

      return {
        data: fallbackData,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết lớp học theo ID
   */
  async getClassById(id: number): Promise<ClassDto | null> {
    try {
      return await classApi.getById(id);
    } catch (err) {
      console.warn(`🟡 [classDAL] Không thể gọi API cho lớp #${id}, tìm trong mockData:`, err);
      const found = MOCK_CLASSES.find((c) => c.classId === id);
      if (!found) return null;

      const subject = MOCK_SUBJECTS.find((s) => s.subjectId === found.subjectId);
      return {
        classId: found.classId,
        className: found.className,
        subjectId: found.subjectId,
        subjectName: subject?.subjectName || 'Môn học',
        subjectCode: subject?.subjectCode || 'MH',
        room: found.room ?? null,
        tuitionFee: found.tuitionFee,
        startDate: found.startDate,
        endDate: found.endDate ?? null,
        status: found.status,
      };
    }
  },

  /**
   * Tạo mới lớp học
   */
  async createClass(dto: CreateClassRequest): Promise<ClassActionResult> {
    try {
      const created = await classApi.create(dto);
      return {
        success: true,
        data: created,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [classDAL] Lỗi Backend khi tạo lớp học, fallback local mock:', err.message);
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

  /**
   * Cập nhật thông tin lớp học
   */
  async updateClass(id: number, dto: UpdateClassRequest): Promise<ClassActionResult> {
    try {
      const updated = await classApi.update(id, dto);
      return {
        success: true,
        data: updated,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [classDAL] Lỗi Backend khi cập nhật lớp #${id}, fallback local mock:`, err.message);
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

  /**
   * Xóa lớp học
   */
  async deleteClass(id: number): Promise<{ success: boolean; message?: string; isLiveApi: boolean }> {
    try {
      const res = await classApi.delete(id);
      return {
        success: true,
        message: res.message,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [classDAL] Lỗi Backend khi xóa lớp #${id}:`, err.message);
      return {
        success: false,
        message: err.message || 'Không thể xóa lớp học.',
        isLiveApi: false,
      };
    }
  },

  getAll(): Promise<ClassesFetchResult> {
    return this.getAllClasses();
  },

  getById(id: number): Promise<ClassDto | null> {
    return this.getClassById(id);
  },
};

export default classDAL;
