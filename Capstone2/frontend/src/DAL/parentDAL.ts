import type { User } from '../BLL/models/User';
import type { TuitionInvoice } from '../BLL/models/TuitionInvoice';
import type { Payment } from '../BLL/models/Payment';
import type { ApprovalRequest } from '../BLL/models/ApprovalRequest';
import type { Notification } from '../BLL/models/Notification';

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

// Mặc định phụ huynh đang đăng nhập là Lê Văn Nam (PAR001, UserId = 9)
export const DEFAULT_PARENT_ID = 9;

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
              monday: 'Thứ 2',
              tuesday: 'Thứ 3',
              wednesday: 'Thứ 4',
              thursday: 'Thứ 5',
              friday: 'Thứ 6',
              saturday: 'Thứ 7',
              sunday: 'Chủ nhật',
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

        let badge = 'Toán';
        let subjectClass = 'subject-toan';
        if (subject?.subjectCode === 'PHYS') {
          badge = 'Vật Lý';
          subjectClass = 'subject-vat-ly';
        } else if (subject?.subjectCode === 'CHEM') {
          badge = 'Hóa Học';
          subjectClass = 'subject-hoa-hoc';
        } else if (subject?.subjectCode === 'ENG') {
          badge = 'Tiếng Anh';
          subjectClass = 'subject-tieng-anh';
        }

        classItems.push({
          id: cls.classId,
          name: cls.className,
          subject: subject ? subject.subjectName : 'Chung',
          subjectClass,
          badge,
          teacher: teacher ? teacher.fullName : 'Chưa phân công',
          teacherInitials,
          schedule: scheduleText || 'Chưa xếp lịch',
          room: cls.room || 'Chưa có phòng',
          attendedLessons,
          totalLessons: sessions.length || 10,
          notes: 'Điểm danh đầy đủ, tương tác tích cực trên lớp.',
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
        name: studentUser.fullName,
        avatar: avatarInitials,
        grade: 'Lớp 9',
        school: 'THCS Lê Quý Đôn',
        dob: studentUser.dateOfBirth ? studentUser.dateOfBirth.slice(0, 10) : '2010-02-14',
        phone: studentUser.phone,
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
      throw new Error(`Không tìm thấy hóa đơn #${invoiceId}`);
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
      note: `Thanh toán online qua ${paymentMethod.toUpperCase()} bởi phụ huynh ID ${parentId}`,
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
};
