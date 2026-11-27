import { realList, realRecord } from './realData';
import { getAuthHeaders, getAuthUser } from './authApi';
import type {
  TeachingStudentProgressDetailDto,
  TeachingStudentEvaluationItemDto,
  CreateTeachingEvaluationPayload,
} from '../BLL/models/teaching/TeachingStudentProgressDetailDto';
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import type { TeachingDashboardDto } from '../BLL/models/teaching/TeachingDashboardDto';
import type { TeachingScheduleItemDto } from '../BLL/models/teaching/TeachingScheduleDto';
import type { TeachingClassItemDto, TeachingClassStudentItemDto } from '../BLL/models/teaching/TeachingClassItemDto';
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
  UpdateTeachingAssignmentRequest,
  UpdateAssignmentRubricRequest,
  AiGradeSubmissionResponse,
  TeachingAssignmentItemDto,
  TeachingSubmissionItemDto,
  GradeTeachingSubmissionRequest,
} from '../BLL/models/teaching/TeachingAssignmentDto';

export * from '../BLL/models/teaching';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function resolveTeachingUser(userId: number): number {
  const authUser = getAuthUser();
  if (!authUser || authUser.userId <= 0) return userId;
  if (
    userId === 3 &&
    (authUser.primaryRole === 'teacher' || authUser.roles?.includes('teacher'))
  ) {
    return authUser.userId;
  }
  if (
    userId === 5 &&
    (authUser.primaryRole === 'teaching_assistant' ||
      authUser.roles?.includes('teaching_assistant') ||
      authUser.roles?.includes('ta'))
  ) {
    return authUser.userId;
  }
  return userId;
}

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
    const uid = resolveTeachingUser(userId);
    const response = await fetch(`${API_BASE_URL}/teaching/dashboard?userId=${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading Teaching Dashboard`);
    }

    const json = await response.json();
    return realRecord(json, ["profile","kpis","todayClasses"]);
  },

  /**
   * GET /api/teaching/classes/my-schedule?userId={userId}
   * Lấy thời khóa biểu giảng dạy hoặc lịch trực cá nhân của GV/TA
   */
  async getMySchedule(userId: number): Promise<TeachingScheduleItemDto[]> {
    const uid = resolveTeachingUser(userId);
    const response = await fetch(`${API_BASE_URL}/teaching/classes/my-schedule?userId=${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading personal schedule`);
    }

    const json = await response.json();
    return realList(json);
  },

  /**
   * GET /api/teaching/classes/my-classes?userId={userId}
   * Lấy danh sách lớp học do Giáo viên hoặc Trợ giảng đang phụ trách
   */
  async getMyClasses(userId: number): Promise<TeachingClassItemDto[]> {
    const uid = resolveTeachingUser(userId);
    const response = await fetch(`${API_BASE_URL}/teaching/classes/my-classes?userId=${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading assigned class list`);
    }

    const json = await response.json();
    return realList(json);
  },

  /**
   * GET /api/teaching/classes/{classId}/students
   * Lấy danh sách học sinh theo lớp học dành cho Giáo viên & Trợ giảng
   */
  async getClassStudents(classId: number): Promise<TeachingClassStudentItemDto[]> {
    const response = await fetch(`${API_BASE_URL}/teaching/classes/${classId}/students`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading student list for class #${classId}`);
    }

    const json = await response.json();
    return realList(json);
  },

  /**
   * GET /api/teaching/classes/{classId}/learning-progress?userId={userId}
   * Lấy báo cáo tiến độ học tập và tình hình làm bài của tất cả học viên trong một lớp
   */
  async getClassLearningProgress(classId: number, userId?: number): Promise<TeachingClassProgressDto | null> {
    const uid = userId ? resolveTeachingUser(userId) : undefined;
    const url = uid
      ? `${API_BASE_URL}/teaching/classes/${classId}/learning-progress?userId=${uid}`
      : `${API_BASE_URL}/teaching/classes/${classId}/learning-progress`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading learning progress for class ${classId}`);
    }

    const json = await response.json();
    return realRecord(json, ["classId","students"]);
  },

  /**
   * GET /api/teaching/notifications?userId={userId}&status={status}
   * Lấy danh sách thông báo dành cho Giáo viên hoặc Trợ giảng
   */
  async getNotifications(userId: number, status?: string): Promise<TeachingNotificationDto[]> {
    const uid = resolveTeachingUser(userId);
    const params = new URLSearchParams({ userId: String(uid) });
    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/teaching/notifications?${params.toString()}`, {
      method: 'GET',
      credentials: 'omit',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading notifications list`);
    }

    const json = await response.json();
    if (!Array.isArray(json?.data)) throw new Error('Invalid notification response.');
    return json.data;
  },

  /**
   * PUT /api/teaching/notifications/{notificationId}/read
   * Đánh dấu một thông báo là đã đọc
   */
  async markNotificationAsRead(notificationId: number, userId?: number): Promise<boolean> {
    const uid = userId ? resolveTeachingUser(userId) : undefined;
    const query = uid ? `?userId=${uid}` : '';
    const response = await fetch(`${API_BASE_URL}/teaching/notifications/${notificationId}/read${query}`, {
      method: 'PUT',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while marking notification #${notificationId} as read`);
    }

    const json = await response.json();
    if (json?.success !== true) throw new Error('Mark read was not confirmed.');
    return true;
  },

  /**
   * PUT /api/teaching/notifications/read-all?userId={userId}
   * Đánh dấu toàn bộ thông báo của user là đã đọc
   */
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    const uid = resolveTeachingUser(userId);
    const response = await fetch(`${API_BASE_URL}/teaching/notifications/read-all?userId=${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while marking all notifications as read`);
    }

    const json = await response.json();
    if (json?.success !== true || !Number.isSafeInteger(json.updatedCount)) throw new Error('Mark all read was not confirmed.');
    return json.updatedCount;
  },

  /**
   * GET /api/teaching/requests?userId={userId}&status={status}
   * Lấy danh sách đơn từ và yêu cầu đã gửi của Giáo viên hoặc Trợ giảng
   */
  async getRequests(userId: number, status?: string): Promise<ApprovalRequestDto[]> {
    const uid = resolveTeachingUser(userId);
    const params = new URLSearchParams({ userId: String(uid) });
    if (status && status !== 'all') {
      params.append('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/teaching/requests?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while loading requests list`);
    }

    const json = await response.json();
    return realList(json);
  },

  /**
   * POST /api/teaching/requests
   * Tạo đơn yêu cầu/kiến nghị từ phía Giáo viên hoặc Trợ giảng
   */
  async createRequest(payload: CreateTeachingRequestPayload): Promise<ApprovalRequestDto> {
    const uid = resolveTeachingUser(payload.requestedBy || 3);
    const res = await fetch(`${API_BASE_URL}/teaching/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        title: payload.title,
        description: payload.description,
        requestType: payload.requestType || 'leave_request',
        priority: payload.priority || 'medium',
        requestedBy: uid,
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
    return realRecord(json, ["requestId"]);
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
        ...getAuthHeaders(),
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
    return realRecord(json, ["requestId"]);
  },

  /**
   * GET /api/teaching/profile/{userId}
   * Lấy thông tin hồ sơ cá nhân của Giáo viên hoặc Trợ giảng
   */
  async getProfile(userId: number): Promise<TeacherProfileDto> {
    const uid = resolveTeachingUser(userId);
    const res = await fetch(`${API_BASE_URL}/teaching/profile/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading user profile #${uid}`);
    }

    const json = await res.json();
    return realRecord(json, ["userId"]);
  },

  /**
   * PUT /api/teaching/profile?userId={userId}
   * Cập nhật thông tin hồ sơ cá nhân GV/TA
   */
  async changePassword(userId: number, payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const uid = resolveTeachingUser(userId);
    const res = await fetch(`${API_BASE_URL}/teaching/profile/${uid}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while changing password`);
    }

    return await res.json();
  },

  async updateProfile(userId: number, payload: UpdateTeacherProfilePayload): Promise<TeacherProfileDto> {
    const uid = resolveTeachingUser(userId);
    const res = await fetch(`${API_BASE_URL}/teaching/profile/${uid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while updating profile`);
    }

    const json = await res.json();
    return realRecord(json, ["userId"]);
  },

  /**
   * GET /api/teaching/attendance/sheet?classId={classId}&sessionId={sessionId}&userId={userId}
   * Lấy bảng điểm danh của lớp theo buổi học
   */
  async getAttendanceSheet(classId: number, sessionId?: number, userId: number = 3): Promise<TeachingClassAttendanceSheetDto> {
    const uid = resolveTeachingUser(userId);
    let url = `${API_BASE_URL}/teaching/attendance/sheet?classId=${classId}&userId=${uid}`;
    if (sessionId) {
      url += `&sessionId=${sessionId}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading attendance sheet for class #${classId}`);
    }

    const json = await res.json();
    return realRecord(json, ["classId","students","availableSessions","stats"]);
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
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading session list for class #${classId}`);
    }

    const json = await res.json();
    return realList(json);
  },

  /**
   * POST /api/teaching/attendance/bulk
   * Lưu điểm danh đồng loạt cả lớp cho một buổi học
   */
  async saveBulkAttendance(payload: SaveBulkTeachingAttendancePayload): Promise<TeachingClassAttendanceSheetDto> {
    const finalPayload: SaveBulkTeachingAttendancePayload = {
      ...payload,
      recordedBy: payload.recordedBy ? resolveTeachingUser(payload.recordedBy) : payload.recordedBy,
    };
    const res = await fetch(`${API_BASE_URL}/teaching/attendance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(finalPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while saving attendance`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * PUT /api/teaching/attendance/{id}
   * Cập nhật điểm danh đơn lẻ 1 học sinh
   */
  async updateSingleAttendance(attendanceId: number, payload: UpdateSingleAttendancePayload): Promise<TeachingStudentAttendanceItemDto> {
    const finalPayload: UpdateSingleAttendancePayload = {
      ...payload,
      recordedBy: payload.recordedBy ? resolveTeachingUser(payload.recordedBy) : payload.recordedBy,
    };
    const res = await fetch(`${API_BASE_URL}/teaching/attendance/${attendanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(finalPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while updating attendance #${attendanceId}`);
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * POST /api/teaching/assignments
   * Tạo bài tập mới cho lớp học
   */
  async createAssignment(payload: CreateTeachingAssignmentRequest): Promise<TeachingAssignmentItemDto> {
    const finalPayload: CreateTeachingAssignmentRequest = {
      ...payload,
      createdBy: payload.createdBy ? resolveTeachingUser(payload.createdBy) : payload.createdBy,
    };
    const res = await fetch(`${API_BASE_URL}/teaching/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(finalPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while creating new assignment`);
    }

    const json = await res.json();
    return realRecord(json, ["assignmentId"]);
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
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading assignments list for class #${classId}`);
    }

    const json = await res.json();
    return realList(json);
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
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading assignment details #${id}`);
    }

    const json = await res.json();
    return realRecord(json, ["assignmentId"]);
  },

  /**
   * PUT /api/teaching/assignments/{id}
   * Cập nhật thông tin bài tập
   */
  async updateAssignment(id: number, payload: UpdateTeachingAssignmentRequest): Promise<TeachingAssignmentItemDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while updating assignment #${id}`);
    }

    const json = await res.json();
    return realRecord(json, ["assignmentId"]);
  },

  /**
   * DELETE /api/teaching/assignments/{id}
   * Xóa một bài tập
   */
  async deleteAssignment(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while deleting assignment #${id}`);
    }

    const confirmation = await res.json();
    if (confirmation?.success !== true) throw new Error("Deletion was not confirmed.");
    return true;
  },

  /**
   * GET /api/teaching/assignments/{id}/submissions
   * Lấy danh sách bài nộp của học sinh
   */
  async getAssignmentSubmissions(id: number): Promise<TeachingSubmissionItemDto[]> {
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}/submissions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading submissions for assignment #${id}`);
    }

    const json = await res.json();
    return realList(json);
  },

  /**
   * PUT /api/teaching/assignments/{id}/submissions/{submissionId}/grade
   * Chấm điểm và gửi nhận xét cho học sinh
   */
  async gradeSubmission(
    id: number,
    submissionId: number,
    payload: GradeTeachingSubmissionRequest
  ): Promise<TeachingSubmissionItemDto> {
    const finalPayload: GradeTeachingSubmissionRequest = {
      ...payload,
      gradedBy: payload.gradedBy ? resolveTeachingUser(payload.gradedBy) : payload.gradedBy,
    };
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}/submissions/${submissionId}/grade`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(finalPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while grading submission #${submissionId}`);
    }

    const json = await res.json();
    return realRecord(json, ["submissionId"]);
  },

  /**
   * PUT /api/teaching/assignments/{id}/rubric
   * Đính kèm hoặc cập nhật file Rubric / Đáp án (PDF / Word) cho bài tập (Chỉ dành cho Teacher)
   */
  async updateAssignmentRubric(
    id: number,
    payload: UpdateAssignmentRubricRequest
  ): Promise<TeachingAssignmentItemDto> {
    const finalPayload: UpdateAssignmentRubricRequest = {
      ...payload,
      requestedBy: payload.requestedBy ? resolveTeachingUser(payload.requestedBy) : resolveTeachingUser(3),
    };
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}/rubric`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(finalPayload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while updating rubric for assignment #${id}`);
    }

    const json = await res.json();
    return realRecord(json, ["assignmentId"]);
  },

  /**
   * POST /api/teaching/assignments/{id}/submissions/{submissionId}/ai-grade
   * Nhờ AI hỗ trợ chấm điểm và nhận xét bài nộp dựa trên Rubric (Human-in-the-loop, chỉ dành cho Teacher)
   */
  async aiGradeSubmission(
    id: number,
    submissionId: number,
    requestedBy: number = 3
  ): Promise<AiGradeSubmissionResponse> {
    const uid = resolveTeachingUser(requestedBy);
    const res = await fetch(`${API_BASE_URL}/teaching/assignments/${id}/submissions/${submissionId}/ai-grade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ requestedBy: uid }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        err.message ||
          'Dịch vụ AI tạm thời không khả dụng hoặc đã hết hạn mức. Vui lòng thử lại sau hoặc chấm điểm thủ công.'
      );
    }

    const json = await res.json();
    return json?.data ?? json;
  },

  /**
   * POST /api/teaching/upload
   * Tải tệp tin tài liệu bài tập hoặc học liệu lên máy chủ
   */
  async uploadFile(file: File): Promise<{
    success: boolean;
    message: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/teaching/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while uploading file to server`);
    }

    return await res.json();
  },
  /**
   * GET /api/teaching/classes/{classId}/students/{studentId}/progress-detail
   * Lấy chi tiết toàn diện tiến độ của một học sinh trong môn học
   */
  async getStudentProgressDetail(classId: number, studentId: number): Promise<TeachingStudentProgressDetailDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/classes/${classId}/students/${studentId}/progress-detail`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} while loading student progress details #${studentId}`);
    }

    const json = await res.json();
    return realRecord(json, ["studentId","assignments","evaluations"]);
  },

  /**
   * POST /api/teaching/classes/{classId}/students/{studentId}/evaluations
   * Tạo đánh giá cá nhân mới cho học sinh
   */
  async createStudentEvaluation(
    classId: number,
    studentId: number,
    payload: CreateTeachingEvaluationPayload
  ): Promise<TeachingStudentEvaluationItemDto> {
    const res = await fetch(`${API_BASE_URL}/teaching/classes/${classId}/students/${studentId}/evaluations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status} while saving evaluation`);
    }

    const json = await res.json();
    return realRecord(json, ["id"]);
  },
};

export default teachingApi;
