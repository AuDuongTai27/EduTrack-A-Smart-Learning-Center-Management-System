import { subjectApi } from '../api/subjectApi';
import { MOCK_SUBJECTS } from './mockData';
import type { SubjectDto } from '../BLL/models/SubjectDto';

export interface SubjectsFetchResult {
  data: SubjectDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export interface SubjectDetailFetchResult {
  data: SubjectDto | null;
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu Môn học (Subjects)
 */
export const subjectDAL = {
  /**
   * Lấy toàn bộ danh sách môn học (kèm cờ nhận diện nguồn dữ liệu)
   */
  async getAllSubjects(): Promise<SubjectsFetchResult> {
    try {
      const data = await subjectApi.getAll();
      console.log('🟢 [subjectDAL] Kết nối Backend Subjects thành công, nhận', data.length, 'môn học.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [subjectDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: SubjectDto[] = MOCK_SUBJECTS.map((s) => ({
        subjectId: s.subjectId,
        subjectCode: s.subjectCode,
        subjectName: s.subjectName,
        description: s.description ?? null,
        totalClasses: 3,
      }));

      return {
        data: fallbackData,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  /**
   * Lấy chi tiết môn học theo ID
   */
  async getSubjectById(id: number): Promise<SubjectDetailFetchResult> {
    try {
      const data = await subjectApi.getById(id);
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [subjectDAL] Không tải được môn học #${id} từ backend, dùng mockData:`, err.message);
      const item = MOCK_SUBJECTS.find((s) => s.subjectId === id);
      if (!item) {
        return {
          data: null,
          isLiveApi: false,
          error: `Không tìm thấy môn học có ID = ${id}`,
        };
      }

      return {
        data: {
          subjectId: item.subjectId,
          subjectCode: item.subjectCode,
          subjectName: item.subjectName,
          description: item.description ?? null,
          totalClasses: 3,
        },
        isLiveApi: false,
      };
    }
  },
};

export default subjectDAL;
