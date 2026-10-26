import { parentStudentApi, type ParentStudentDto } from '../api/parentStudentApi';
import { MOCK_PARENT_STUDENTS, MOCK_USERS } from './mockData';

export interface ParentStudentsFetchResult {
  data: ParentStudentDto[];
  isLiveApi: boolean;
  error?: string | null;
}

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

  /**
   * Gán liên kết học sinh - phụ huynh
   */
  async assignLink(dto: {
    parentId: number;
    studentId: number;
    relationship?: string;
    isPrimaryContact?: boolean;
  }): Promise<{ data: ParentStudentDto; isLiveApi: boolean }> {
    try {
      const res = await parentStudentApi.assign(dto);
      console.log('🟢 [parentStudentDAL] Gán liên kết thành công:', res);
      return { data: res, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [parentStudentDAL] API assign thất bại, fallback local:', err.message);
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

  /**
   * Hủy liên kết phụ huynh - học sinh
   */
  async removeLink(parentId: number, studentId: number): Promise<{ success: boolean; isLiveApi: boolean }> {
    try {
      await parentStudentApi.delete(parentId, studentId);
      console.log(`🟢 [parentStudentDAL] Hủy liên kết Parent ${parentId} - Student ${studentId} thành công.`);
      return { success: true, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [parentStudentDAL] API delete thất bại, fallback local:', err.message);
      return { success: true, isLiveApi: false };
    }
  },
};

export default parentStudentDAL;
