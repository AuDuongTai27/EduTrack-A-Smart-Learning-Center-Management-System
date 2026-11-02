import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import type { TeachingDashboardDto } from '../BLL/models/teaching/TeachingDashboardDto';
import type { TeachingScheduleItemDto } from '../BLL/models/teaching/TeachingScheduleDto';
import type { TeachingClassItemDto } from '../BLL/models/teaching/TeachingClassItemDto';
import type { TeachingClassProgressDto } from '../BLL/models/teaching/TeachingLearningProgressDto';
import type { TeachingNotificationDto } from '../BLL/models/teaching/TeachingNotificationDto';
import type { TeacherProfileDto, UpdateTeacherProfilePayload } from '../BLL/models/teaching/TeachingProfileDto';
import type {
  TeachingClassAttendanceSheetDto,
  TeachingSessionItemDto,
  TeachingStudentAttendanceItemDto,
  SaveBulkTeachingAttendancePayload,
  UpdateSingleAttendancePayload,
} from '../BLL/models/teaching/TeachingAttendanceDto';
import type {
  CreateTeachingAssignmentRequest,
  TeachingAssignmentItemDto,
} from '../BLL/models/teaching/TeachingAssignmentDto';

export * from '../BLL/models/teaching';

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

export interface UpdateTeachingRequestPayload {
  title: string;
  description: string;
  requestType?: string;
  priority?: string;
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
   * GET /api/teaching/classes/my-schedule?userId={userId}
   * Lấy thời khóa biểu giảng dạy hoặc lịch trực cá nhân của GV/TA
   */
  async getMySchedule(userId: number): Promise<TeachingScheduleItemDto[]> {
    const response = await fetch(`${API_BASE_URL}/teaching/classes/my-schedule?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải thời khóa biểu cá nhân`);
    }

