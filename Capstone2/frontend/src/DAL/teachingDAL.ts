import type {
  TeachingStudentProgressDetailDto,
  TeachingStudentEvaluationItemDto,
  CreateTeachingEvaluationPayload,
} from '../BLL/models/teaching/TeachingStudentProgressDetailDto';
import {
  teachingApi,
  type CreateTeachingRequestPayload,
  type UpdateTeachingRequestPayload,
  type TeacherProfileDto,
  type UpdateTeacherProfilePayload,
  type TeachingClassAttendanceSheetDto,
  type TeachingSessionItemDto,
  type TeachingStudentAttendanceItemDto,
  type TeachingAttendanceStatsDto,
  type SaveBulkTeachingAttendancePayload,
  type UpdateSingleAttendancePayload,
  type CreateTeachingAssignmentRequest,
  type UpdateTeachingAssignmentRequest,
  type UpdateAssignmentRubricRequest,
  type AiGradeSubmissionResponse,
  type TeachingAssignmentItemDto,
  type TeachingSubmissionItemDto,
  type GradeTeachingSubmissionRequest,
} from '../api/teachingApi';
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import type { TeachingDashboardDto } from '../BLL/models/teaching/TeachingDashboardDto';
import type { TeachingScheduleItemDto } from '../BLL/models/teaching/TeachingScheduleDto';
import type { TeachingClassItemDto, TeachingClassStudentItemDto } from '../BLL/models/teaching/TeachingClassItemDto';
import type { TeachingClassProgressDto, TeachingStudentProgressItemDto } from '../BLL/models/teaching/TeachingLearningProgressDto';
import type { TeachingNotificationDto } from '../BLL/models/teaching/TeachingNotificationDto';

export type {
  TeacherProfileDto,
  UpdateTeacherProfilePayload,
  TeachingClassItemDto,
  TeachingClassAttendanceSheetDto,
  TeachingSessionItemDto,
  TeachingStudentAttendanceItemDto,
  TeachingAttendanceStatsDto,
  SaveBulkTeachingAttendancePayload,
  UpdateSingleAttendancePayload,
  CreateTeachingAssignmentRequest,
  UpdateTeachingAssignmentRequest,
  UpdateAssignmentRubricRequest,
  AiGradeSubmissionResponse,
  TeachingAssignmentItemDto,
  TeachingSubmissionItemDto,
  GradeTeachingSubmissionRequest,
  TeachingClassStudentItemDto,
  TeachingStudentProgressDetailDto,
  TeachingStudentEvaluationItemDto,
  CreateTeachingEvaluationPayload,
};
import { confirmedUpload } from '../api/realData';
import { getAuthUser } from '../api/authApi';

export const DEFAULT_TEACHER_ID = 3;
export const DEFAULT_TA_ID = 5;

function resolveTeachingUserId(_userId?: number): number {
  const auth = getAuthUser();
  if (!auth?.userId) throw new Error('Please sign in to view teaching data.');
  return auth.userId;
}

export interface TeachingDashboardViewModel extends TeachingDashboardDto {
  source: 'api';
}

/**
 * [Bounded Context: Teaching]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 2 (Teacher & Teaching Assistant)
 */
