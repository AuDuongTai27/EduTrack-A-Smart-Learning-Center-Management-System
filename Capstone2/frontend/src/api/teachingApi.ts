import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import type { TeachingDashboardDto } from '../BLL/models/TeachingDashboardDto';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface CreateTeachingRequestPayload {
  title: string;
  description: string;
  requestType?: string;
  priority?: string;
  requestedBy?: number;
  classId?: number;
  studentId?: number;
  reason?: string;
}

/**
 * [Bounded Context: Teaching]
 * Tầng Network API dành riêng cho Thành viên 2 (Teacher & Teaching Assistant)
 */
export const teachingApi = {
  /**
   * GET /api/teaching/dashboard?userId={userId}
   * Lấy tổng quan Dashboard cho Giáo viên hoặc Trợ giảng (Backend tự động xác định role theo userId)
   */
  async getDashboard(userId: number): Promise<TeachingDashboardDto | null> {
    const response = await fetch(`${API_BASE_URL}/teaching/dashboard?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Dashboard giảng dạy`);
    }

    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * POST /api/teaching/requests
   * Tạo đơn yêu cầu/kiến nghị từ phía Giáo viên hoặc Trợ giảng
   */
  async createRequest(payload: CreateTeachingRequestPayload): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        requestType: payload.requestType || 'leave_request',
        priority: payload.priority || 'medium',
        requestedBy: payload.requestedBy || 2, // Default Teacher ID (Ms. Mai)
        classId: payload.classId,
        studentId: payload.studentId,
        reason: payload.reason || payload.description,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }

    return await res.json();
  },
};

export default teachingApi;
