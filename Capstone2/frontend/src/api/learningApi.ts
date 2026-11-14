const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export * from '../BLL/models/learning';
import { getAuthHeaders, getAuthUser } from './authApi';
import type {
  StudentDashboardApiDto,
  ParentChildOverviewApiDto,
  StudentClassDetailApiDto,
  StudentAssignmentDetailApiDto,
  StudentSubmissionDetailApiDto,
  SubmitHomeworkPayload,
  StudentScheduleSlotApiDto,
  StudentProgressOverviewApiDto,
  StudentTuitionOverviewApiDto,
  PayStudentTuitionPayload,
  LearnerFeedbackItemApiDto,
  CreateLearnerFeedbackPayload,
  UpdateLearnerFeedbackPayload,
  LearnerNotificationItemApiDto,
  LearnerProfileApiDto,
  UpdateLearnerProfilePayload,
} from '../BLL/models/learning';

function resolveStudent(studentId: number): number {
  if (studentId === 6) {
    const authUser = getAuthUser();
    if (
      authUser &&
      authUser.userId > 0 &&
      (authUser.primaryRole === 'student' || authUser.roles?.includes('student'))
    ) {
      return authUser.userId;
    }
  }
  return studentId;
}

function resolveParent(parentId: number): number {
  if (parentId === 9) {
    const authUser = getAuthUser();
    if (
      authUser &&
      authUser.userId > 0 &&
      (authUser.primaryRole === 'parent' || authUser.roles?.includes('parent'))
    ) {
      return authUser.userId;
    }
  }
  return parentId;
}

function resolveLearnerUser(userId: number): number {
  if (userId === 6) return resolveStudent(userId);
  if (userId === 9) return resolveParent(userId);
  return userId;
}

/**
 * [Bounded Context: Learning]
 * Tầng Network API dành riêng cho Thành viên 3 (Student & Parent)
 */