    const json = await response.json();
    return json?.data ?? json ?? [];
  },

  /**
   * GET /api/teaching/classes/my-classes?userId={userId}
   * Lấy danh sách lớp học do Giáo viên hoặc Trợ giảng đang phụ trách
   */
  async getMyClasses(userId: number): Promise<TeachingClassItemDto[]> {
    const response = await fetch(`${API_BASE_URL}/teaching/classes/my-classes?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải danh sách lớp phụ trách`);
    }

    const json = await response.json();
    return json?.data ?? json ?? [];
  },

  /**
   * GET /api/teaching/classes/{classId}/learning-progress?userId={userId}
   * Lấy báo cáo tiến độ học tập và tình hình làm bài của tất cả học viên trong một lớp
   */
  async getClassLearningProgress(classId: number, userId?: number): Promise<TeachingClassProgressDto | null> {
    const url = userId
      ? `${API_BASE_URL}/teaching/classes/${classId}/learning-progress?userId=${userId}`
      : `${API_BASE_URL}/teaching/classes/${classId}/learning-progress`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải tiến độ học tập của lớp ${classId}`);
    }

    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * GET /api/teaching/notifications?userId={userId}&status={status}
   * Lấy danh sách thông báo dành cho Giáo viên hoặc Trợ giảng
   */
  async getNotifications(userId: number, status?: string): Promise<TeachingNotificationDto[]> {
    const params = new URLSearchParams({ userId: String(userId) });
    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/teaching/notifications?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải danh sách thông báo`);
    }

    const json = await response.json();
    return json?.data ?? json ?? [];
  },

  /**
   * PUT /api/teaching/notifications/{notificationId}/read
   * Đánh dấu một thông báo là đã đọc
   */
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/teaching/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi đánh dấu đã đọc thông báo #${notificationId}`);
    }

    const json = await response.json();
    return json?.success ?? true;
  },

  /**
   * PUT /api/teaching/notifications/read-all?userId={userId}
   * Đánh dấu toàn bộ thông báo của user là đã đọc
   */
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/teaching/notifications/read-all?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi đánh dấu tất cả thông báo là đã đọc`);
    }

    const json = await response.json();
    return json?.updatedCount ?? 0;
  },

  /**
   * GET /api/teaching/requests?userId={userId}&status={status}
   * Lấy danh sách đơn từ và yêu cầu đã gửi của Giáo viên hoặc Trợ giảng
   */
  async getRequests(userId: number, status?: string): Promise<ApprovalRequestDto[]> {
    const params = new URLSearchParams({ userId: String(userId) });
    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/teaching/requests?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải danh sách đơn từ và yêu cầu`);
    }

    const json = await response.json();
    return json?.data ?? json ?? [];
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
        requestedBy: payload.requestedBy || 3, // ThS. Hoàng Quốc Việt
        classId: payload.classId,
        studentId: payload.studentId,
        reason: payload.reason || payload.description,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * PUT /api/teaching/requests/{requestId}
   * Chỉnh sửa đơn yêu cầu (khi chưa được xem xét giải quyết)
   */
  async updateRequest(requestId: number, payload: UpdateTeachingRequestPayload): Promise<ApprovalRequestDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/requests/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        requestType: payload.requestType,
        priority: payload.priority,
        classId: payload.classId,
        studentId: payload.studentId,
        reason: payload.reason || payload.description,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP error ${res.status}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * GET /api/teaching/profile?userId={userId}
   * Lấy thông tin hồ sơ cá nhân của Giáo viên hoặc Trợ giảng
   */
  async getProfile(userId: number): Promise<TeacherProfileDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/profile?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} khi tải hồ sơ người dùng #${userId}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * PUT /api/teaching/profile?userId={userId}
   * Cập nhật thông tin hồ sơ cá nhân GV/TA
   */
  async updateProfile(userId: number, payload: UpdateTeacherProfilePayload): Promise<TeacherProfileDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/profile?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} khi cập nhật hồ sơ`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * GET /api/teaching/attendance/sheet?classId={classId}&sessionId={sessionId}&userId={userId}
   * Lấy bảng điểm danh của lớp theo buổi học
   */
  async getAttendanceSheet(classId: number, sessionId?: number, userId: number = 3): Promise<TeachingClassAttendanceSheetDto> {
    let url = `${API_BASE_URL}/teaching/attendance/sheet?classId=${classId}&userId=${userId}`;
    if (sessionId) {
      url += `&sessionId=${sessionId}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} khi tải bảng điểm danh lớp #${classId}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * GET /api/teaching/attendance/sessions?classId={classId}
   * Lấy danh sách các buổi học của lớp
   */
  async getClassSessions(classId: number): Promise<TeachingSessionItemDto[]> {
    const res = await fetch(`${API_BASE_URL}/teaching/attendance/sessions?classId=${classId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} khi tải danh sách buổi học của lớp #${classId}`);
    }

    const json = await res.json();
    return json?.data ?? json ?? [];
  },

  /**
   * POST /api/teaching/attendance/bulk
   * Lưu điểm danh đồng loạt cả lớp cho một buổi học
   */
  async saveBulkAttendance(payload: SaveBulkTeachingAttendancePayload): Promise<TeachingClassAttendanceSheetDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/attendance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} khi lưu điểm danh`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * PUT /api/teaching/attendance/{id}
   * Cập nhật điểm danh đơn lẻ 1 học sinh
   */
  async updateSingleAttendance(attendanceId: number, payload: UpdateSingleAttendancePayload): Promise<TeachingStudentAttendanceItemDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/attendance/${attendanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} khi cập nhật điểm danh #${attendanceId}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * POST /api/teaching/assignments
   * Tạo bài tập mới cho lớp học
   */
  async createAssignment(payload: CreateTeachingAssignmentRequest): Promise<TeachingAssignmentItemDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} khi tạo bài tập mới`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * GET /api/teaching/assignments?classId={classId}
   * Lấy danh sách bài tập của một lớp học
   */
  async getClassAssignments(classId: number): Promise<TeachingAssignmentItemDto[]> {
    const res = await fetch(`${API_BASE_URL}/teaching/assignments?classId=${classId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} khi tải danh sách bài tập của lớp #${classId}`);
    }

    const json = await res.json();
    return json?.data ?? json ?? [];
  },

  /**
   * GET /api/teaching/assignments/{id}
   * Lấy chi tiết bài tập theo ID
   */
  async getAssignmentById(id: number): Promise<TeachingAssignmentItemDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} khi tải chi tiết bài tập #${id}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },
};

export default teachingApi;
