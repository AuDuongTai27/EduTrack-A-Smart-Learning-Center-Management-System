import type { User } from '../BLL/models/User';
import type { TuitionInvoice } from '../BLL/models/TuitionInvoice';
import type { Payment } from '../BLL/models/Payment';
import type { ApprovalRequest } from '../BLL/models/ApprovalRequest';
import type { Notification } from '../BLL/models/Notification';
import { learningApi } from '../api/learningApi';

import {
  MOCK_USERS,
  MOCK_PARENT_STUDENTS,
  MOCK_CLASSES,
  MOCK_SUBJECTS,
  MOCK_STUDENT_CLASSES,
  MOCK_TEACHER_CLASSES,
  MOCK_CLASS_SCHEDULES,
  MOCK_CLASS_SESSIONS,
  MOCK_ATTENDANCES,
  MOCK_SUBMISSIONS,
  MOCK_TUITION_INVOICES,
  MOCK_PAYMENTS,
  MOCK_APPROVAL_REQUESTS,
  MOCK_NOTIFICATIONS,
} from './mockData';

import { getSelectedUserId } from '../BLL/services/userSelection';

// Mặc định phụ huynh đang đăng nhập là Lê Văn Nam (PAR001, UserId = 9)
export const DEFAULT_PARENT_ID = 9;

export function getActiveParentId(): number {
  return getSelectedUserId('parent');
}

export interface ChildClassItem {
  id: number;
  name: string;
  subject: string;
  subjectClass: string;
  badge: string;
  teacher: string;
  teacherInitials: string;
  schedule: string;
  room: string;
  attendedLessons: number;
  totalLessons: number;
  notes: string;
  isCompleted?: boolean;
}

export interface ChildStudent {
  id: number;
  code: string;
  name: string;
  avatar: string;
  grade: string;
  school: string;
  dob: string;
  phone?: string;
  classesCount: number;
  attendanceRate: number;
  averageScore: number;
  unpaidAmount: number;
  classes: ChildClassItem[];
}

