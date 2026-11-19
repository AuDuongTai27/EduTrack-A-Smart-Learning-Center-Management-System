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
  TeachingClassItemDto,
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
        specialty: isTa ? '[MOCK] Teaching Assistant in Math & Science' : '[MOCK] Mathematics & Exam Preparation',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        roleTitle: isTa ? '[MOCK] Teaching Assistant' : '[MOCK] Teacher',
        role: isTa ? 'teaching_assistant' : 'teacher',
      },
      kpis: {
        activeAssignments: 0,
        assignmentsDueToday: 0,
        activeClasses: isTa ? 2 : 1,
        classesToday: 0,
        totalStudents: isTa ? 3 : (userId === 3 ? 3 : 2),
        pendingAttendance: 0,
      },
      todayClasses: [],
      notifications: [
        {
          notificationId: 1,
          title: '[MOCK] Academic Council Meeting - November',
          description: '[MOCK] Teachers are cordially invited to attend the mid-term progress review meeting at 15:00 this Friday.',
          sender: '[MOCK] EduTrack Board of Directors',
          initials: 'ET',
          initialsBgClass: 'bg-primary-subtle',
          initialsColorClass: 'text-primary',
          isNew: true,
          isRead: false,
          timeAgo: '2 hours ago',
          createdAt: new Date().toISOString(),
        },
        {
          notificationId: 2,
          title: '[MOCK] Reminder to update periodic test results',
          description: '[MOCK] The system has opened the portal to enter grades and student progress evaluations for last week\'s tests.',
          sender: '[MOCK] Academic Affairs Office',
          initials: 'AA',
          initialsBgClass: 'bg-warning-subtle',
          initialsColorClass: 'text-warning',
          isNew: true,
          isRead: false,
          timeAgo: '5 hours ago',
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
    const fallbackClasses: TeachingClassItemDto[] = isTa
      ? [
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
          partnerName: '[MOCK] ThS. Hoàng Quốc Việt',
          scheduleSummary: '[MOCK] Monday, Wednesday (18:00 - 20:00)',
        },
        {
          classId: 2,
          className: '[MOCK] Class 10 - Physics Fundamentals',
          subjectId: 2,
          subjectName: '[MOCK] Physics',
          subjectCode: 'PHYS10',
          room: 'Room 202',
          tuitionFee: 3200000,
          startDate: '2026-09-01',
          status: 'active',
          studentCount: 25,
          teacherName: '[MOCK] Huỳnh Bá Duy',
          taName: '[MOCK] Âu Dương Tài',
          partnerName: '[MOCK] Huỳnh Bá Duy',
          scheduleSummary: '[MOCK] Tuesday, Thursday (18:00 - 20:00)',
        },
      ]
      : [
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
          partnerName: '[MOCK] Âu Dương Tài',
          scheduleSummary: '[MOCK] Monday, Wednesday (18:00 - 20:00)',
        },
      ];

    return { success: true, data: fallbackClasses, isLiveApi: false };
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
        gender: 'Male',
        dob: '15/08/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: '[MOCK] Le Van Hung (Father)',
        parentPhone: '0912 345 678',
        attendanceRate: 95,
        totalAttendedSessions: 19,
        totalSessions: 20,
      },
      {
        studentId: 7,
        studentCode: 'STU002',
        fullName: '[MOCK] Phạm Thị Bích',
        email: 'bich.pham@student.edutrack.edu.vn',
        phone: '0902 345 678',
        gender: 'Female',
        dob: '20/11/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: '[MOCK] Pham Van Nam (Father)',
        parentPhone: '0913 456 789',
        attendanceRate: 90,
        totalAttendedSessions: 18,
        totalSessions: 20,
      },
      {
        studentId: 8,
        studentCode: 'STU003',
        fullName: '[MOCK] Đặng Minh Cường',
        email: 'cuong.dang@student.edutrack.edu.vn',
        phone: '0903 456 789',
        gender: 'Male',
        dob: '05/03/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: '[MOCK] Dang Quoc Bao (Father)',
        parentPhone: '0914 567 890',
        attendanceRate: 85,
        totalAttendedSessions: 17,
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
      className: classId === 2 ? '[MOCK] Class 9B1 - Advanced Physics' : '[MOCK] Class 9A1 - Advanced Math',
      subjectName: classId === 2 ? '[MOCK] Physics' : '[MOCK] Mathematics',
      teacherName: '[MOCK] ThS. Hoàng Quốc Việt',
      totalStudents: 6,
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
          latestNote: '[MOCK] Student grasps concepts well, completes all assignments.',
        },
        {
          studentId: 102,
          studentCode: 'STU002',
          fullName: '[MOCK] Trần Minh Đức',
          avatarInitials: 'TD',
          email: 'duc.tran@edutrack.edu.vn',
          phone: '0901234562',
          presentDays: 18,
          absentDays: 1,
          lateDays: 1,
          totalDays: 20,
          attendancePercentage: 90,
          attendanceStatus: 'Present',
          latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Late',
          latestAssignmentScore: 8.0,
          maxScore: 10,
          latestNote: '[MOCK] Submitted slightly late, but solutions are correct.',
        },
        {
          studentId: 103,
          studentCode: 'STU003',
          fullName: '[MOCK] Nguyễn Thảo Linh',
          avatarInitials: 'NL',
          email: 'linh.nguyen@edutrack.edu.vn',
          phone: '0901234563',
          presentDays: 20,
          absentDays: 0,
          lateDays: 0,
          totalDays: 20,
          attendancePercentage: 100,
          attendanceStatus: 'Present',
          latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Graded',
          latestAssignmentScore: 10.0,
          maxScore: 10,
          latestNote: '[MOCK] Excellent, very strong logical thinking.',
        },
        {
          studentId: 104,
          studentCode: 'STU004',
          fullName: '[MOCK] Phạm Hoàng Nam',
          avatarInitials: 'PN',
          email: 'nam.pham@edutrack.edu.vn',
          phone: '0901234564',
          presentDays: 15,
          absentDays: 3,
          lateDays: 2,
          totalDays: 20,
          attendancePercentage: 75,
          attendanceStatus: 'Late',
          latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Missing',
          latestAssignmentScore: null,
          maxScore: 10,
          latestNote: '[MOCK] Need to remind parents regarding absences and missing assignments.',
        },
        {
          studentId: 105,
          studentCode: 'STU005',
          fullName: '[MOCK] Vũ Bảo Ngọc',
          avatarInitials: 'VN',
          email: 'ngoc.vu@edutrack.edu.vn',
          phone: '0901234565',
          presentDays: 18,
          absentDays: 2,
          lateDays: 0,
          totalDays: 20,
          attendancePercentage: 90,
          attendanceStatus: 'Present',
          latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Submitted',
          latestAssignmentScore: 8.5,
          maxScore: 10,
        },
        {
          studentId: 106,
          studentCode: 'STU006',
          fullName: '[MOCK] Đặng Tuấn Anh',
          avatarInitials: 'DA',
          email: 'anh.dang@edutrack.edu.vn',
          phone: '0901234566',
          presentDays: 17,
          absentDays: 2,
          lateDays: 1,
          totalDays: 20,
          attendancePercentage: 85,
          attendanceStatus: 'Present',
          latestAssignmentTitle: '[MOCK] Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Submitted',
          latestAssignmentScore: 9.0,
          maxScore: 10,
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
        title: isTa ? '[MOCK] Leave request for evening duty on 08/25' : '[MOCK] Leave request for teaching on 08/20',
        description: isTa
          ? '[MOCK] I have a professional certification graduation exam on the evening of 08/25, so I request leave from duty for class 9A1.'
          : '[MOCK] I have an unexpected business trip on 08/20/2026, so I request to reschedule the session to next Sunday.',
        requestedBy: targetUserId,
        requesterName: isTa ? '[MOCK] Âu Dương Tài' : '[MOCK] ThS. Hoàng Quốc Việt',
        reviewedBy: 1,
        reviewerName: '[MOCK] Admin EduTrack',
        priority: 'medium',
        status: 'approved',
        statusLabel: 'Approved',
        canEdit: false,
        createdAt: '2026-08-16T15:45:00Z',
        reviewedAt: '2026-08-17T09:00:00Z',
        reviewNotes: '[MOCK] Agreed to reschedule to Sunday.',
      },
      {
        requestId: 102,
        requestCode: 'AR0102',
        requestType: 'facility_request',
        title: '[MOCK] Proposal to upgrade microphone and projector in Room 201',
        description: '[MOCK] The teaching microphone in room 201 is crackling; requesting IT department to check, replace batteries, or upgrade.',
        requestedBy: targetUserId,
        requesterName: isTa ? '[MOCK] Âu Dương Tài' : '[MOCK] ThS. Hoàng Quốc Việt',
        priority: 'high',
        status: 'pending',
        statusLabel: 'Pending Review',
        canEdit: true,
        createdAt: '2026-08-18T10:30:00Z',
      },
      {
        requestId: 103,
        requestCode: 'AR0103',
        requestType: 'schedule_change',
        title: '[MOCK] Request to open tutoring session for struggling students',
        description: '[MOCK] Proposing that the center open 2 additional tutoring sessions on Quadratic Equations for students in class 9A1.',
        requestedBy: targetUserId,
        requesterName: isTa ? '[MOCK] Âu Dương Tài' : '[MOCK] ThS. Hoàng Quốc Việt',
        priority: 'medium',
        status: 'pending',
        statusLabel: 'Pending',
        canEdit: false,
        reviewedBy: 1,
        reviewerName: '[MOCK] Admin EduTrack',
        createdAt: '2026-08-19T14:15:00Z',
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
      gender: 'Male',
      enrolledSince: '15/08/2023',
      specialty: isTa ? '[MOCK] Teaching Assistant in Math & Science' : '[MOCK] Mathematics & Exam Preparation',
      avatarUrl: '/assets/img/profiles/avatar-27.jpg',
      address: '[MOCK] 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
      roleTitle: isTa ? '[MOCK] Teaching Assistant' : '[MOCK] Teacher',
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
      room: 'Room 201',
      status: 'scheduled',
      title: '[MOCK] Session 1: 08/09/2026 (18:00 - 20:00) - Room 201',
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
      {
        studentId: 7,
        studentCode: 'STU002',
        fullName: '[MOCK] Trần Thị Bình',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        status: 'present',
        note: '',
        isRecorded: false,
      },
      {
        studentId: 8,
        studentCode: 'STU003',
        fullName: '[MOCK] Lê Hoàng Cường',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        status: 'late',
        note: '[MOCK] Late by 10 minutes',
        isRecorded: false,
      },
    ];

    return {
      classId,
      className: `[MOCK] Class #${classId} - Advanced Math`,
      subjectName: '[MOCK] Mathematics',
      room: '[MOCK] Room 201',
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
        room: 'Room 201',
        status: 'completed',
        title: '[MOCK] Session 1: 08/09/2026 (18:00 - 20:00) - Room 201',
        isRecorded: true,
        presentCount: 2,
        absentCount: 0,
        lateCount: 1,
        excusedCount: 0,
        totalRecorded: 3,
      },
      {
        sessionId: 2,
        classId,
        sessionDate: '2026-09-10',
        startTime: '18:00',
        endTime: '20:00',
        timePeriod: '18:00 - 20:00',
        room: 'Room 201',
        status: 'scheduled',
        title: '[MOCK] Session 2: 10/09/2026 (18:00 - 20:00) - Room 201',
        isRecorded: false,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
        totalRecorded: 0,
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
      if (list && Array.isArray(list)) {
        return list;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được bài nộp của bài tập #${id}:`, err?.message);
    }

    return [
      {
        submissionId: 0,
        assignmentId: id,
        studentId: 6,
        studentName: '[MOCK] Lê Văn An',
        studentCode: 'STU001',
        fileUrl: undefined,
        submittedAt: '',
        submittedAtFormatted: 'Not submitted',
        score: null,
        feedback: null,
        status: 'not_submitted',
      },
      {
        submissionId: 0,
        assignmentId: id,
        studentId: 7,
        studentName: '[MOCK] Phạm Thị Bích',
        studentCode: 'STU002',
        fileUrl: undefined,
        submittedAt: '',
        submittedAtFormatted: 'Not submitted',
        score: null,
        feedback: null,
        status: 'not_submitted',
      },
      {
        submissionId: 0,
        assignmentId: id,
        studentId: 8,
        studentName: '[MOCK] Đặng Minh Cường',
        studentCode: 'STU003',
        fileUrl: undefined,
        submittedAt: '',
        submittedAtFormatted: 'Not submitted',
        score: null,
        feedback: null,
        status: 'not_submitted',
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
      fullName: studentId === 6 ? '[MOCK] Lê Văn An' : (studentId === 7 ? '[MOCK] Phạm Thị Bích' : `[MOCK] Student #${studentId}`),
      avatarInitials: studentId === 6 ? 'LA' : (studentId === 7 ? 'PB' : 'HV'),
      email: `student${studentId}@edutrack.edu.vn`,
      phone: '0901 234 567',
      presentDays: 19,
      absentDays: 1,
      totalDays: 20,
      attendancePercentage: 95,
      className: classId === 2 ? '[MOCK] Class 9B1 - Advanced Physics' : '[MOCK] Class 9A1 - Advanced Math',
      subjectName: classId === 2 ? '[MOCK] Physics' : '[MOCK] Mathematics',
      avgScore: '9.2',
      assignments: [
        {
          assignmentId: 1,
          title: '[MOCK] Homework 01: Quadratic Equations Problem Set',
          weekTitle: '[MOCK] Week 1. Homework 01: Quadratic Equations Problem Set',
          dueDate: '14/09/2026 23:59',
          submittedAt: '13/09/2026 20:30',
          status: 'graded',
          score: 9.5,
          maxScore: 10,
          aiScore: 9.5,
          submissionFileUrl: 'https://storage.edutrack.edu.vn/submissions/hw01.pdf',
          teacherFeedback: '[MOCK] Excellent work, all quadratic equation transformation steps are accurate.',
          aiFeedback: '[MOCK] High accuracy across all problems. Proper application of Vieta theorem.',
        },
        {
          assignmentId: 2,
          title: '[MOCK] Quiz 01: Applications of Vieta Theorem',
          weekTitle: '[MOCK] Week 2. Quiz 01: Applications of Vieta Theorem',
          dueDate: '20/09/2026 23:59',
          submittedAt: '20/09/2026 21:15',
          status: 'graded',
          score: 8.5,
          maxScore: 10,
          aiScore: 8.5,
          submissionFileUrl: 'https://storage.edutrack.edu.vn/submissions/quiz01.pdf',
          teacherFeedback: '[MOCK] Mastered symmetric expressions. Pay closer attention to calculations.',
        },
      ],
      evaluations: [
        {
          id: 1,
          evaluatorName: '[MOCK] ThS. Hoàng Quốc Việt',
          evaluatorRole: '[MOCK] Teacher',
          evaluationType: 'attitude',
          typeLabel: 'Attitude & Learning Spirit',
          rating: 'excellent',
          ratingLabel: '[MOCK] Excellent / Very Positive',
          content: '[MOCK] Always on time, serious learning attitude, actively volunteers to solve problems on the board.',
          suggestions: '[MOCK] Maintain current self-study spirit and provide more support to group peers.',
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
      evaluatorRole: payload.evaluatorRole || 'Teacher',
      evaluationType: payload.evaluationType,
      typeLabel: payload.typeLabel || 'Attitude & Learning Spirit',
      rating: payload.rating,
      ratingLabel: payload.ratingLabel || 'Good / Meets Requirements',
      content: `[MOCK] ${payload.content}`,
      suggestions: payload.suggestions,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    return { success: true, data: fallbackItem, isLiveApi: false };
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
