import type { User } from '../BLL/models/User';
import type { Class } from '../BLL/models/Class';
import type { Subject } from '../BLL/models/Subject';
import type { ClassSchedule } from '../BLL/models/ClassSchedule';
import type { ClassSession } from '../BLL/models/ClassSession';
import type { Attendance } from '../BLL/models/Attendance';
import type { ContentUnit } from '../BLL/models/ContentUnit';
import type { Assignment } from '../BLL/models/Assignment';
import type { Submission } from '../BLL/models/Submission';
import type { TuitionInvoice } from '../BLL/models/TuitionInvoice';
import type { ApprovalRequest } from '../BLL/models/ApprovalRequest';
import type { Notification } from '../BLL/models/Notification';

import {
  MOCK_USERS,
  MOCK_SUBJECTS,
  MOCK_CLASSES,
  MOCK_STUDENT_CLASSES,
  MOCK_TEACHER_CLASSES,
  MOCK_CLASS_SCHEDULES,
  MOCK_CLASS_SESSIONS,
  MOCK_ATTENDANCES,
  MOCK_CONTENT_UNITS,
  MOCK_ASSIGNMENTS,
  MOCK_SUBMISSIONS,
  MOCK_TUITION_INVOICES,
  MOCK_APPROVAL_REQUESTS,
  MOCK_NOTIFICATIONS,
} from './mockData';

// Mặc định cho Student Portal là học sinh Lê Văn An (STU001, UserId = 6)
export const DEFAULT_STUDENT_ID = 6;

/**
 * Kiểu dữ liệu lớp học phong phú (Enriched Class) dành cho giao diện Student
 */
export interface EnrichedStudentClass {
  classId: number;
  className: string;
  room: string | null;
  status: string;
  subject: Subject;
  teacher: User | null;
  teacherInitials: string;
  schedules: ClassSchedule[];
  scheduleText: string;
  subjectThemeClass: string;
  badge: string;
  totalSessions: number;
  completedSessions: number;
}

/**
 * Service DAL dành cho Học sinh (Student)
 * Mọi thao tác truy xuất dữ liệu của học sinh được đóng gói tại đây.
 * Khi kết nối backend, chỉ cần thay đổi bên trong các hàm này sang gọi HTTP API (Axios/fetch).
 */
