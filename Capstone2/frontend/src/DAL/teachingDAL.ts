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
  TeachingClassAttendanceSheetDto,
  TeachingSessionItemDto,
  TeachingStudentAttendanceItemDto,
  TeachingAttendanceStatsDto,
  SaveBulkTeachingAttendancePayload,
  UpdateSingleAttendancePayload,
  CreateTeachingAssignmentRequest,
  UpdateTeachingAssignmentRequest,
  TeachingAssignmentItemDto,
  TeachingSubmissionItemDto,
  GradeTeachingSubmissionRequest,
  TeachingClassStudentItemDto,
  TeachingStudentProgressDetailDto,
  TeachingStudentEvaluationItemDto,
  CreateTeachingEvaluationPayload,
};
import { getSelectedUserId } from '../BLL/services/userSelection';
import { getAuthUser } from '../api/authApi';

export const DEFAULT_TEACHER_ID = 3;
export const DEFAULT_TA_ID = 5;

function resolveTeachingUserId(userId?: number): number {
  const authUser = getAuthUser();
  if (authUser && (authUser.primaryRole === 'teacher' || authUser.primaryRole === 'teaching_assistant')) {
    if (!userId || userId === DEFAULT_TEACHER_ID || userId === DEFAULT_TA_ID) {
      return authUser.userId;
    }
  }
  if (userId === DEFAULT_TA_ID) return getSelectedUserId('teaching_assistant');
  return userId || getSelectedUserId('teacher');
}

export interface TeachingDashboardViewModel extends TeachingDashboardDto {
  source: 'api' | 'mock';
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
    try {
      const data = await teachingApi.getDashboard(targetUserId);
      if (data) {
        return {
          ...data,
          source: 'api',
        };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API Dashboard (userId=${targetUserId}), chuyển sang dữ liệu mock:`, err?.message);
    }

    const isTa = targetUserId === 5;
    return {
      source: 'mock',
      profile: {
        userId: targetUserId,
        userCode: isTa ? 'TA001' : 'TC001',
        fullName: isTa ? '[MOCK] Âu Dương Tài' : '[MOCK] ThS. Hoàng Quốc Việt',
        email: isTa ? 'tai.auduong@edutrack.edu.vn' : 'viet.hoang@edutrack.edu.vn',
        phone: isTa ? '0912 345 678' : '0903 123 456',
        specialty: isTa ? '[MOCK] Trợ giảng Toán & Khoa học' : '[MOCK] Toán học & Luyện thi',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        roleTitle: isTa ? '[MOCK] Trợ giảng chuyên môn' : '[MOCK] Giáo viên chuyên môn',
        role: isTa ? 'teaching_assistant' : 'teacher',
      },
      kpis: {
        activeAssignments: isTa ? 10 : 8,
        assignmentsDueToday: isTa ? 4 : 3,
        activeClasses: 6,
        classesToday: isTa ? 3 : 2,
        totalStudents: isTa ? 50 : 45,
        pendingAttendance: isTa ? 2 : 1,
      },
      todayClasses: [
        {
          classId: 1,
          className: '[MOCK] Class 9 - Advanced Mathematics',
          timePeriod: '18:00 - 20:00',
          startTime: '18:00',
          endTime: '20:00',
          room: 'Room 201',
          subjectName: '[MOCK] Mathematics',
          studentsCount: 3,
          status: 'Upcoming',
          attendanceTaken: false,
        },
      ],
      notifications: [
        {
          notificationId: 1,
          title: '[MOCK] Họp hội đồng chuyên môn Tháng 11',
          description: '[MOCK] Kính mời quý thầy cô tham gia buổi họp đánh giá tiến độ giữa kỳ vào 15:00 Thứ Sáu tuần này.',
          sender: '[MOCK] Ban Giám Đốc EduTrack',
          initials: 'ET',
          initialsBgClass: 'bg-primary-subtle',
          initialsColorClass: 'text-primary',
          isNew: true,
          isRead: false,
          timeAgo: '2 giờ trước',
          createdAt: new Date().toISOString(),
        },
      ],
    };
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
    try {
      const data = await teachingApi.getMySchedule(targetUserId);
      if (Array.isArray(data)) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API my-schedule (userId=${targetUserId}), dùng fallback mock:`, err?.message);
    }

