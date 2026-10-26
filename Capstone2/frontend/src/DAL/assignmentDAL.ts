import { assignmentApi } from '../api/assignmentApi';
import type { AssignmentDto } from '../BLL/models/AssignmentDto';
import { MOCK_ASSIGNMENTS, MOCK_CONTENT_UNITS } from './mockData/mockCurriculum';
import { MOCK_CLASSES } from './mockData/mockClasses';
import { MOCK_USERS } from './mockData/mockUsers';

export interface AssignmentsFetchResult {
  data: AssignmentDto[];
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * Tầng Data Access Layer (DAL) điều phối dữ liệu cho Assignment
 * - Gọi backend qua `assignmentApi`
 * - Fallback tự động sang `mockData` nếu server chưa mở hoặc lỗi mạng
 */
export const assignmentDAL = {
  /**
   * Lấy toàn bộ danh sách bài tập (có Fallback)
   */
  async getAllAssignments(): Promise<AssignmentsFetchResult> {
    try {
      const data = await assignmentApi.getAll();
      console.log('🟢 [assignmentDAL] Kết nối Backend API thành công, nhận', data.length, 'bài tập.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [assignmentDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: AssignmentDto[] = MOCK_ASSIGNMENTS.map((asg) => {
        const cls = MOCK_CLASSES.find((c) => c.classId === asg.classId);
        const unit = MOCK_CONTENT_UNITS.find((u) => u.contentUnitId === asg.contentUnitId);
        const creator = MOCK_USERS.find((u) => u.userId === asg.createdBy);

        return {
          assignmentId: asg.assignmentId,
          classId: asg.classId,
          className: cls?.className || 'Lớp học',
          contentUnitId: asg.contentUnitId,
          contentUnitTitle: unit?.title || null,
          title: asg.title,
          description: asg.description,
          fileUrl: asg.fileUrl,
          dueDate: asg.dueDate,
          maxScore: asg.maxScore,
          createdBy: asg.createdBy,
          creatorName: creator?.fullName || 'Giáo viên',
          isAiGradingEnabled: asg.isAiGradingEnabled,
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
   * Lấy chi tiết bài tập theo ID (có Fallback)
   */
  async getAssignmentById(id: number): Promise<AssignmentDto | null> {
    try {
      return await assignmentApi.getById(id);
    } catch (err) {
      console.warn(`🟡 [assignmentDAL] Không thể gọi API cho bài tập #${id}, tìm trong mockData:`, err);
      const found = MOCK_ASSIGNMENTS.find((a) => a.assignmentId === id);
      if (!found) return null;

      const cls = MOCK_CLASSES.find((c) => c.classId === found.classId);
      const unit = MOCK_CONTENT_UNITS.find((u) => u.contentUnitId === found.contentUnitId);
      const creator = MOCK_USERS.find((u) => u.userId === found.createdBy);

      return {
        assignmentId: found.assignmentId,
        classId: found.classId,
        className: cls?.className || 'Lớp học',
        contentUnitId: found.contentUnitId,
        contentUnitTitle: unit?.title || null,
        title: found.title,
        description: found.description,
        fileUrl: found.fileUrl,
        dueDate: found.dueDate,
        maxScore: found.maxScore,
        createdBy: found.createdBy,
        creatorName: creator?.fullName || 'Giáo viên',
        isAiGradingEnabled: found.isAiGradingEnabled,
      };
    }
  },

  getAll(): Promise<AssignmentsFetchResult> {
    return this.getAllAssignments();
  },

  getById(id: number): Promise<AssignmentDto | null> {
    return this.getAssignmentById(id);
  },
};

export default assignmentDAL;