export const learningApi = {
  /**
   * Lấy dữ liệu tổng quan Dashboard của Học sinh (kèm danh sách lớp, giáo viên, lịch học)
   */
  async getStudentDashboard(studentId: number): Promise<StudentDashboardApiDto | null> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Dashboard`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Lấy dữ liệu tổng quan danh sách con đã liên kết của Phụ huynh
   */
  async getParentChildrenOverview(parentId: number): Promise<ParentChildOverviewApiDto[]> {
    const pid = resolveParent(parentId);
    const response = await fetch(`${API_BASE_URL}/learning/parent/${pid}/children-overview`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Parent Children Overview`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Lấy chi tiết lớp học (tài liệu ContentUnits, danh sách bài tập kèm trạng thái nộp, điểm danh các buổi học)
   */
  async getStudentClassDetail(studentId: number, classId: number): Promise<StudentClassDetailApiDto | null> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/classes/${classId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Class Detail`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Lấy thời khóa biểu tuần của Học sinh (GET /api/learning/student/{studentId}/schedule)
   */
  async getStudentSchedule(studentId: number): Promise<StudentScheduleSlotApiDto[]> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/schedule`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Schedule`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Lấy báo cáo Tiến độ học tập & Điểm danh của Học sinh (GET /api/learning/student/{studentId}/progress)
   */
  async getStudentProgress(studentId: number): Promise<StudentProgressOverviewApiDto | null> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Progress`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Lấy thông tin Hóa đơn học phí & Lịch sử giao dịch của Học sinh (GET /api/learning/parent/tuition/{studentId})
   */
  async getStudentTuition(studentId: number): Promise<StudentTuitionOverviewApiDto | null> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/parent/tuition/${sid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Tuition`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Phụ huynh thanh toán học phí trực tuyến cho con (POST /api/learning/parent/payments)
   */
  async payStudentTuition(payload: PayStudentTuitionPayload): Promise<StudentTuitionOverviewApiDto> {
    const finalPayload: PayStudentTuitionPayload = {
      ...payload,
      studentId: resolveStudent(payload.studentId),
      parentId: payload.parentId ? resolveParent(payload.parentId) : payload.parentId,
    };
    const response = await fetch(`${API_BASE_URL}/learning/parent/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(finalPayload),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(json?.message || `HTTP ${response.status} khi thanh toán học phí`);
    }
    return json?.data ?? json;
  },

  /**
   * Tạo lại hóa đơn chờ thanh toán cho kỳ hiện tại để Demo (POST /api/learning/parent/tuition/{studentId}/reset-demo)
   */
  async resetDemoTuition(studentId: number): Promise<StudentTuitionOverviewApiDto> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/parent/tuition/${sid}/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi khôi phục hóa đơn demo`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Lấy chi tiết bài tập kèm bài đã nộp, điểm Giáo viên & kết quả AI chấm
   */
  async getStudentAssignmentDetail(
    studentId: number,
    assignmentId: number
  ): Promise<StudentAssignmentDetailApiDto | null> {
    const sid = resolveStudent(studentId);
    const response = await fetch(
      `${API_BASE_URL}/learning/submissions/student/${sid}/assignment/${assignmentId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Assignment Detail`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Nộp bài tập mới hoặc nộp lại bài tập (POST /api/learning/submissions)
   */
  async submitHomework(payload: SubmitHomeworkPayload): Promise<StudentSubmissionDetailApiDto> {
    const finalPayload: SubmitHomeworkPayload = {
      ...payload,
      studentId: resolveStudent(payload.studentId),
    };
    const response = await fetch(`${API_BASE_URL}/learning/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(finalPayload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi nộp bài tập`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Xóa / Rút lại bài nộp của học sinh
   */
  async deleteSubmission(studentId: number, assignmentId: number): Promise<boolean> {
    const sid = resolveStudent(studentId);
    const response = await fetch(
      `${API_BASE_URL}/learning/submissions/student/${sid}/assignment/${assignmentId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi xóa bài nộp`);
    }
    return true;
  },

  /**
   * Lấy lịch sử Phản hồi & Đơn xin phép của Học sinh hoặc Phụ huynh (GET /api/learning/feedback/user/{userId})
   */
  async getLearnerFeedbacks(userId: number, studentId?: number): Promise<LearnerFeedbackItemApiDto[]> {
    const uid = resolveLearnerUser(userId);
    const sid = studentId ? resolveStudent(studentId) : undefined;
    const query = sid ? `?studentId=${sid}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/feedback/user/${uid}${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải danh sách phản hồi`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Gửi Phản hồi mới lên Admin Staff (POST /api/learning/feedback - mặc định request_type = 'feedback')
   */
  async createLearnerFeedback(payload: CreateLearnerFeedbackPayload): Promise<LearnerFeedbackItemApiDto> {
    const finalPayload: CreateLearnerFeedbackPayload = {
      ...payload,
      userId: resolveLearnerUser(payload.userId),
      studentId: payload.studentId ? resolveStudent(payload.studentId) : payload.studentId,
    };
    const response = await fetch(`${API_BASE_URL}/learning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(finalPayload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi gửi phản hồi mới`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Chỉnh sửa Phản hồi khi đơn còn ở trạng thái 'Chưa xem xét giải quyết' (PUT /api/learning/feedback/{requestId})
   */
  async updateLearnerFeedback(
    requestId: number,
    payload: UpdateLearnerFeedbackPayload
  ): Promise<LearnerFeedbackItemApiDto> {
    const response = await fetch(`${API_BASE_URL}/learning/feedback/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi cập nhật phản hồi`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Lấy danh sách Thông báo của Học sinh (GET /api/learning/student/{studentId}/notifications)
   */
  async getStudentNotifications(studentId: number): Promise<LearnerNotificationItemApiDto[]> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/notifications`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải thông báo học sinh`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Lấy danh sách Thông báo của Phụ huynh (GET /api/learning/parent/{parentId}/notifications)
   */
  async getParentNotifications(parentId: number, studentId?: number): Promise<LearnerNotificationItemApiDto[]> {
    const pid = resolveParent(parentId);
    const sid = studentId ? resolveStudent(studentId) : undefined;
    const query = sid ? `?studentId=${sid}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/parent/${pid}/notifications${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải thông báo phụ huynh`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Đánh dấu một thông báo là đã đọc (PUT /api/learning/student/notifications/{notificationId}/read)
   */
  async markNotificationRead(notificationId: number, userId?: number): Promise<boolean> {
    const uid = userId ? resolveLearnerUser(userId) : undefined;
    const query = uid ? `?userId=${uid}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/student/notifications/${notificationId}/read${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi đánh dấu đã đọc thông báo`);
    }
    return true;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc (PUT /api/learning/student/{userId}/notifications/read-all)
   */
  async markAllNotificationsRead(userId: number, studentId?: number): Promise<number> {
    const uid = resolveLearnerUser(userId);
    const sid = studentId ? resolveStudent(studentId) : undefined;
    const query = sid ? `?studentId=${sid}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/student/${uid}/notifications/read-all${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi đánh dấu đã đọc tất cả thông báo`);
    }
    const json = await response.json();
    return json?.updatedCount ?? 0;
  },

  /**
   * Lấy thông tin Hồ sơ cá nhân của Học sinh (GET /api/learning/student/{studentId}/profile)
   */
  async getStudentProfile(studentId: number): Promise<LearnerProfileApiDto | null> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải hồ sơ học sinh`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Cập nhật thông tin Hồ sơ cá nhân của Học sinh (PUT /api/learning/student/{studentId}/profile)
   */
  async updateStudentProfile(
    studentId: number,
    payload: UpdateLearnerProfilePayload
  ): Promise<LearnerProfileApiDto> {
    const sid = resolveStudent(studentId);
    const response = await fetch(`${API_BASE_URL}/learning/student/${sid}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi cập nhật hồ sơ học sinh`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Lấy thông tin Hồ sơ cá nhân của Phụ huynh (GET /api/learning/parent/{parentId}/profile)
   */
  async getParentProfile(parentId: number): Promise<LearnerProfileApiDto | null> {
    const pid = resolveParent(parentId);
    const response = await fetch(`${API_BASE_URL}/learning/parent/${pid}/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải hồ sơ phụ huynh`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Cập nhật thông tin Hồ sơ cá nhân của Phụ huynh (PUT /api/learning/parent/{parentId}/profile)
   */
  async updateParentProfile(
    parentId: number,
    payload: UpdateLearnerProfilePayload
  ): Promise<LearnerProfileApiDto> {
    const pid = resolveParent(parentId);
    const response = await fetch(`${API_BASE_URL}/learning/parent/${pid}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi cập nhật hồ sơ phụ huynh`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },
};

export default learningApi;