export const studentDAL = {
  /**
   * Lấy thông tin tài khoản học sinh
   */
  async getProfile(studentId = DEFAULT_STUDENT_ID): Promise<User | null> {
    const user = MOCK_USERS.find((u) => u.userId === studentId);
    return user ? { ...user } : null;
  },

  /**
   * Lấy đồng bộ danh sách lớp học mà học sinh đang tham gia (phục vụ khởi tạo component)
   */
  getEnrolledClassesSync(studentId = DEFAULT_STUDENT_ID): EnrichedStudentClass[] {
    // 1. Lọc bảng student_classes
    const enrollments = MOCK_STUDENT_CLASSES.filter(
      (sc) => sc.studentId === studentId && sc.status === 'active'
    );

    const result: EnrichedStudentClass[] = [];

    for (const sc of enrollments) {
      const cls = MOCK_CLASSES.find((c) => c.classId === sc.classId);
      if (!cls) continue;

      const subject = MOCK_SUBJECTS.find((s) => s.subjectId === cls.subjectId) || {
        subjectId: cls.subjectId,
        subjectCode: 'GEN',
        subjectName: 'Chung',
        description: null,
      };

      // Tìm giáo viên
      const tc = MOCK_TEACHER_CLASSES.find((t) => t.classId === cls.classId && t.status === 'active');
      const teacher = tc ? MOCK_USERS.find((u) => u.userId === tc.teacherId) || null : null;
      const teacherInitials = teacher
        ? teacher.fullName
            .split(' ')
            .filter(Boolean)
            .slice(-2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()
        : 'TC';

      // Tìm lịch học
      const schedules = MOCK_CLASS_SCHEDULES.filter((s) => s.classId === cls.classId);
      const scheduleText =
        schedules.length > 0
          ? schedules
              .map((s) => {
                const dayMap: Record<string, string> = {
                  monday: 'Thứ 2',
                  tuesday: 'Thứ 3',
                  wednesday: 'Thứ 4',
                  thursday: 'Thứ 5',
                  friday: 'Thứ 6',
                  saturday: 'Thứ 7',
                  sunday: 'Chủ nhật',
                };
                const dayName = dayMap[s.dayOfWeek.toLowerCase()] || s.dayOfWeek;
                return `${dayName} (${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)})`;
              })
              .join(', ')
          : 'Chưa có lịch';

      // Định dạng style theo môn
      let subjectThemeClass = 'subject-toan';
      let badge = 'Toán';
      if (subject.subjectCode === 'PHYS') {
        subjectThemeClass = 'subject-vat-ly';
        badge = 'Vật Lý';
      } else if (subject.subjectCode === 'CHEM') {
        subjectThemeClass = 'subject-hoa-hoc';
        badge = 'Hóa Học';
      } else if (subject.subjectCode === 'ENG') {
        subjectThemeClass = 'subject-tieng-anh';
        badge = 'Tiếng Anh';
      }

      // Đếm số buổi học
      const sessions = MOCK_CLASS_SESSIONS.filter((sess) => sess.classId === cls.classId);
      const completedSessions = sessions.filter((sess) => sess.status === 'completed').length;

      result.push({
        classId: cls.classId,
        className: cls.className,
        room: cls.room ?? null,
        status: cls.status,
        subject,
        teacher,
        teacherInitials,
        schedules,
        scheduleText,
        subjectThemeClass,
        badge,
        totalSessions: sessions.length || 10,
        completedSessions,
      });
    }

    return result;
  },

  /**
   * Lấy danh sách lớp học mà học sinh đang tham gia (Async - chuẩn API)
   */
  async getEnrolledClasses(studentId = DEFAULT_STUDENT_ID): Promise<EnrichedStudentClass[]> {
    return this.getEnrolledClassesSync(studentId);
  },

  /**
   * Lấy chi tiết lớp học (Thông tin cơ bản, bài giảng content units, bài tập, điểm danh)
   */
  async getClassDetail(classId: number, studentId = DEFAULT_STUDENT_ID) {
    const cls = MOCK_CLASSES.find((c) => c.classId === classId);
    if (!cls) return null;

    const subject = MOCK_SUBJECTS.find((s) => s.subjectId === cls.subjectId) || null;
    const tc = MOCK_TEACHER_CLASSES.find((t) => t.classId === cls.classId && t.status === 'active');
    const teacher = tc ? MOCK_USERS.find((u) => u.userId === tc.teacherId) || null : null;
    const schedules = MOCK_CLASS_SCHEDULES.filter((s) => s.classId === cls.classId);
    const contentUnits = MOCK_CONTENT_UNITS.filter((u) => u.classId === cls.classId);
    const assignments = MOCK_ASSIGNMENTS.filter((a) => a.classId === cls.classId);
    const studentSubmissions = MOCK_SUBMISSIONS.filter((sub) => sub.studentId === studentId);

    // Điểm danh của học sinh trong lớp này
    const sessions = MOCK_CLASS_SESSIONS.filter((sess) => sess.classId === cls.classId);
    const sessionIds = sessions.map((s) => s.sessionId);
    const attendances = MOCK_ATTENDANCES.filter(
      (att) => att.studentId === studentId && sessionIds.includes(att.sessionId)
    );

    return {
      classInfo: cls,
      subject,
      teacher,
      schedules,
      contentUnits,
      assignments,
      submissions: studentSubmissions,
      sessions,
      attendances,
    };
  },

  /**
   * Lấy lịch học theo tuần / danh sách buổi học của học sinh
   */
  async getSchedule(studentId = DEFAULT_STUDENT_ID) {
    const enrolledClasses = await this.getEnrolledClasses(studentId);
    const classIds = enrolledClasses.map((c) => c.classId);

    const sessions = MOCK_CLASS_SESSIONS.filter((sess) => classIds.includes(sess.classId));
    return {
      classes: enrolledClasses,
      sessions,
    };
  },

  /**
   * Lấy lịch sử điểm danh của học sinh
   */
  async getAttendance(studentId = DEFAULT_STUDENT_ID) {
    const records = MOCK_ATTENDANCES.filter((a) => a.studentId === studentId);
    return records.map((rec) => {
      const session = MOCK_CLASS_SESSIONS.find((s) => s.sessionId === rec.sessionId);
      const cls = session ? MOCK_CLASSES.find((c) => c.classId === session.classId) : null;
      return {
        ...rec,
        session,
        class: cls,
      };
    });
  },

  /**
   * Lấy danh sách hóa đơn học phí của học sinh
   */
  async getInvoices(studentId = DEFAULT_STUDENT_ID): Promise<TuitionInvoice[]> {
    return MOCK_TUITION_INVOICES.filter((inv) => inv.studentId === studentId);
  },

  /**
   * Lấy danh sách phản hồi / kiến nghị của học sinh (approval_requests với requestType = 'feedback')
   */
  async getFeedback(studentId = DEFAULT_STUDENT_ID): Promise<ApprovalRequest[]> {
    return MOCK_APPROVAL_REQUESTS.filter(
      (req) => req.requestType === 'feedback' && (req.studentId === studentId || req.requestedBy === studentId)
    );
  },

  /**
   * Gửi phản hồi / góp ý mới từ học sinh
   */
  async submitFeedback(payload: {
    studentId: number;
    title: string;
    description: string;
    classId?: number | null;
  }): Promise<ApprovalRequest> {
    const nextId = MOCK_APPROVAL_REQUESTS.length + 1;
    const newRequest: ApprovalRequest = {
      requestId: nextId,
      requestCode: `AR${String(nextId).padStart(4, '0')}`,
      requestType: 'feedback',
      title: payload.title,
      description: payload.description,
      studentId: payload.studentId,
      invoiceId: null,
      classId: payload.classId || null,
      requestedBy: payload.studentId,
      reviewedBy: null,
      priority: 'medium',
      status: 'pending',
      reason: payload.title ? `[${payload.title}] ${payload.description}` : payload.description,
      reviewNotes: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };

    MOCK_APPROVAL_REQUESTS.unshift(newRequest);
    return newRequest;
  },

  /**
   * Lấy danh sách thông báo của học sinh
   */
  async getNotifications(studentId = DEFAULT_STUDENT_ID): Promise<Notification[]> {
    return MOCK_NOTIFICATIONS.filter(
      (n) => n.userId === null || n.userId === studentId
    );
  },
};
