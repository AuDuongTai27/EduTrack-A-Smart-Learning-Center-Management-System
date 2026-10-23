import { approvalRequestApi } from '../api/approvalRequestApi';
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import { MOCK_APPROVAL_REQUESTS } from './mockData/mockApprovalRequests';
import { MOCK_USERS } from './mockData/mockUsers';
import { MOCK_CLASSES } from './mockData/mockClasses';

export interface ApprovalRequestsFetchResult {
  data: ApprovalRequestDto[];
  isLiveApi: boolean;
  error?: string | null;
}

export const feedbackDAL = {
  /**
   * Lấy toàn bộ danh sách đơn phản hồi / phê duyệt (có Fallback)
   */
  async getAllRequests(): Promise<ApprovalRequestsFetchResult> {
    try {
      const data = await approvalRequestApi.getAll();
      console.log('🟢 [feedbackDAL] Kết nối Backend ApprovalRequests thành công, nhận', data.length, 'đơn.');
      return {
        data,
        isLiveApi: true,
      };
    } catch (err: any) {
      console.warn('🟡 [feedbackDAL] Backend API ApprovalRequests không phản hồi, tự động dùng mockData:', err.message);

      const fallback: ApprovalRequestDto[] = MOCK_APPROVAL_REQUESTS.map((req) => {
        const student = MOCK_USERS.find((u) => u.userId === req.studentId);
        const requester = MOCK_USERS.find((u) => u.userId === req.requestedBy);
        const reviewer = MOCK_USERS.find((u) => u.userId === req.reviewedBy);
        const cls = MOCK_CLASSES.find((c) => c.classId === req.classId);

        return {
          requestId: req.requestId,
          requestCode: req.requestCode,
          requestType: req.requestType,
          title: req.title,
          description: req.description,
          studentId: req.studentId,
          studentName: student?.fullName || 'Học sinh',
          invoiceId: req.invoiceId,
          classId: req.classId,
          className: cls?.className || '[FE-Mock] Lớp học',
          requestedBy: req.requestedBy,
          requesterName: requester?.fullName || 'Người gửi',
          reviewedBy: req.reviewedBy,
          reviewerName: reviewer?.fullName || null,
          priority: req.priority,
          status: req.status,
          reason: req.reason,
          createdAt: req.createdAt,
          reviewedAt: req.reviewedAt,
          reviewNotes: req.reviewNotes,
        };
      });

      return {
        data: fallback,
        isLiveApi: false,
        error: 'Backend API chưa bật (Đang dùng dữ liệu dự phòng mockData)',
      };
    }
  },

  async getRequestById(id: number): Promise<ApprovalRequestDto | null> {
    try {
      return await approvalRequestApi.getById(id);
    } catch (err) {
      console.warn(`🟡 [feedbackDAL] Không thể gọi API cho yêu cầu #${id}, tìm trong mockData:`, err);
      const found = MOCK_APPROVAL_REQUESTS.find((r) => r.requestId === id);
      if (!found) return null;
      return {
        ...found,
        requesterName: 'Người gửi',
      };
    }
  },
};

export default feedbackDAL;
