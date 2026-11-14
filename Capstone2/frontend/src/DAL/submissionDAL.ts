import { submissionApi } from '../api/submissionApi';
import { MOCK_SUBMISSIONS } from './mockData/mockCurriculum';
import { MOCK_USERS } from './mockData/mockUsers';
import { MOCK_ASSIGNMENTS } from './mockData/mockCurriculum';
import type { SubmissionDto } from '../BLL/models/SubmissionDto';

export interface SubmissionsFetchResult {
  data: SubmissionDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export interface SubmissionDetailFetchResult {
  data: SubmissionDto | null;
  isLiveApi: boolean;
  error?: string | null;
}

/**
 * Tầng DAL điều phối dữ liệu Bài nộp của học sinh (Submissions)
 */
export const submissionDAL = {
  /**
   * Lấy toàn bộ danh sách bài nộp (kèm cờ nhận diện nguồn dữ liệu)
   */
  async getAllSubmissions(): Promise<SubmissionsFetchResult> {
    try {
      const data = await submissionApi.getAll();
      console.log('🟢 [submissionDAL] Kết nối Backend Submissions thành công, nhận', data.length, 'bản ghi.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [submissionDAL] Backend API không phản hồi, tự động dùng mockData:', err.message);

      const fallbackData: SubmissionDto[] = MOCK_SUBMISSIONS.map((sub) => {
        const student = MOCK_USERS.find((u) => u.userId === sub.studentId);
        const grader = MOCK_USERS.find((u) => u.userId === sub.gradedBy);
        const assign = MOCK_ASSIGNMENTS.find((a) => a.assignmentId === sub.assignmentId);

        return {
          submissionId: sub.submissionId,
          assignmentId: sub.assignmentId,
          assignmentTitle: assign?.title || '[FE-Mock] Assignment 1',
          studentId: sub.studentId,
          studentName: student?.fullName || '[FE-Mock] Student',
          studentCode: student?.userCode || `STU00${sub.studentId}`,
          fileUrl: sub.fileUrl,
          submittedAt: sub.submittedAt,
          score: sub.score,
          feedback: sub.feedback,
          aiScore: sub.aiScore,
          aiFeedbackJson: sub.aiFeedbackJson,
          status: sub.status,
          gradedBy: sub.gradedBy,
          graderName: grader?.fullName || 'ThS. Hoàng Quốc Việt',
        };
      });

      return {
        data: fallbackData,
        isLiveApi: false,
        error: 'Backend API is not active (Using fallback mockData)',
      };
    }
  },

  /**
   * Lấy danh sách bài nộp theo Assignment ID
   */
  async getSubmissionsByAssignmentId(assignmentId: number): Promise<SubmissionsFetchResult> {
    const all = await this.getAllSubmissions();
    const filtered = all.data.filter((s) => s.assignmentId === assignmentId);
    return {
      data: filtered.length > 0 ? filtered : all.data, // fallback to all if none matched
      isLiveApi: all.isLiveApi,
      error: all.error,
    };
  },

  /**
   * Lấy chi tiết bài nộp theo ID
   */
  async getSubmissionById(id: number): Promise<SubmissionDetailFetchResult> {
    try {
      const data = await submissionApi.getById(id);
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn(`🟡 [submissionDAL] Không tải được submission #${id}, dùng mockData:`, err.message);
      const all = await this.getAllSubmissions();
      const found = all.data.find((s) => s.submissionId === id);
      return {
        data: found || null,
        isLiveApi: false,
        error: found ? undefined : `Submission with ID = ${id} not found`,
      };
    }
  },
};

export default submissionDAL;
