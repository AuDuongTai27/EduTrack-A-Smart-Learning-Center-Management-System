import { classApi } from '../api/classApi';
import { MOCK_CLASSES, MOCK_SUBJECTS } from './mockData';
import type { ClassDto } from '../BLL/models/ClassDto';

export interface ClassesFetchResult {
  data: ClassDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * [CQRS Query Side] Tầng DAL đọc dữ liệu Lớp học (Classes) dùng chung cho cả 6 Roles
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

  getAll(): Promise<ClassesFetchResult> {
    return this.getAllClasses();
  },

  getById(id: number): Promise<ClassDto | null> {
    return this.getClassById(id);
  },
};

export default classDAL;
