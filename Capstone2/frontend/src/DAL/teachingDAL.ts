import {
  teachingApi,
  type CreateTeachingRequestPayload,
  type UpdateTeachingRequestPayload,
  type TeacherProfileDto,
  type UpdateTeacherProfilePayload,
} from '../api/teachingApi';
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import type { TeachingDashboardDto } from '../BLL/models/teaching/TeachingDashboardDto';
import type { TeachingScheduleItemDto } from '../BLL/models/teaching/TeachingScheduleDto';
import type { TeachingClassItemDto } from '../BLL/models/teaching/TeachingClassItemDto';
import type { TeachingClassProgressDto, TeachingStudentProgressItemDto } from '../BLL/models/teaching/TeachingLearningProgressDto';
import type { TeachingNotificationDto } from '../BLL/models/teaching/TeachingNotificationDto';

export type { TeacherProfileDto, UpdateTeacherProfilePayload };
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
      },
      todayClasses: isTa
        ? [
            {
              classId: 1,
              className: '[Mock] Hỗ trợ phụ đạo Toán 12',
              timePeriod: '08:00 - 09:45',
              room: 'Phòng 201',
              subjectName: 'Toán học',
            },
            {
              classId: 2,
              className: '[Mock] Trực phòng thực hành Vật Lý 12',
              timePeriod: '10:00 - 11:45',
              room: 'Phòng 202',
              subjectName: 'Vật Lý',
            },
            {
              classId: 3,
              className: '[Mock] Hỗ trợ điểm danh ca chiều Hóa 10',
              timePeriod: '14:00 - 15:45',
              room: 'Phòng 203',
              subjectName: 'Hóa học',
            },
          ]
        : [
            {
              classId: 1,
              className: '[Mock] Toán 12 Chuyên Sâu – Luyện Thi ĐH',
              timePeriod: '08:00 - 09:45',
              room: 'Phòng 201',
              subjectName: 'Toán học',
            },
            {
              classId: 2,
              className: '[Mock] Toán 10 Nâng Cao',
              timePeriod: '10:00 - 11:45',
              room: 'Phòng 202',
              subjectName: 'Toán học',
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
  async markNotificationAsRead(notificationId: number): Promise<boolean> {
    try {
      return await teachingApi.markNotificationAsRead(notificationId);
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
};

export default teachingDAL;