export const teachingDAL = {
  /**
   * Lấy dữ liệu Bảng điều khiển (Dashboard) cho Giáo viên hoặc Trợ giảng chỉ dựa trên userId
   */
  async getDashboard(userId: number): Promise<TeachingDashboardViewModel> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getDashboard(targetUserId);
    if (data && data.profile?.userId === targetUserId) {
      return {
        ...data,
        source: 'api',
      };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy thời khóa biểu cá nhân của Giáo viên hoặc Trợ giảng
   */
  async getMySchedule(userId: number): Promise<{
    success: boolean;
    data: TeachingScheduleItemDto[];
    isLiveApi: boolean;
  }> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getMySchedule(targetUserId);
    if (Array.isArray(data)) {
      return { success: true, data, isLiveApi: true };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy danh sách các lớp học phụ trách của Giáo viên hoặc Trợ giảng
   */
  async getMyClasses(userId: number): Promise<{
    success: boolean;
    data: TeachingClassItemDto[];
    isLiveApi: boolean;
  }> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getMyClasses(targetUserId);
    if (Array.isArray(data)) {
      return { success: true, data, isLiveApi: true };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy thông tin chi tiết lớp học mà Giáo viên / Trợ giảng phụ trách
   */
  async getClassById(classId: number, userId?: number): Promise<TeachingClassItemDto | null> {
    const listRes = await this.getMyClasses(userId ?? 0);
    return listRes.data.find((c) => c.classId === classId) || null;
  },

  /**
   * Lấy danh sách học sinh theo lớp học (kết nối DB thật /api/teaching/classes/{classId}/students)
   */
  async getClassStudents(classId: number): Promise<TeachingClassStudentItemDto[]> {
    const list = await teachingApi.getClassStudents(classId);
    if (Array.isArray(list)) {
      return list;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Gửi đơn yêu cầu mới từ Giáo viên / Trợ giảng
   */
  async createRequest(payload: CreateTeachingRequestPayload): Promise<{
    success: boolean;
    data: ApprovalRequestDto;
    isLiveApi: boolean;
  }> {
    const targetUserId = resolveTeachingUserId(payload.requestedBy);
    const data = await teachingApi.createRequest({
      ...payload,
      requestedBy: targetUserId,
    });
    return { success: true, data, isLiveApi: true };
  },

  /**
   * Lấy tiến độ học tập và điểm danh của toàn bộ học sinh trong lớp phụ trách
   */
  async getClassLearningProgress(classId: number, userId?: number): Promise<{
    success: boolean;
    data: TeachingClassProgressDto;
    isLiveApi: boolean;
  }> {
    const targetUserId = userId ? resolveTeachingUserId(userId) : undefined;
    const data = await teachingApi.getClassLearningProgress(classId, targetUserId);
    if (data && Array.isArray(data.students)) {
      return { success: true, data, isLiveApi: true };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },


  /**
   * Lấy danh sách thông báo dành cho Giáo viên hoặc Trợ giảng
   */
  async getNotifications(userId: number, status?: string): Promise<{
    success: boolean;
    data: TeachingNotificationDto[];
    isLiveApi: boolean;
  }> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getNotifications(targetUserId, status);
    if (!Array.isArray(data)) throw new Error('Invalid notification response.');
    return { success: true, data, isLiveApi: true };
  },
  async markNotificationAsRead(notificationId: number, userId?: number): Promise<boolean> {
    return teachingApi.markNotificationAsRead(notificationId, userId ? resolveTeachingUserId(userId) : undefined);
  },
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    return teachingApi.markAllNotificationsAsRead(resolveTeachingUserId(userId));
  },

  /**
   * Lấy danh sách đơn từ và yêu cầu của Giáo viên hoặc Trợ giảng
   */
  async getRequests(userId: number, status?: string): Promise<{
    success: boolean;
    data: ApprovalRequestDto[];
    isLiveApi: boolean;
  }> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getRequests(targetUserId, status);
    if (Array.isArray(data)) {
      return { success: true, data, isLiveApi: true };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Cập nhật đơn từ/yêu cầu (chỉ khi đơn chưa được xem xét giải quyết)
   */
  async updateRequest(
    requestId: number,
    payload: UpdateTeachingRequestPayload
  ): Promise<{ success: boolean; data: ApprovalRequestDto }> {
    const data = await teachingApi.updateRequest(requestId, payload);
    return { success: true, data };
  },

  /**
   * Lấy thông tin hồ sơ chi tiết của GV / TA theo userId
   */
  async getProfile(userId: number): Promise<TeacherProfileDto> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getProfile(targetUserId);
    if (data && data.userId === targetUserId) {
      return data;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Cập nhật thông tin hồ sơ GV / TA
   */
  async changePassword(userId: number, payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const targetUserId = resolveTeachingUserId(userId);
    try {
      return await teachingApi.changePassword(targetUserId, payload);
    } catch (err: any) {
      console.warn(`[teachingDAL] Loi goi API changePassword (userId=${targetUserId}):`, err?.message);
      throw err;
    }
  },

  async updateProfile(userId: number, payload: UpdateTeacherProfilePayload): Promise<TeacherProfileDto> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.updateProfile(targetUserId, payload);
    if (data && data.userId === targetUserId) {
      return data;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy bảng điểm danh của lớp cho một buổi học
   */
  async getAttendanceSheet(classId: number, sessionId?: number, userId: number = 3): Promise<TeachingClassAttendanceSheetDto> {
    const targetUserId = resolveTeachingUserId(userId);
    const data = await teachingApi.getAttendanceSheet(classId, sessionId, targetUserId);
    if (data && data.classId) {
      return data;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy danh sách các buổi học của lớp
   */
  async getClassSessions(classId: number): Promise<TeachingSessionItemDto[]> {
    const data = await teachingApi.getClassSessions(classId);
    if (Array.isArray(data)) {
      return data;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lưu điểm danh đồng loạt cả lớp vào DB
   */
  async saveBulkAttendance(payload: SaveBulkTeachingAttendancePayload): Promise<TeachingClassAttendanceSheetDto> {
    return await teachingApi.saveBulkAttendance({
      ...payload,
      recordedBy: resolveTeachingUserId(payload.recordedBy),
    });
  },

  /**
   * Cập nhật điểm danh đơn lẻ
   */
  async updateSingleAttendance(attendanceId: number, payload: UpdateSingleAttendancePayload): Promise<TeachingStudentAttendanceItemDto> {
    return await teachingApi.updateSingleAttendance(attendanceId, {
      ...payload,
      recordedBy: resolveTeachingUserId(payload.recordedBy),
    });
  },

  /**
   * Tạo bài tập mới cho lớp học (Lưu DB thật qua /api/teaching/assignments)
   */
  async createAssignment(payload: CreateTeachingAssignmentRequest): Promise<TeachingAssignmentItemDto> {
    try {
      const res = await teachingApi.createAssignment({
        ...payload,
        createdBy: resolveTeachingUserId(payload.createdBy),
      });
      console.log('🟢 [teachingDAL] Đã tạo thành công bài tập mới:', res);
      return res;
    } catch (err: any) {
      console.warn('🟡 [teachingDAL] Lỗi khi tạo bài tập qua API:', err?.message);
      throw err;
    }
  },

  /**
   * Lấy danh sách bài tập của một lớp (kết nối DB thật /api/teaching/assignments?classId=...)
   */
  async getClassAssignments(classId: number): Promise<TeachingAssignmentItemDto[]> {
    const list = await teachingApi.getClassAssignments(classId);
    if (Array.isArray(list)) {
      return list;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy chi tiết bài tập theo ID
   */
  async getAssignmentById(id: number): Promise<TeachingAssignmentItemDto | null> {
    const item = await teachingApi.getAssignmentById(id);
    if (item) return item;
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Cập nhật thông tin bài tập (Lưu DB thật qua PUT /api/teaching/assignments/{id})
   */
  async updateAssignment(id: number, payload: UpdateTeachingAssignmentRequest): Promise<TeachingAssignmentItemDto> {
    try {
      const res = await teachingApi.updateAssignment(id, payload);
      console.log(`🟢 [teachingDAL] Đã cập nhật thành công bài tập #${id}:`, res);
      return res;
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Lỗi khi cập nhật bài tập #${id}:`, err?.message);
      throw err;
    }
  },

  /**
   * Xóa một bài tập (Xóa DB thật qua DELETE /api/teaching/assignments/{id})
   */
  async deleteAssignment(id: number): Promise<boolean> {
    try {
      const res = await teachingApi.deleteAssignment(id);
      console.log(`🟢 [teachingDAL] Đã xóa thành công bài tập #${id}`);
      return res;
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Lỗi khi xóa bài tập #${id}:`, err?.message);
      throw err;
    }
  },

  /**
   * Lấy danh sách bài nộp của học sinh (GET /api/teaching/assignments/{id}/submissions)
   */
  async getAssignmentSubmissions(id: number): Promise<TeachingSubmissionItemDto[]> {
    const list = await teachingApi.getAssignmentSubmissions(id);
    if (list && Array.isArray(list)) {
      return list;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Chấm điểm và gửi nhận xét cho học sinh (PUT /api/teaching/assignments/{id}/submissions/{subId}/grade)
   */
  async gradeSubmission(
    id: number,
    submissionId: number,
    payload: GradeTeachingSubmissionRequest
  ): Promise<TeachingSubmissionItemDto> {
    try {
      const res = await teachingApi.gradeSubmission(id, submissionId, {
        ...payload,
        gradedBy: resolveTeachingUserId(payload.gradedBy),
      });
      console.log(`🟢 [teachingDAL] Chấm điểm thành công bài nộp #${submissionId}:`, res);
      return res;
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Lỗi khi chấm điểm bài nộp #${submissionId}:`, err?.message);
      throw err;
    }
  },

  /**
   * Đính kèm hoặc cập nhật file Rubric / Đáp án (PDF / Word) cho bài tập (Chỉ dành cho Teacher)
   */
  async updateAssignmentRubric(
    id: number,
    payload: UpdateAssignmentRubricRequest
  ): Promise<TeachingAssignmentItemDto> {
    return await teachingApi.updateAssignmentRubric(id, {
      ...payload,
      requestedBy: resolveTeachingUserId(payload.requestedBy),
    });
  },

  /**
   * Nhờ AI phân tích bài nộp của học sinh dựa trên file Rubric (Human-in-the-loop, chỉ dành cho Teacher)
   */
  async aiGradeSubmission(
    assignmentId: number,
    submissionId: number,
    requestedBy?: number
  ): Promise<AiGradeSubmissionResponse> {
    return await teachingApi.aiGradeSubmission(
      assignmentId,
      submissionId,
      resolveTeachingUserId(requestedBy)
    );
  },

  /**
   * Tải tệp tin bài tập hoặc tài liệu học liệu lên máy chủ (POST /api/teaching/upload)
   */
  async uploadFile(file: File): Promise<{
    success: boolean;
    message: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }> {
    return confirmedUpload(await teachingApi.uploadFile(file));
  },
  /**
   * Lấy chi tiết toàn diện tiến độ của một học viên trong môn học
   */
  async getStudentProgressDetail(classId: number, studentId: number): Promise<{
    success: boolean;
    data: TeachingStudentProgressDetailDto;
    isLiveApi: boolean;
  }> {
    const data = await teachingApi.getStudentProgressDetail(classId, studentId);
    if (data) {
      return { success: true, data, isLiveApi: true };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Tạo đánh giá cá nhân mới cho học sinh
   */
  async createStudentEvaluation(
    classId: number,
    studentId: number,
    payload: CreateTeachingEvaluationPayload
  ): Promise<{
    success: boolean;
    data: TeachingStudentEvaluationItemDto;
    isLiveApi: boolean;
  }> {
    const authUser = getAuthUser();
    const resolvedPayload: CreateTeachingEvaluationPayload = {
      ...payload,
      evaluatorName: authUser?.fullName,
      evaluatorRole: authUser?.primaryRole === 'teaching_assistant' ? 'Teaching Assistant' : 'Teacher',
    };
    const data = await teachingApi.createStudentEvaluation(classId, studentId, resolvedPayload);
    if (data) {
      return { success: true, data, isLiveApi: true };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },
};

/**
 * Kiểm tra xem một buổi học đã bắt đầu hay chưa (dựa theo ngày và giờ bắt đầu)
 */
export function isSessionStarted(session?: {
  sessionDate?: string;
  startTime?: string;
  status?: string;
  isRecorded?: boolean;
  hasStarted?: boolean;
}): boolean {
  if (!session) return false;
  if (typeof session.hasStarted === 'boolean') {
    return session.hasStarted;
  }
  if (session.isRecorded || session.status === 'completed' || session.status === 'in_progress') {
    return true;
  }
  if (!session.sessionDate) {
    return true;
  }

  try {
    let dateStr = session.sessionDate.trim();
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    const startTimeStr = session.startTime?.trim() || '00:00';
    const [h, m] = startTimeStr.split(':').map(Number);
    const sessionDateTime = new Date(`${dateStr}T${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`);

    if (isNaN(sessionDateTime.getTime())) {
      return true;
    }

    return new Date() >= sessionDateTime;
  } catch {
    return true;
  }
}

/**
 * Kiểm tra xem buổi học đã quá 2 giờ sau giờ kết thúc hay chưa (không cho điểm danh nữa)
 */
export function isAttendanceExpired(session?: {
  sessionDate?: string;
  endTime?: string;
  hasStarted?: boolean;
  canTakeAttendance?: boolean;
}): boolean {
  if (!session) return false;
  if (session.hasStarted === true && session.canTakeAttendance === false) {
    return true;
  }
  if (!session.sessionDate || !session.endTime) {
    return false;
  }

  try {
    let dateStr = session.sessionDate.trim();
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    const [h, m] = session.endTime.trim().split(':').map(Number);
    const endDateTime = new Date(`${dateStr}T${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`);
    if (isNaN(endDateTime.getTime())) {
      return false;
    }
    const deadline = new Date(endDateTime.getTime() + 2 * 60 * 60 * 1000);
    return new Date() > deadline;
  } catch {
    return false;
  }
}

export default teachingDAL;
