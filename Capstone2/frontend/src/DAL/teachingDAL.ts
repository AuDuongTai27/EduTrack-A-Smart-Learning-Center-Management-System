import { teachingApi, type CreateTeachingRequestPayload } from '../api/teachingApi';
import type { ApprovalRequestDto } from '../BLL/models/ApprovalRequestDto';
import type { TeachingDashboardDto } from '../BLL/models/teaching/TeachingDashboardDto';
import type { TeachingScheduleItemDto } from '../BLL/models/teaching/TeachingScheduleDto';
import type { TeachingClassItemDto } from '../BLL/models/teaching/TeachingClassItemDto';
import type { TeachingClassProgressDto, TeachingStudentProgressItemDto } from '../BLL/models/teaching/TeachingLearningProgressDto';

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

};

export default teachingDAL;