export interface PendingLinkRequest {
  id: string;
  studentName: string;
  dob: string;
  school: string;
  parentPhone: string;
  note?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Service DAL dành cho Phụ huynh (Parent)
 * Kết nối dữ liệu quan hệ ParentStudent, theo dõi con, thanh toán học phí online, gửi phản hồi
 */
export const parentDAL = {
  /**
   * Lấy thông tin tài khoản phụ huynh
   */
  async getProfile(parentId = DEFAULT_PARENT_ID): Promise<User | null> {
    const parent = MOCK_USERS.find((u) => u.userId === parentId);
    return parent ? { ...parent } : null;
  },

  /**
   * Lấy đồng bộ danh sách con được liên kết (phục vụ khởi tạo state ngay lập tức)
   */
  getLinkedChildrenSync(parentId = DEFAULT_PARENT_ID): ChildStudent[] {
    const links = MOCK_PARENT_STUDENTS.filter((ps) => ps.parentId === parentId);
    const children: ChildStudent[] = [];

    for (const link of links) {
      const studentUser = MOCK_USERS.find((u) => u.userId === link.studentId);
      if (!studentUser) continue;

      const studentClasses = MOCK_STUDENT_CLASSES.filter(
        (sc) => sc.studentId === studentUser.userId && sc.status === 'active'
      );

      const classItems: ChildClassItem[] = [];

      for (const sc of studentClasses) {
        const cls = MOCK_CLASSES.find((c) => c.classId === sc.classId);
        if (!cls) continue;

        const subject = MOCK_SUBJECTS.find((s) => s.subjectId === cls.subjectId);
        const tc = MOCK_TEACHER_CLASSES.find((t) => t.classId === cls.classId && t.status === 'active');
        const teacher = tc ? MOCK_USERS.find((u) => u.userId === tc.teacherId) : null;
        const teacherInitials = teacher
          ? teacher.fullName
              .split(' ')
              .filter(Boolean)
              .slice(-2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
          : 'GV';

        const schedules = MOCK_CLASS_SCHEDULES.filter((s) => s.classId === cls.classId);
        const scheduleText = schedules
          .map((s) => {
            const dayMap: Record<string, string> = {
              monday: 'Mon',
              tuesday: 'Tue',
              wednesday: 'Wed',
              thursday: 'Thu',
              friday: 'Fri',
              saturday: 'Sat',
              sunday: 'Sun',
            };
            return `${dayMap[s.dayOfWeek.toLowerCase()] || s.dayOfWeek} (${s.startTime.slice(0, 5)} - ${s.endTime.slice(0, 5)})`;
          })
          .join(', ');

        const sessions = MOCK_CLASS_SESSIONS.filter((sess) => sess.classId === cls.classId);
        const sessionIds = sessions.map((s) => s.sessionId);
        const attendances = MOCK_ATTENDANCES.filter(
          (a) => a.studentId === studentUser.userId && sessionIds.includes(a.sessionId)
        );
        const attendedLessons = attendances.filter((a) => a.status === 'present').length;

        let badge = 'Math';
        let subjectClass = 'subject-toan';
        if (subject?.subjectCode === 'PHYS') {
          badge = 'Physics';
          subjectClass = 'subject-vat-ly';
        } else if (subject?.subjectCode === 'CHEM') {
          badge = 'Chemistry';
          subjectClass = 'subject-hoa-hoc';
        } else if (subject?.subjectCode === 'ENG') {
          badge = 'English';
          subjectClass = 'subject-tieng-anh';
        }

        classItems.push({
          id: cls.classId,
          name: `[MOCK] ${cls.className}`,
          subject: subject ? subject.subjectName : 'General',
          subjectClass,
          badge,
          teacher: teacher ? `[MOCK] ${teacher.fullName}` : 'Unassigned',
          teacherInitials,
          schedule: scheduleText || 'Unscheduled',
          room: cls.room || 'No room assigned',
          attendedLessons,
          totalLessons: sessions.length || 10,
          notes: '[MOCK] Full attendance, actively participates in class.',
        });
      }

      const allAttendances = MOCK_ATTENDANCES.filter((a) => a.studentId === studentUser.userId);
      const presentCount = allAttendances.filter((a) => a.status === 'present').length;
      const attendanceRate =
        allAttendances.length > 0 ? Math.round((presentCount / allAttendances.length) * 100) : 100;

      const studentSubs = MOCK_SUBMISSIONS.filter(
        (sub) => sub.studentId === studentUser.userId && sub.score !== null
      );
      const avgScore =
        studentSubs.length > 0
          ? Number(
              (
                studentSubs.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentSubs.length
              ).toFixed(1)
            )
          : 9.0;

      const invoices = MOCK_TUITION_INVOICES.filter(
        (inv) => inv.studentId === studentUser.userId && (inv.status === 'unpaid' || inv.status === 'overdue')
      );
      const unpaidAmount = invoices.reduce((acc, curr) => acc + curr.amountDue, 0);

      const avatarInitials = studentUser.fullName
        .split(' ')
        .filter(Boolean)
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase();

      children.push({
        id: studentUser.userId,
        code: studentUser.userCode,
        name: `[MOCK] ${studentUser.fullName}`,
        avatar: avatarInitials,
        grade: '[MOCK] Grade 9',
        school: '[MOCK] Le Quy Don Secondary School',
        dob: studentUser.dateOfBirth ? studentUser.dateOfBirth.slice(0, 10) : '2010-02-14',
        phone: studentUser.phone ?? undefined,
        classesCount: classItems.length,
        attendanceRate,
        averageScore: avgScore,
        unpaidAmount,
        classes: classItems,
      });
    }

    return children;
  },

  /**
   * Lấy danh sách con được liên kết với phụ huynh (Async - chuẩn API)
   */
  async getLinkedChildren(parentId = DEFAULT_PARENT_ID): Promise<ChildStudent[]> {
    return this.getLinkedChildrenSync(parentId);
  },

  /**
   * Lấy danh sách hóa đơn học phí của một học sinh con
   */
  async getChildInvoices(studentId: number): Promise<TuitionInvoice[]> {
    return MOCK_TUITION_INVOICES.filter((inv) => inv.studentId === studentId);
  },

  /**
   * Thực hiện thanh toán học phí online (bank_transfer, vnpay, momo)
   * Cập nhật trạng thái hóa đơn sang 'paid' và ghi nhận giao dịch
   */
  async payInvoice(
    invoiceId: number,
    paymentMethod: 'bank_transfer' | 'vnpay' | 'momo',
    amount: number,
    parentId = DEFAULT_PARENT_ID
  ): Promise<{ success: boolean; payment: Payment; invoice: TuitionInvoice }> {
    const invoice = MOCK_TUITION_INVOICES.find((i) => i.invoiceId === invoiceId);
    if (!invoice) {
      throw new Error(`Invoice #${invoiceId} not found`);
    }

    invoice.status = 'paid';

    const nextPaymentId = MOCK_PAYMENTS.length + 1;
    const newPayment: Payment = {
      paymentId: nextPaymentId,
      invoiceId: invoice.invoiceId,
      amount,
      paymentMethod,
      transactionCode: `PAY-${Date.now().toString().slice(-8)}`,
      paidAt: new Date().toISOString(),
      paidByUserId: parentId,
      recordedBy: 2, // Admin staff tự động xác nhận
      note: `Online payment via ${paymentMethod.toUpperCase()} by parent ID ${parentId}`,
    };

    MOCK_PAYMENTS.push(newPayment);

    return {
      success: true,
      payment: newPayment,
      invoice: { ...invoice },
    };
  },

  /**
   * Lấy lịch sử điểm danh của con
   */
  async getChildAttendance(studentId: number) {
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
   * Lấy phản hồi của phụ huynh (gồm yêu cầu liên kết học sinh, khiếu nại, góp ý)
   */
  async getFeedback(parentId = DEFAULT_PARENT_ID): Promise<ApprovalRequest[]> {
    return MOCK_APPROVAL_REQUESTS.filter(
      (req) => req.requestType === 'feedback' && req.requestedBy === parentId
    );
  },

  /**
   * Gửi phản hồi / Yêu cầu từ phụ huynh (ApprovalRequest type: 'feedback')
   */
  async submitFeedback(payload: {
    parentId: number;
    title: string;
    description: string;
    studentId?: number | null;
  }): Promise<ApprovalRequest> {
    const nextId = MOCK_APPROVAL_REQUESTS.length + 1;
    const newRequest: ApprovalRequest = {
      requestId: nextId,
      requestCode: `AR${String(nextId).padStart(4, '0')}`,
      requestType: 'feedback',
      title: payload.title,
      description: payload.description,
      studentId: payload.studentId || null,
      invoiceId: null,
      classId: null,
      requestedBy: payload.parentId,
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
   * Lấy danh sách thông báo của phụ huynh
   */
  async getNotifications(parentId = DEFAULT_PARENT_ID): Promise<Notification[]> {
    return MOCK_NOTIFICATIONS.filter((n) => n.userId === null || n.userId === parentId);
  },

  /**
   * Lấy danh sách tất cả lớp học liên kết cho phụ huynh
   */
  async getAllClasses(parentId = DEFAULT_PARENT_ID): Promise<ChildClassItem[]> {
    const targetParentId = parentId || getActiveParentId() || DEFAULT_PARENT_ID;
    try {
      const apiChildren = await learningApi.getParentChildrenOverview(targetParentId);
      if (Array.isArray(apiChildren) && apiChildren.length > 0) {
        const allClasses: ChildClassItem[] = [];
        const seen = new Set<number>();
        for (const child of apiChildren) {
          for (const cls of child.classes || []) {
            if (!seen.has(cls.id)) {
              seen.add(cls.id);
              allClasses.push({
                id: cls.id,
                name: cls.name,
                subject: cls.subject,
                subjectClass: cls.subjectClass,
                badge: cls.badge,
                teacher: cls.teacher,
                teacherInitials: cls.teacherInitials,
                schedule: cls.schedule,
                room: cls.room,
                attendedLessons: cls.attendedLessons,
                totalLessons: cls.totalLessons,
                notes: cls.notes,
              });
            }
          }
        }
        if (allClasses.length > 0) return allClasses;
      }
    } catch {
      // Fallback to local mock data below
    }
    const linkedChildren = this.getLinkedChildrenSync(targetParentId);
    const fallbackClasses = linkedChildren[0]?.classes || [];
    return fallbackClasses;
  },

  /**
   * Lấy chi tiết lớp học theo ID trong phạm vi các con phụ huynh
   */
  async getChildClassById(classId: number, parentId = DEFAULT_PARENT_ID): Promise<ChildClassItem | null> {
    const classes = await this.getAllClasses(parentId);
    const match = classes.find((c) => c.id === classId);
    if (match) return match;

    const linkedChildren = this.getLinkedChildrenSync(parentId);
    for (const child of linkedChildren) {
      const c = child.classes.find((item) => item.id === classId);
      if (c) return c;
    }
    return null;
  },
};


