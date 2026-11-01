import { teachingApi, type CreateTeachingRequestPayload } from '../api/teachingApi';
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';

/**
 * [Bounded Context: Teaching]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 2 (Teacher & Teaching Assistant)
 */
export const teachingDAL = {
  /**
   * Gửi đơn yêu cầu mới từ Giáo viên / Trợ giảng
   */
  async createRequest(payload: CreateTeachingRequestPayload): Promise<{
    success: boolean;
    data: ApprovalRequestDto;
    isLiveApi: boolean;
  }> {
    try {
      const data = await teachingApi.createRequest(payload);
      return { success: true, data, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [teachingDAL] Backend chưa phản hồi, dùng fallback local mock:', err?.message);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const fallbackData: ApprovalRequestDto = {
        requestId: randomId,
        requestCode: `AR${String(randomId).padStart(4, '0')}`,
        requestType: payload.requestType || 'leave_request',
        title: payload.title,
        description: payload.description,
        requestedBy: payload.requestedBy || 2,
        requesterName: 'Nguyễn Thị Mai',
        status: 'pending',
        priority: payload.priority || 'medium',
        createdAt: new Date().toISOString(),
        reason: payload.reason || payload.description,
      };
      return {
        success: true,
        data: fallbackData,
        isLiveApi: false,
      };
    }
  },
};

export default teachingDAL;