    const isTa = targetUserId === 5;
    const fallbackList: TeachingScheduleItemDto[] = [
      {
        scheduleId: 101,
        classId: 1,
        className: '[MOCK] Class 9 - Advanced Mathematics',
        subjectName: '[MOCK] Mathematics',
        room: 'Room 201',
        dayOfWeek: 'Monday',
        startTime: '18:00',
        endTime: '20:00',
        studentCount: 30,
        teacherName: '[MOCK] ThS. Hoàng Quốc Việt',
        taName: '[MOCK] Âu Dương Tài',
        partnerName: isTa ? '[MOCK] ThS. Hoàng Quốc Việt' : '[MOCK] Âu Dương Tài',
        status: 'active',
      },
    ];

    return { success: true, data: fallbackList, isLiveApi: false };
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
    try {
      const data = await teachingApi.getMyClasses(targetUserId);
      if (Array.isArray(data)) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API my-classes (userId=${targetUserId}), dùng fallback mock:`, err?.message);
    }

    const isTa = targetUserId === 5;
    const fallbackClasses: TeachingClassItemDto[] = [
      {
        classId: 1,
        className: '[MOCK] Class 9 - Advanced Mathematics',
        subjectId: 1,
        subjectName: '[MOCK] Mathematics',
        subjectCode: 'MATH9',
        room: 'Room 201',
        tuitionFee: 3500000,
        startDate: '2026-09-01',
        status: 'active',
        studentCount: 30,
        teacherName: '[MOCK] ThS. Hoàng Quốc Việt',
        taName: '[MOCK] Âu Dương Tài',
        partnerName: isTa ? '[MOCK] ThS. Hoàng Quốc Việt' : '[MOCK] Âu Dương Tài',
        scheduleSummary: '[MOCK] Thứ Hai, Thứ Tư (18:00 - 20:00)',
      },
    ];

    return { success: true, data: fallbackClasses, isLiveApi: false };
  },

  /**
   * Lấy danh sách học sinh theo lớp học (kết nối DB thật /api/teaching/classes/{classId}/students)
   */
  async getClassStudents(classId: number): Promise<TeachingClassStudentItemDto[]> {
    try {
      const list = await teachingApi.getClassStudents(classId);
      if (Array.isArray(list)) {
        return list;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được danh sách học sinh của lớp #${classId}:`, err?.message);
    }

    return [
      {
        studentId: 6,
        studentCode: 'STU001',
        fullName: '[MOCK] Lê Văn An',
        email: 'an.le@student.edutrack.edu.vn',
        phone: '0901 234 567',
        gender: 'Nam',
        dob: '15/08/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: '[MOCK] Lê Văn Hùng (Bố)',
        parentPhone: '0912 345 678',
        attendanceRate: 95,
        totalAttendedSessions: 19,
        totalSessions: 20,
      },
    ];
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
    try {
      const data = await teachingApi.createRequest({
        ...payload,
        requestedBy: targetUserId,
      });
      return { success: true, data, isLiveApi: true };
    } catch (err: any) {
      console.warn('🟡 [teachingDAL] Backend chưa phản hồi, dùng fallback local mock:', err?.message);
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const fallbackData: ApprovalRequestDto = {
        requestId: randomId,
        requestCode: `AR${String(randomId).padStart(4, '0')}`,
        requestType: payload.requestType || 'leave_request',
        title: `[MOCK] ${payload.title}`,
        description: payload.description,
        requestedBy: targetUserId,
        requesterName: '[MOCK] Giáo viên / Trợ giảng',
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

  /**
   * Lấy tiến độ học tập và điểm danh của toàn bộ học sinh trong lớp phụ trách
   */
  async getClassLearningProgress(classId: number, userId?: number): Promise<{
    success: boolean;
    data: TeachingClassProgressDto;
    isLiveApi: boolean;
  }> {
    const targetUserId = userId ? resolveTeachingUserId(userId) : undefined;
    try {
      const data = await teachingApi.getClassLearningProgress(classId, targetUserId);
      if (data && Array.isArray(data.students)) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API learning-progress (classId=${classId}), dùng fallback mock:`, err?.message);
    }

    const fallbackProgress: TeachingClassProgressDto = {
      classId: classId || 1,
      className: classId === 2 ? '[MOCK] Lớp 9B1 - Vật Lý Chuyên Sâu' : '[MOCK] Lớp 9A1 - Toán Nâng Cao',
      subjectName: classId === 2 ? '[MOCK] Vật lý' : '[MOCK] Toán học',
      teacherName: '[MOCK] ThS. Hoàng Quốc Việt',
      totalStudents: 1,
      totalSessions: 20,
      completedSessions: 12,
      latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
      students: [
        {
          studentId: 101,
          studentCode: 'STU001',
          fullName: '[MOCK] Lê Văn An',
          avatarInitials: 'LA',
          email: 'an.le@edutrack.edu.vn',
          phone: '0901234561',
          presentDays: 19,
          absentDays: 1,
          lateDays: 0,
          totalDays: 20,
          attendancePercentage: 95,
          attendanceStatus: 'Present',
          latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Submitted',
          latestAssignmentScore: 9.5,
          maxScore: 10,
          latestNote: '[MOCK] Học sinh tiếp thu tốt, làm bài tập đầy đủ.',
        },
      ],
    };

    return { success: true, data: fallbackProgress, isLiveApi: false };
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
    try {
      const data = await teachingApi.getRequests(targetUserId, status);
      if (Array.isArray(data)) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API requests (userId=${targetUserId}), dùng fallback mock:`, err?.message);
    }

    const isTa = targetUserId === 5;
    const fallbackRequests: ApprovalRequestDto[] = [
      {
        requestId: 101,
        requestCode: 'AR0101',
        requestType: 'leave_request',
        title: isTa ? '[MOCK] Đơn xin nghỉ phép trực buổi tối 25/08' : '[MOCK] Đơn xin nghỉ phép giảng dạy ngày 20/08',
        description: '[MOCK] Dữ liệu dự phòng khi mất kết nối API.',
        requestedBy: targetUserId,
        requesterName: isTa ? '[MOCK] Âu Dương Tài' : '[MOCK] ThS. Hoàng Quốc Việt',
        reviewedBy: 1,
        reviewerName: '[MOCK] Admin EduTrack',
        priority: 'medium',
        status: 'approved',
        statusLabel: 'Đã duyệt',
        canEdit: false,
        createdAt: '2026-08-16T15:45:00Z',
        reviewedAt: '2026-08-17T09:00:00Z',
        reviewNotes: '[MOCK] Đồng ý cho đổi lịch sang Chủ Nhật.',
      },
    ];

    let filtered = fallbackRequests;
    if (status && status !== 'all') {
      filtered = fallbackRequests.filter((r) => r.status.toLowerCase() === status.toLowerCase());
    }

    return { success: true, data: filtered, isLiveApi: false };
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
    try {
      const data = await teachingApi.getProfile(targetUserId);
      if (data && data.userId) {
        return data;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API Profile (userId=${targetUserId}), dùng fallback profile:`, err?.message);
    }

    const isTa = targetUserId === DEFAULT_TA_ID;
    return {
      userId: targetUserId,
      userCode: isTa ? 'TA001' : 'TC001',
      fullName: isTa ? '[MOCK] Âu Dương Tài' : '[MOCK] ThS. Hoàng Quốc Việt',
      email: isTa ? 'tai.auduong@edutrack.edu.vn' : 'viet.hoang@edutrack.edu.vn',
      phone: isTa ? '0912 345 678' : '0903 123 456',
      dateOfBirth: isTa ? '1998-05-15' : '1990-11-10',
      gender: 'Nam',
      enrolledSince: '15/08/2023',
      specialty: isTa ? '[MOCK] Trợ giảng Toán & Khoa học' : '[MOCK] Toán học & Luyện thi',
      avatarUrl: '/assets/img/profiles/avatar-27.jpg',
      address: '[MOCK] 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
      roleTitle: isTa ? '[MOCK] Trợ giảng chuyên môn' : '[MOCK] Giáo viên chuyên môn',
      role: isTa ? 'teaching_assistant' : 'teacher',
      activeClassesCount: isTa ? 3 : 2,
      totalStudentsCount: isTa ? 50 : 35,
    };
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
    try {
      const data = await teachingApi.updateProfile(targetUserId, payload);
      if (data && data.userId) {
        return data;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API updateProfile (userId=${targetUserId}):`, err?.message);
      throw err;
    }

    const current = await this.getProfile(targetUserId);
    return {
      ...current,
      ...payload,
      gender: payload.gender || current.gender,
      specialty: payload.specialty || current.specialty,
      address: payload.address || current.address,
    };
  },

  /**
   * Lấy bảng điểm danh của lớp cho một buổi học (kèm fallback nếu offline)
   */
  async getAttendanceSheet(classId: number, sessionId?: number, userId: number = 3): Promise<TeachingClassAttendanceSheetDto> {
    const targetUserId = resolveTeachingUserId(userId);
    try {
      const data = await teachingApi.getAttendanceSheet(classId, sessionId, targetUserId);
      if (data && data.classId) {
        return data;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được API điểm danh (classId=${classId}, sessionId=${sessionId}):`, err?.message);
    }

    // Fallback data
    const activeSession: TeachingSessionItemDto = {
      sessionId: sessionId || 1,
      classId,
      sessionDate: '2026-09-08',
      startTime: '18:00',
      endTime: '20:00',
      timePeriod: '18:00 - 20:00',
      room: 'Phòng 201',
      status: 'scheduled',
      title: '[MOCK] Buổi 1: 08/09/2026 (18:00 - 20:00) - Phòng 201',
      isRecorded: false,
      presentCount: 0,
      absentCount: 0,
      lateCount: 0,
      excusedCount: 0,
      totalRecorded: 0,
    };

    const fallbackStudents: TeachingStudentAttendanceItemDto[] = [
      {
        studentId: 6,
        studentCode: 'STU001',
        fullName: '[MOCK] Nguyễn Văn An',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        status: 'present',
        note: '',
        isRecorded: false,
      },
    ];

    return {
      classId,
      className: `[MOCK] Class #${classId} - Toán nâng cao`,
      subjectName: '[MOCK] Toán học',
      room: 'Phòng 201',
      currentSession: activeSession,
      availableSessions: [activeSession],
      students: fallbackStudents,
      stats: {
        totalStudents: 1,
        presentCount: 1,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        attendanceRate: 100,
      },
    };
  },

  /**
   * Lấy danh sách các buổi học của lớp
   */
  async getClassSessions(classId: number): Promise<TeachingSessionItemDto[]> {
    try {
      const data = await teachingApi.getClassSessions(classId);
      if (Array.isArray(data)) {
        return data;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được danh sách buổi học (classId=${classId}):`, err?.message);
    }

    return [
      {
        sessionId: 1,
        classId,
        sessionDate: '2026-09-08',
        startTime: '18:00',
        endTime: '20:00',
        timePeriod: '18:00 - 20:00',
        room: 'Phòng 201',
        status: 'completed',
        title: '[MOCK] Buổi 1: 08/09/2026 (18:00 - 20:00) - Phòng 201',
        isRecorded: true,
        presentCount: 2,
        absentCount: 0,
        lateCount: 1,
        excusedCount: 0,
        totalRecorded: 3,
      },
    ];
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
    try {
      const list = await teachingApi.getClassAssignments(classId);
      if (Array.isArray(list)) {
        return list;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không thể tải danh sách bài tập của lớp #${classId}:`, err?.message);
    }

    return [
      {
        assignmentId: 1,
        classId,
        className: `[MOCK] Class #${classId}`,
        title: '[MOCK] Homework 01: Quadratic Equations Problem Set',
        description: '[MOCK] Solve problems from page 45 to 48 in the textbook.',
        fileUrl: '/assets/docs/assignment_default.pdf',
        dueDate: '2026-09-15T23:59:00',
        dueDateFormatted: '15/09/2026 23:59',
        maxScore: 10.0,
        createdBy: 3,
        creatorName: '[MOCK] ThS. Hoàng Quốc Việt',
        assignmentType: 'Written Assignment',
        submissionCount: 3,
        gradedCount: 2,
        status: 'active',
        isAiGradingEnabled: true,
        createdAt: '08/09/2026',
      },
    ];
  },

  /**
   * Lấy chi tiết bài tập theo ID
   */
  async getAssignmentById(id: number): Promise<TeachingAssignmentItemDto | null> {
    try {
      const item = await teachingApi.getAssignmentById(id);
      if (item) return item;
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không thể tải chi tiết bài tập #${id}:`, err?.message);
    }
    return null;
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
    try {
      const list = await teachingApi.getAssignmentSubmissions(id);
      if (Array.isArray(list)) {
        return list;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được bài nộp của bài tập #${id}:`, err?.message);
    }

    return [
      {
        submissionId: 1,
        assignmentId: id,
        studentId: 6,
        studentName: '[MOCK] Lê Văn An',
        studentCode: 'STU001',
        fileUrl: '/uploads/submissions/an_le_hw01.pdf',
        submittedAt: '2026-08-10T15:45:00',
        submittedAtFormatted: '10/08/2026 15:45',
        score: 9.5,
        feedback: '[MOCK] Bài làm rất tốt, cách giải ngắn gọn và chuẩn xác.',
        aiScore: 9.2,
        status: 'graded',
        gradedBy: 3,
        graderName: '[MOCK] ThS. Hoàng Quốc Việt',
      },
    ];
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
    try {
      const res = await teachingApi.uploadFile(file);
      console.log('🟢 [teachingDAL] Tải file lên máy chủ thành công:', res);
      return res;
    } catch (err: any) {
      console.warn('🟡 [teachingDAL] Tải file thất bại, fallback sang mock file URL:', err?.message);
      const safeName = file.name.replace(/\s+/g, '_');
      return {
        success: true,
        message: '[MOCK] Mock upload URL',
        fileUrl: `/uploads/teaching/${safeName}`,
        fileName: `[MOCK] ${file.name}`,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      };
    }
  },
  /**
   * Lấy chi tiết toàn diện tiến độ của một học viên trong môn học
   */
  async getStudentProgressDetail(classId: number, studentId: number): Promise<{
    success: boolean;
    data: TeachingStudentProgressDetailDto;
    isLiveApi: boolean;
  }> {
    try {
      const data = await teachingApi.getStudentProgressDetail(classId, studentId);
      if (data) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được API progress-detail (classId=${classId}, studentId=${studentId}), dùng fallback mock:`, err?.message);
    }

    const fallbackDetail: TeachingStudentProgressDetailDto = {
      studentId,
      studentCode: `STU${String(studentId).padStart(3, '0')}`,
      fullName: studentId === 6 ? '[MOCK] Lê Văn An' : (studentId === 7 ? '[MOCK] Phạm Thị Bích' : `[MOCK] Học viên #${studentId}`),
      avatarInitials: studentId === 6 ? 'LA' : (studentId === 7 ? 'PB' : 'HV'),
      email: `student${studentId}@edutrack.edu.vn`,
      phone: '0901 234 567',
      presentDays: 19,
      absentDays: 1,
      totalDays: 20,
      attendancePercentage: 95,
      className: classId === 2 ? '[MOCK] Lớp 9B1 - Vật Lý Chuyên Sâu' : '[MOCK] Lớp 9A1 - Toán Nâng Cao',
      subjectName: classId === 2 ? '[MOCK] Vật lý' : '[MOCK] Toán học',
      avgScore: '9.2',
      assignments: [
        {
          assignmentId: 1,
          title: '[MOCK] Homework 01: Quadratic Equations Problem Set',
          weekTitle: '[MOCK] Tuần 1. Homework 01: Quadratic Equations Problem Set',
          dueDate: '14/09/2026 23:59',
          submittedAt: '13/09/2026 20:30',
          status: 'graded',
          score: 9.5,
          maxScore: 10,
          aiScore: 9.5,
          submissionFileUrl: 'https://storage.edutrack.edu.vn/submissions/hw01.pdf',
          teacherFeedback: '[MOCK] Bài làm rất xuất sắc.',
          aiFeedback: '[MOCK] Độ chính xác cao.',
        },
      ],
      evaluations: [
        {
          id: 1,
          evaluatorName: '[MOCK] ThS. Hoàng Quốc Việt',
          evaluatorRole: 'Giáo viên',
          evaluationType: 'attitude',
          typeLabel: 'Thái độ & Tinh thần học tập',
          rating: 'excellent',
          ratingLabel: 'Xuất sắc / Rất tích cực',
          content: '[MOCK] Dữ liệu dự phòng khi mất kết nối API.',
          suggestions: '[MOCK] Phát huy tinh thần tự học.',
          createdAt: '18/09/2026',
        },
      ],
    };

    return { success: true, data: fallbackDetail, isLiveApi: false };
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
      evaluatorName: payload.evaluatorName || authUser?.fullName,
    };
    try {
      const data = await teachingApi.createStudentEvaluation(classId, studentId, resolvedPayload);
      if (data) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không lưu được đánh giá qua API, dùng fallback local:`, err?.message);
    }

    const fallbackItem: TeachingStudentEvaluationItemDto = {
      id: Date.now(),
      evaluatorName: `[MOCK] ${payload.evaluatorName || 'ThS. Hoàng Quốc Việt'}`,
      evaluatorRole: payload.evaluatorRole || 'Giáo viên',
      evaluationType: payload.evaluationType,
      typeLabel: payload.typeLabel || 'Thái độ & Tinh thần học tập',
      rating: payload.rating,
      ratingLabel: payload.ratingLabel || 'Tốt / Đạt yêu cầu',
      content: `[MOCK] ${payload.content}`,
      suggestions: payload.suggestions,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    return { success: true, data: fallbackItem, isLiveApi: false };
  },
};

export default teachingDAL;
