import { parentStudentApi, type ParentStudentDto } from '../api/parentStudentApi';
import { MOCK_PARENT_STUDENTS, MOCK_USERS } from './mockData';

export interface ParentStudentsFetchResult {
  data: ParentStudentDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * [CQRS Query Side] Tầng DAL đọc dữ liệu Liên kết Phụ huynh - Học sinh dùng chung
 */
export const parentStudentDAL = {
  /**
   * Lấy toàn bộ danh sách liên kết Phụ huynh - Học sinh
   */
  async getAllLinks(): Promise<ParentStudentsFetchResult> {
    try {
      const data = await parentStudentApi.getAll();
      console.log('🟢 [parentStudentDAL] Lấy danh sách liên kết từ Backend thành công:', data.length);
      return { data, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [parentStudentDAL] Backend API không phản hồi, dùng mockData:', err.message);

      const fallback: ParentStudentDto[] = MOCK_PARENT_STUDENTS.map((ps) => {
        const parent = MOCK_USERS.find((u) => u.userId === ps.parentId);
        const student = MOCK_USERS.find((u) => u.userId === ps.studentId);
        return {
          parentId: ps.parentId,
          parentName: parent?.fullName || 'Phụ huynh',
          parentPhone: parent?.phone || '',
          parentEmail: parent?.email || '',
          studentId: ps.studentId,
          studentName: student?.fullName || 'Học sinh',
          studentCode: student?.userCode || `STU${ps.studentId}`,
          relationship: ps.relationship || 'Parent',
          isPrimaryContact: ps.isPrimaryContact ?? true,
          createdAt: ps.createdAt || new Date().toISOString(),
        };
      });

      return { data: fallback, isLiveApi: false };
    }
  },
};

export default parentStudentDAL;
