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
export const DEFAULT_TEACHER_ID = 3;
export const DEFAULT_TA_ID = 5;

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
    try {
      const data = await teachingApi.getDashboard(userId);
      if (data) {
        return {
          ...data,
          source: 'api',
        };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API Dashboard (userId=${userId}), chuyển sang dữ liệu mock:`, err?.message);
    }

    const isTa = userId === 5;
    return {
      source: 'mock',
      profile: {
        userId: userId,
        userCode: isTa ? 'TA001' : 'TC001',
        fullName: isTa ? 'Âu Dương Tài' : 'ThS. Hoàng Quốc Việt',
        email: isTa ? 'tai.auduong@edutrack.edu.vn' : 'viet.hoang@edutrack.edu.vn',
        phone: isTa ? '0912 345 678' : '0903 123 456',
        specialty: isTa ? 'Trợ giảng Toán & Khoa học' : 'Toán học & Luyện thi',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        roleTitle: isTa ? 'Trợ giảng chuyên môn' : 'Giáo viên chuyên môn',
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
      todayClasses: isTa
        ? [
            {
              classId: 1,
              className: 'Class 9 - Advanced Mathematics',
              timePeriod: '18:00 - 20:00',
              startTime: '18:00',
              endTime: '20:00',
              room: 'Room 201',
              subjectName: 'Mathematics',
              studentsCount: 3,
              status: 'Upcoming',
              attendanceTaken: false,
            },
          ]
        : [
            {
              classId: 1,
              className: 'Class 9 - Advanced Mathematics',
              timePeriod: '18:00 - 20:00',
              startTime: '18:00',
              endTime: '20:00',
              room: 'Room 201',
              subjectName: 'Mathematics',
              studentsCount: 3,
              status: 'Upcoming',
              attendanceTaken: false,
            },
          ],
      notifications: [
        {
          notificationId: 1,
          title: 'Họp hội đồng chuyên môn Tháng 11',
          description: 'Kính mời quý thầy cô tham gia buổi họp đánh giá tiến độ giữa kỳ vào 15:00 Thứ Sáu tuần này.',
          sender: 'Ban Giám Đốc EduTrack',
          initials: 'ET',
          initialsBgClass: 'bg-primary-subtle',
          initialsColorClass: 'text-primary',
          isNew: true,
          isRead: false,
          timeAgo: '2 giờ trước',
          createdAt: new Date().toISOString(),
        },
        {
          notificationId: 2,
          title: 'Nhắc nhở cập nhật kết quả kiểm tra định kỳ',
          description: 'Hệ thống đã mở cổng nhập điểm số và nhận xét tiến độ học viên cho các bài kiểm tra tuần trước.',
          sender: 'Phòng Đào Tạo',
          initials: 'PĐT',
          initialsBgClass: 'bg-warning-subtle',
          initialsColorClass: 'text-warning',
          isNew: true,
          isRead: false,
          timeAgo: '5 giờ trước',
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
    try {
      const data = await teachingApi.getMySchedule(userId);
      if (data && data.length > 0) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API my-schedule (userId=${userId}), dùng fallback mock:`, err?.message);
    }

    const isTa = userId === 5;
    const fallbackList: TeachingScheduleItemDto[] = isTa
      ? [
          {
            scheduleId: 101,
            classId: 1,
            className: 'Class 9 - Advanced Mathematics',
            subjectName: 'Mathematics',
            room: 'Room 201',
            dayOfWeek: 'Monday',
            startTime: '18:00',
            endTime: '20:00',
            studentCount: 30,
            teacherName: 'ThS. Hoàng Quốc Việt',
            taName: 'Âu Dương Tài',
            partnerName: 'ThS. Hoàng Quốc Việt',
            status: 'active',
          },
          {
            scheduleId: 102,
            classId: 1,
            className: 'Class 9 - Advanced Mathematics',
            subjectName: 'Mathematics',
            room: 'Room 201',
            dayOfWeek: 'Wednesday',
            startTime: '18:00',
            endTime: '20:00',
            studentCount: 30,
            teacherName: 'ThS. Hoàng Quốc Việt',
            taName: 'Âu Dương Tài',
            partnerName: 'ThS. Hoàng Quốc Việt',
            status: 'active',
          },
          {
            scheduleId: 103,
            classId: 2,
            className: 'Class 10 - Physics Fundamentals',
            subjectName: 'Physics',
            room: 'Room 202',
            dayOfWeek: 'Tuesday',
            startTime: '18:00',
            endTime: '20:00',
            studentCount: 25,
            teacherName: 'Huỳnh Bá Duy',
            taName: 'Âu Dương Tài',
            partnerName: 'Huỳnh Bá Duy',
            status: 'active',
          },
          {
            scheduleId: 104,
            classId: 2,
            className: 'Class 10 - Physics Fundamentals',
            subjectName: 'Physics',
            room: 'Room 202',
            dayOfWeek: 'Thursday',
            startTime: '18:00',
            endTime: '20:00',
            studentCount: 25,
            teacherName: 'Huỳnh Bá Duy',
            taName: 'Âu Dương Tài',
            partnerName: 'Huỳnh Bá Duy',
            status: 'active',
          },
        ]
      : [
          {
            scheduleId: 201,
            classId: 1,
            className: 'Class 9 - Advanced Mathematics',
            subjectName: 'Mathematics',
            room: 'Room 201',
            dayOfWeek: 'Monday',
            startTime: '18:00',
            endTime: '20:00',
            studentCount: 30,
            teacherName: 'ThS. Hoàng Quốc Việt',
            taName: 'Âu Dương Tài',
            partnerName: 'Âu Dương Tài',
            status: 'active',
          },
          {
            scheduleId: 202,
            classId: 1,
            className: 'Class 9 - Advanced Mathematics',
            subjectName: 'Mathematics',
            room: 'Room 201',
            dayOfWeek: 'Wednesday',
            startTime: '18:00',
            endTime: '20:00',
            studentCount: 30,
            teacherName: 'ThS. Hoàng Quốc Việt',
            taName: 'Âu Dương Tài',
            partnerName: 'Âu Dương Tài',
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
    try {
      const data = await teachingApi.getMyClasses(userId);
      if (data && data.length > 0) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API my-classes (userId=${userId}), dùng fallback mock:`, err?.message);
    }

    const isTa = userId === 5;
    const fallbackClasses: TeachingClassItemDto[] = isTa
      ? [
          {
            classId: 1,
            className: 'Class 9 - Advanced Mathematics',
            subjectId: 1,
            subjectName: 'Mathematics',
            subjectCode: 'MATH9',
            room: 'Room 201',
            tuitionFee: 3500000,
            startDate: '2026-09-01',
            status: 'active',
            studentCount: 30,
            teacherName: 'ThS. Hoàng Quốc Việt',
            taName: 'Âu Dương Tài',
            partnerName: 'ThS. Hoàng Quốc Việt',
            scheduleSummary: 'Thứ Hai, Thứ Tư (18:00 - 20:00)',
          },
          {
            classId: 2,
            className: 'Class 10 - Physics Fundamentals',
            subjectId: 2,
            subjectName: 'Physics',
            subjectCode: 'PHYS10',
            room: 'Room 202',
            tuitionFee: 3200000,
            startDate: '2026-09-01',
            status: 'active',
            studentCount: 25,
            teacherName: 'Huỳnh Bá Duy',
            taName: 'Âu Dương Tài',
            partnerName: 'Huỳnh Bá Duy',
            scheduleSummary: 'Thứ Ba, Thứ Năm (18:00 - 20:00)',
          },
        ]
      : [
          {
            classId: 1,
            className: 'Class 9 - Advanced Mathematics',
            subjectId: 1,
            subjectName: 'Mathematics',
            subjectCode: 'MATH9',
            room: 'Room 201',
            tuitionFee: 3500000,
            startDate: '2026-09-01',
            status: 'active',
            studentCount: 30,
            teacherName: 'ThS. Hoàng Quốc Việt',
            taName: 'Âu Dương Tài',
            partnerName: 'Âu Dương Tài',
            scheduleSummary: 'Thứ Hai, Thứ Tư (18:00 - 20:00)',
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
      if (list && Array.isArray(list) && list.length > 0) {
        return list;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không tải được danh sách học sinh của lớp #${classId}:`, err?.message);
    }

    return [
      {
        studentId: 6,
        studentCode: 'STU001',
        fullName: 'Lê Văn An',
        email: 'an.le@student.edutrack.edu.vn',
        phone: '0901 234 567',
        gender: 'Nam',
        dob: '15/08/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: 'Lê Văn Hùng (Bố)',
        parentPhone: '0912 345 678',
        attendanceRate: 95,
        totalAttendedSessions: 19,
        totalSessions: 20,
      },
      {
        studentId: 7,
        studentCode: 'STU002',
        fullName: 'Phạm Thị Bích',
        email: 'bich.pham@student.edutrack.edu.vn',
        phone: '0902 345 678',
        gender: 'Nữ',
        dob: '20/11/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: 'Phạm Văn Nam (Bố)',
        parentPhone: '0913 456 789',
        attendanceRate: 90,
        totalAttendedSessions: 18,
        totalSessions: 20,
      },
      {
        studentId: 8,
        studentCode: 'STU003',
        fullName: 'Đặng Minh Cường',
        email: 'cuong.dang@student.edutrack.edu.vn',
        phone: '0903 456 789',
        gender: 'Nam',
        dob: '05/03/2011',
        enrollmentDate: '01/09/2026',
        status: 'active',
        parentName: 'Đặng Quốc Bảo (Bố)',
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

  /**
   * Lấy tiến độ học tập và điểm danh của toàn bộ học sinh trong lớp phụ trách
   */
  async getClassLearningProgress(classId: number, userId?: number): Promise<{
    success: boolean;
    data: TeachingClassProgressDto;
    isLiveApi: boolean;
  }> {
    try {
      const data = await teachingApi.getClassLearningProgress(classId, userId);
      if (data && data.students && data.students.length > 0) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API learning-progress (classId=${classId}), dùng fallback mock:`, err?.message);
    }

    const fallbackProgress: TeachingClassProgressDto = {
      classId: classId || 1,
      className: classId === 2 ? 'Lớp 9B1 - Vật Lý Chuyên Sâu' : 'Lớp 9A1 - Toán Nâng Cao',
      subjectName: classId === 2 ? 'Vật lý' : 'Toán học',
      teacherName: 'ThS. Hoàng Quốc Việt',
      totalStudents: 6,
      totalSessions: 20,
      completedSessions: 12,
      latestAssignmentTitle: 'Homework 01: Quadratic Equations',
      students: [
        {
          studentId: 101,
          studentCode: 'STU001',
          fullName: 'Lê Văn An',
          avatarInitials: 'LA',
          email: 'an.le@edutrack.edu.vn',
          phone: '0901234561',
          presentDays: 19,
          absentDays: 1,
          lateDays: 0,
          totalDays: 20,
          attendancePercentage: 95,
          attendanceStatus: 'Present',
          latestAssignmentTitle: 'Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Submitted',
          latestAssignmentScore: 9.5,
          maxScore: 10,
          latestNote: 'Học sinh tiếp thu tốt, làm bài tập đầy đủ.',
        },
        {
          studentId: 102,
          studentCode: 'STU002',
          fullName: 'Trần Minh Đức',
          avatarInitials: 'TD',
          email: 'duc.tran@edutrack.edu.vn',
          phone: '0901234562',
          presentDays: 18,
          absentDays: 1,
          lateDays: 1,
          totalDays: 20,
          attendancePercentage: 90,
          attendanceStatus: 'Present',
          latestAssignmentTitle: 'Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Late',
          latestAssignmentScore: 8.0,
          maxScore: 10,
          latestNote: 'Nộp bài hơi trễ nhưng lời giải chính xác.',
        },
        {
          studentId: 103,
          studentCode: 'STU003',
          fullName: 'Nguyễn Thảo Linh',
          avatarInitials: 'NL',
          email: 'linh.nguyen@edutrack.edu.vn',
          phone: '0901234563',
          presentDays: 20,
          absentDays: 0,
          lateDays: 0,
          totalDays: 20,
          attendancePercentage: 100,
          attendanceStatus: 'Present',
          latestAssignmentTitle: 'Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Graded',
          latestAssignmentScore: 10.0,
          maxScore: 10,
          latestNote: 'Xuất sắc, tư duy logic rất tốt.',
        },
        {
          studentId: 104,
          studentCode: 'STU004',
          fullName: 'Phạm Hoàng Nam',
          avatarInitials: 'PN',
          email: 'nam.pham@edutrack.edu.vn',
          phone: '0901234564',
          presentDays: 15,
          absentDays: 3,
          lateDays: 2,
          totalDays: 20,
          attendancePercentage: 75,
          attendanceStatus: 'Late',
          latestAssignmentTitle: 'Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Missing',
          latestAssignmentScore: null,
          maxScore: 10,
          latestNote: 'Cần nhắc nhở phụ huynh về việc vắng học và chưa nộp bài.',
        },
        {
          studentId: 105,
          studentCode: 'STU005',
          fullName: 'Vũ Bảo Ngọc',
          avatarInitials: 'VN',
          email: 'ngoc.vu@edutrack.edu.vn',
          phone: '0901234565',
          presentDays: 18,
          absentDays: 2,
          lateDays: 0,
          totalDays: 20,
          attendancePercentage: 90,
          attendanceStatus: 'Present',
          latestAssignmentTitle: 'Homework 01: Quadratic Equations',
          latestAssignmentStatus: 'Submitted',
          latestAssignmentScore: 8.5,
          maxScore: 10,
        },
        {
          studentId: 106,
          studentCode: 'STU006',
          fullName: 'Đặng Tuấn Anh',
          avatarInitials: 'DA',
          email: 'anh.dang@edutrack.edu.vn',
          phone: '0901234566',
          presentDays: 17,
          absentDays: 2,
          lateDays: 1,
          totalDays: 20,
          attendancePercentage: 85,
          attendanceStatus: 'Present',
          latestAssignmentTitle: 'Homework 01: Quadratic Equations',
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
    try {
      const data = await teachingApi.getNotifications(userId, status);
      if (Array.isArray(data)) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API notifications (userId=${userId}), dùng fallback mock:`, err?.message);
    }

    const isTa = userId === 5;
    const fallbackList: TeachingNotificationDto[] = [
      {
        notificationId: 1,
        userId: userId,
        title: isTa ? 'Phân công Lịch trực & Hỗ trợ Lớp Toán 9A1' : 'Cập nhật Lịch giảng dạy Học kỳ mới 2026/2027',
        content: isTa
          ? 'Bạn đã được phân công trợ giảng cho Lớp Toán 9A1 (ThS. Hoàng Quốc Việt phụ trách). Vui lòng kiểm tra lịch trực chi tiết.'
          : 'Vui lòng kiểm tra lại phòng học và khung giờ giảng dạy được phân bổ mới nhất cho các lớp bắt đầu từ tuần tới.',
        sender: 'Ban Quản Lý EduTrack',
        initials: 'ET',
        initialsBgClass: 'bg-primary-subtle',
        initialsColorClass: 'text-primary',
        type: 'schedule',
        isNew: true,
        isRead: false,
        timeAgo: '10 phút trước',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        notificationId: 2,
        userId: userId,
        title: isTa ? 'Thông báo kiểm tra bài tập tuần 1 của Lớp 9A1' : 'Đã phân công Trợ giảng mới cho Lớp Toán 9A1',
        content: isTa
          ? 'Vui lòng kiểm tra và hỗ trợ chấm điểm sơ bộ bài tập Homework 01 cho các em học sinh nộp trễ trước Thứ Sáu.'
          : 'Trợ giảng Âu Dương Tài đã được phân công phối hợp hỗ trợ các buổi học và điểm danh lớp của bạn.',
        sender: 'Phòng Đào Tạo',
        initials: 'ĐT',
        initialsBgClass: 'bg-info-subtle',
        initialsColorClass: 'text-info',
        type: 'system',
        isNew: true,
        isRead: false,
        timeAgo: '2 giờ trước',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        notificationId: 3,
        userId: userId,
        title: 'Đơn kiến nghị giảng dạy đã được phê duyệt',
        content: 'Yêu cầu hỗ trợ thiết bị trình chiếu tại Phòng 201 của bạn đã được đội ngũ kỹ thuật tiếp nhận và hoàn tất.',
        sender: 'Phòng Hành Chính & Kỹ Thuật',
        initials: 'HC',
        initialsBgClass: 'bg-warning-subtle',
        initialsColorClass: 'text-warning',
        type: 'leave',
        isNew: false,
        isRead: true,
        timeAgo: '1 ngày trước',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        notificationId: 4,
        userId: userId,
        title: 'Nhắc nhở hoàn tất nhập điểm kiểm tra định kỳ',
        content: 'Hạn chót cập nhật kết quả bài tập Homework 01 cho các lớp 9A1 và 9B1 là 17:00 ngày Thứ Sáu tuần này.',
        sender: 'EduTrack Staff',
        initials: 'ES',
        initialsBgClass: 'bg-success-subtle',
        initialsColorClass: 'text-success',
        type: 'system',
        isNew: false,
        isRead: true,
        timeAgo: '2 ngày trước',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      },
    ];

    let filtered = fallbackList;
    if (status === 'unread') {
      filtered = fallbackList.filter((n) => !n.isRead);
    } else if (status === 'read') {
      filtered = fallbackList.filter((n) => n.isRead);
    }

    return { success: true, data: filtered, isLiveApi: false };
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  async markNotificationAsRead(notificationId: number, userId?: number): Promise<boolean> {
    try {
      return await teachingApi.markNotificationAsRead(notificationId, userId);
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Đánh dấu đọc thông báo #${notificationId} local fallback:`, err?.message);
      return true;
    }
  },

  /**
   * Đánh dấu toàn bộ thông báo là đã đọc
   */
  async markAllNotificationsAsRead(userId: number): Promise<number> {
    try {
      return await teachingApi.markAllNotificationsAsRead(userId);
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Đánh dấu đọc tất cả thông báo local fallback:`, err?.message);
      return 2;
    }
  },


  /**
   * Lấy danh sách đơn từ và yêu cầu của Giáo viên hoặc Trợ giảng
   */
  async getRequests(userId: number, status?: string): Promise<{
    success: boolean;
    data: ApprovalRequestDto[];
    isLiveApi: boolean;
  }> {
    try {
      const data = await teachingApi.getRequests(userId, status);
      if (Array.isArray(data)) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API requests (userId=${userId}), dùng fallback mock:`, err?.message);
    }

    const isTa = userId === 5;
    const fallbackRequests: ApprovalRequestDto[] = [
      {
        requestId: 101,
        requestCode: 'AR0101',
        requestType: 'leave_request',
        title: isTa ? 'Đơn xin nghỉ phép trực buổi tối 25/08' : 'Đơn xin nghỉ phép giảng dạy ngày 20/08',
        description: isTa
          ? 'Em có lịch thi tốt nghiệp chứng chỉ chuyên môn vào tối 25/08 nên xin phép vắng buổi trực lớp 9A1.'
          : 'Tôi có lịch công tác đột xuất vào ngày 20/08/2026 nên xin phép chuyển buổi học sang Chủ nhật tuần sau.',
        requestedBy: userId,
        requesterName: isTa ? 'Âu Dương Tài' : 'ThS. Hoàng Quốc Việt',
        reviewedBy: 1,
        reviewerName: 'Admin EduTrack',
        priority: 'medium',
        status: 'approved',
        statusLabel: 'Đã duyệt',
        canEdit: false,
        createdAt: '2026-08-16T15:45:00Z',
        reviewedAt: '2026-08-17T09:00:00Z',
        reviewNotes: 'Đồng ý cho đổi lịch sang Chủ Nhật.',
      },
      {
        requestId: 102,
        requestCode: 'AR0102',
        requestType: 'facility_request',
        title: 'Đề xuất nâng cấp micro và máy chiếu Phòng 201',
        description: 'Micro giảng dạy tại phòng 201 bị rè, kính đề xuất bộ phận IT kiểm tra thay pin hoặc nâng cấp.',
        requestedBy: userId,
        requesterName: isTa ? 'Âu Dương Tài' : 'ThS. Hoàng Quốc Việt',
        priority: 'high',
        status: 'pending',
        statusLabel: 'Chưa xem xét giải quyết',
        canEdit: true,
        createdAt: '2026-08-18T10:30:00Z',
      },
      {
        requestId: 103,
        requestCode: 'AR0103',
        requestType: 'schedule_change',
        title: 'Yêu cầu mở thêm lớp phụ đạo cho học sinh yếu',
        description: 'Kính đề xuất trung tâm cho mở thêm 2 buổi phụ đạo ôn tập chương Phương trình bậc hai cho học sinh lớp 9A1.',
        requestedBy: userId,
        requesterName: isTa ? 'Âu Dương Tài' : 'ThS. Hoàng Quốc Việt',
        priority: 'medium',
        status: 'pending',
        statusLabel: 'Chờ duyệt',
        canEdit: false,
        reviewedBy: 1,
        reviewerName: 'Admin EduTrack',
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
    try {
      const data = await teachingApi.getProfile(userId);
      if (data && data.userId) {
        return data;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API Profile (userId=${userId}), dùng fallback profile:`, err?.message);
    }

    const isTa = userId === DEFAULT_TA_ID;
    return {
      userId,
      userCode: isTa ? 'TA001' : 'TC001',
      fullName: isTa ? 'Âu Dương Tài' : 'ThS. Hoàng Quốc Việt',
      email: isTa ? 'tai.auduong@edutrack.edu.vn' : 'viet.hoang@edutrack.edu.vn',
      phone: isTa ? '0912 345 678' : '0903 123 456',
      dateOfBirth: isTa ? '1998-05-15' : '1990-11-10',
      gender: 'Nam',
      enrolledSince: '15/08/2023',
      specialty: isTa ? 'Trợ giảng Toán & Khoa học' : 'Toán học & Luyện thi',
      avatarUrl: '/assets/img/profiles/avatar-27.jpg',
      address: '123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
      roleTitle: isTa ? 'Trợ giảng chuyên môn' : 'Giáo viên chuyên môn',
      role: isTa ? 'teaching_assistant' : 'teacher',
      activeClassesCount: isTa ? 3 : 2,
      totalStudentsCount: isTa ? 50 : 35,
    };
  },

  /**
   * Cập nhật thông tin hồ sơ GV / TA
   */
  async changePassword(userId: number, payload: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    try {
      return await teachingApi.changePassword(userId, payload);
    } catch (err: any) {
      console.warn(`[teachingDAL] Loi goi API changePassword (userId=${userId}):`, err?.message);
      throw err;
    }
  },

  async updateProfile(userId: number, payload: UpdateTeacherProfilePayload): Promise<TeacherProfileDto> {
    try {
      const data = await teachingApi.updateProfile(userId, payload);
      if (data && data.userId) {
        return data;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không kết nối được API updateProfile (userId=${userId}):`, err?.message);
      throw err;
    }

    const current = await this.getProfile(userId);
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
    try {
      const data = await teachingApi.getAttendanceSheet(classId, sessionId, userId);
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
      title: 'Buổi 1: 08/09/2026 (18:00 - 20:00) - Phòng 201',
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
        fullName: 'Nguyễn Văn An',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        status: 'present',
        note: '',
        isRecorded: false,
      },
      {
        studentId: 7,
        studentCode: 'STU002',
        fullName: 'Trần Thị Bình',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        status: 'present',
        note: '',
        isRecorded: false,
      },
      {
        studentId: 8,
        studentCode: 'STU003',
        fullName: 'Lê Hoàng Cường',
        avatarUrl: '/assets/img/profiles/avatar-27.jpg',
        status: 'late',
        note: 'Đến muộn 10 phút',
        isRecorded: false,
      },
    ];

    return {
      classId,
      className: `Class #${classId} - Toán nâng cao`,
      subjectName: 'Toán học',
      room: 'Phòng 201',
      currentSession: activeSession,
      availableSessions: [activeSession],
      students: fallbackStudents,
      stats: {
        totalStudents: 3,
        presentCount: 2,
        absentCount: 0,
        lateCount: 1,
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
      if (Array.isArray(data) && data.length > 0) {
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
        title: 'Buổi 1: 08/09/2026 (18:00 - 20:00) - Phòng 201',
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
        room: 'Phòng 201',
        status: 'scheduled',
        title: 'Buổi 2: 10/09/2026 (18:00 - 20:00) - Phòng 201',
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
    return await teachingApi.saveBulkAttendance(payload);
  },

  /**
   * Cập nhật điểm danh đơn lẻ
   */
  async updateSingleAttendance(attendanceId: number, payload: UpdateSingleAttendancePayload): Promise<TeachingStudentAttendanceItemDto> {
    return await teachingApi.updateSingleAttendance(attendanceId, payload);
  },

  /**
   * Tạo bài tập mới cho lớp học (Lưu DB thật qua /api/teaching/assignments)
   */
  async createAssignment(payload: CreateTeachingAssignmentRequest): Promise<TeachingAssignmentItemDto> {
    try {
      const res = await teachingApi.createAssignment(payload);
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
      if (list && Array.isArray(list) && list.length > 0) {
        console.log(`🟢 [teachingDAL] Tải được ${list.length} bài tập từ DB cho lớp #${classId}`);
        return list;
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không thể tải danh sách bài tập của lớp #${classId}:`, err?.message);
    }

    return [
      {
        assignmentId: 1,
        classId,
        className: `Class #${classId}`,
        title: 'Homework 01: Quadratic Equations Problem Set',
        description: 'Solve problems from page 45 to 48 in the textbook.',
        fileUrl: '/assets/docs/assignment_default.pdf',
        dueDate: '2026-09-15T23:59:00',
        dueDateFormatted: '15/09/2026 23:59',
        maxScore: 10.0,
        createdBy: 3,
        creatorName: 'ThS. Hoàng Quốc Việt',
        assignmentType: 'Written Assignment',
        submissionCount: 3,
        gradedCount: 2,
        status: 'active',
        isAiGradingEnabled: true,
        createdAt: '08/09/2026',
      },
      {
        assignmentId: 2,
        classId,
        className: `Class #${classId}`,
        title: 'Quiz 01: Applications of Vieta Theorem',
        description: 'Complete 10 multiple-choice questions online.',
        fileUrl: '/assets/docs/assignment_default.pdf',
        dueDate: '2026-09-20T23:59:00',
        dueDateFormatted: '20/09/2026 23:59',
        maxScore: 10.0,
        createdBy: 3,
        creatorName: 'ThS. Hoàng Quốc Việt',
        assignmentType: 'Multiple Choice Questions',
        submissionCount: 0,
        gradedCount: 0,
        status: 'active',
        isAiGradingEnabled: true,
        createdAt: '12/09/2026',
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
      if (list && Array.isArray(list) && list.length > 0) {
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
        studentName: 'Lê Văn An',
        studentCode: 'STU001',
        fileUrl: '/uploads/submissions/an_le_hw01.pdf',
        submittedAt: '2026-08-10T15:45:00',
        submittedAtFormatted: '10/08/2026 15:45',
        score: 9.5,
        feedback: 'Bài làm rất tốt, cách giải ngắn gọn và chuẩn xác.',
        aiScore: 9.2,
        status: 'graded',
        gradedBy: 3,
        graderName: 'ThS. Hoàng Quốc Việt',
      },
      {
        submissionId: 2,
        assignmentId: id,
        studentId: 7,
        studentName: 'Phạm Thị Bích',
        studentCode: 'STU002',
        fileUrl: '/uploads/submissions/bich_pham_hw01.pdf',
        submittedAt: '2026-08-11T09:15:00',
        submittedAtFormatted: '11/08/2026 09:15',
        score: 8.0,
        feedback: 'Cần lưu ý thêm phần trình bày biểu đồ.',
        aiScore: 8.0,
        status: 'graded',
        gradedBy: 3,
        graderName: 'ThS. Hoàng Quốc Việt',
      },
      {
        submissionId: 3,
        assignmentId: id,
        studentId: 8,
        studentName: 'Đặng Minh Cường',
        studentCode: 'STU003',
        fileUrl: '/uploads/submissions/cuong_dang_hw01.pdf',
        submittedAt: '2026-08-11T11:20:00',
        submittedAtFormatted: '11/08/2026 11:20',
        score: null,
        feedback: null,
        aiScore: null,
        status: 'submitted',
        gradedBy: null,
        graderName: null,
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
      const res = await teachingApi.gradeSubmission(id, submissionId, payload);
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
        message: 'Mock upload URL',
        fileUrl: `/uploads/teaching/${safeName}`,
        fileName: file.name,
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
      fullName: studentId === 6 ? 'Lê Văn An' : (studentId === 7 ? 'Phạm Thị Bích' : `Học viên #${studentId}`),
      avatarInitials: studentId === 6 ? 'LA' : (studentId === 7 ? 'PB' : 'HV'),
      email: `student${studentId}@edutrack.edu.vn`,
      phone: '0901 234 567',
      presentDays: 19,
      absentDays: 1,
      totalDays: 20,
      attendancePercentage: 95,
      className: classId === 2 ? 'Lớp 9B1 - Vật Lý Chuyên Sâu' : 'Lớp 9A1 - Toán Nâng Cao',
      subjectName: classId === 2 ? 'Vật lý' : 'Toán học',
      avgScore: '9.2',
      assignments: [
        {
          assignmentId: 1,
          title: 'Homework 01: Quadratic Equations Problem Set',
          weekTitle: 'Tuần 1. Homework 01: Quadratic Equations Problem Set',
          dueDate: '14/09/2026 23:59',
          submittedAt: '13/09/2026 20:30',
          status: 'graded',
          score: 9.5,
          maxScore: 10,
          aiScore: 9.5,
          submissionFileUrl: 'https://storage.edutrack.edu.vn/submissions/hw01.pdf',
          teacherFeedback: 'Bài làm rất xuất sắc, các bước biến đổi phương trình bậc hai chính xác.',
          aiFeedback: 'Độ chính xác cao trên toàn bộ các bài toán. Sử dụng đúng định lý Viète.',
        },
        {
          assignmentId: 2,
          title: 'Quiz 01: Applications of Vieta Theorem',
          weekTitle: 'Tuần 2. Quiz 01: Applications of Vieta Theorem',
          dueDate: '20/09/2026 23:59',
          submittedAt: '20/09/2026 21:15',
          status: 'graded',
          score: 8.5,
          maxScore: 10,
          aiScore: 8.5,
          submissionFileUrl: 'https://storage.edutrack.edu.vn/submissions/quiz01.pdf',
          teacherFeedback: 'Nắm vững biểu thức đối xứng. Chú ý tính toán cẩn thận hơn.',
        },
      ],
      evaluations: [
        {
          id: 1,
          evaluatorName: 'ThS. Hoàng Quốc Việt',
          evaluatorRole: 'Giáo viên',
          evaluationType: 'attitude',
          typeLabel: 'Thái độ & Tinh thần học tập',
          rating: 'excellent',
          ratingLabel: 'Xuất sắc / Rất tích cực',
          content: 'Em luôn có mặt đúng giờ, thái độ học tập nghiêm túc, tích cực xung phong giải bài trên bảng.',
          suggestions: 'Phát huy tinh thần tự học hiện tại và hỗ trợ thêm các bạn cùng nhóm.',
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
    try {
      const data = await teachingApi.createStudentEvaluation(classId, studentId, payload);
      if (data) {
        return { success: true, data, isLiveApi: true };
      }
    } catch (err: any) {
      console.warn(`🟡 [teachingDAL] Không lưu được đánh giá qua API, dùng fallback local:`, err?.message);
    }

    const fallbackItem: TeachingStudentEvaluationItemDto = {
      id: Date.now(),
      evaluatorName: payload.evaluatorName || 'ThS. Hoàng Quốc Việt',
      evaluatorRole: payload.evaluatorRole || 'Giáo viên',
      evaluationType: payload.evaluationType,
      typeLabel: payload.typeLabel || 'Thái độ & Tinh thần học tập',
      rating: payload.rating,
      ratingLabel: payload.ratingLabel || 'Tốt / Đạt yêu cầu',
      content: payload.content,
      suggestions: payload.suggestions,
      createdAt: new Date().toLocaleDateString('vi-VN'),
    };

    return { success: true, data: fallbackItem, isLiveApi: false };
  },
};

export default teachingDAL;
