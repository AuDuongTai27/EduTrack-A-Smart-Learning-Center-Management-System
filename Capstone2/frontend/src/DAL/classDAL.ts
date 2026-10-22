import { classApi } from '../api/classApi';
import { MOCK_CLASSES, MOCK_SUBJECTS } from './mockData';
import type { ClassDto } from '../BLL/models/ClassDto';

export interface ClassesFetchResult {
  data: ClassDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu
 * - Thử gọi API Backend qua `classApi`
 * - Nếu server tắt hoặc mất mạng, tự động kích hoạt chế độ Fallback sang `mockData`
 */
export const classDAL = {
  /**
   * Lấy toàn bộ danh sách lớp học (kèm cờ nhận diện nguồn dữ liệu)
   */
  async getAllClasses(): Promise<ClassesFetchResult> {
    try {
      // 1. Thử gọi API thật qua tầng api/
      const apiClasses = await classApi.getAll();
      console.log('🟢 [classDAL] Kết nối Backend API thành công, nhận', apiClasses.length, 'lớp.');
      return {
        data: apiClasses,
        isLiveApi: true,
      };
    } catch (err: any) {
      // 2. Tự động Fallback sang MockData
      console.warn('🟡 [classDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      // Chuyển đổi dữ liệu MOCK_CLASSES sang đúng chuẩn ClassDto
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
   * Lấy chi tiết lớp học theo ID (kèm Fallback)
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
};

export default classDAL;
