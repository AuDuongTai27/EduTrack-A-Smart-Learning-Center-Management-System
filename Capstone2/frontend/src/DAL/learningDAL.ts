import { learningApi } from '../api/learningApi';
import type {
  StudentEnrolledClassApiDto,
  ClassSessionAttendanceItemApiDto,
  StudentSubmissionDetailApiDto,
  StudentTuitionOverviewApiDto,
  LearnerFeedbackItemApiDto,
  CreateLearnerFeedbackPayload,
  UpdateLearnerFeedbackPayload,
  LearnerNotificationItemApiDto,
  LearnerProfileApiDto,
  UpdateLearnerProfilePayload,
  ParentChildOverviewApiDto,
  TuitionInvoiceItemApiDto,
  CreateVnPayPaymentResponseApiDto,
} from '../BLL/models/learning';
import {
  type StudentProfileData,
} from '../GUIs/components/student/profile/profileData';
import {
  type FeedbackApprovalRequest,
} from '../GUIs/components/student/feedback/feedbackData';
import {
  type NotificationItem,
} from '../GUIs/components/student/notifications/notificationsData';
import {
  type EnrolledClassItem,
} from '../GUIs/components/student/classes/classesData';
import {
  type ClassDetailItem,
  type MaterialItem,
  type AssignmentItem,
} from '../GUIs/components/student/classDetail/classDetailData';
import {
  type AssignmentDetailItem,
  type SubmissionStatus,
} from '../GUIs/components/student/assignmentDetail/assignmentDetailData';
import {
  type SessionItem,
} from '../GUIs/components/student/schedule/scheduleData';
import {
  type ProgressClassItem,
  type ProgressFeedback,
} from '../GUIs/components/student/progress/progressData';
import type {
  TuitionBill,
  TuitionHistoryItem,
} from '../GUIs/components/student/tuition/tuitionData';
import {
  DEFAULT_PARENT_ID,
  type ChildStudent,
} from './parentDAL';
import { confirmedUpload } from '../api/realData';
import { getAuthUser } from '../api/authApi';

// Legacy call-site sentinel; authenticated identity is resolved before requests.
export const DEFAULT_STUDENT_ID = 6;

function resolveStudentId(studentId?: number): number {
  const auth = getAuthUser();
  if (!auth?.userId) throw new Error('Please sign in to view learning data.');
  if (auth.primaryRole === 'student' || auth.roles?.includes('student')) return auth.userId;
  if (!studentId || studentId <= 0) throw new Error('Select a linked student.');
  return studentId;
}

function resolveParentId(_parentId?: number): number {
  const auth = getAuthUser();
  if (!auth?.userId) throw new Error('Please sign in to view parent data.');
  return auth.userId;
}

export interface StudentDashboardViewModel {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarInitials: string;
  enrolledClassesCount: number;
  pendingAssignmentsCount: number;
  classes: EnrolledClassItem[];
  source: 'api';
}

export interface StudentClassDetailViewModel {
  cls: ClassDetailItem;
  materials: MaterialItem[];
  assignments: AssignmentItem[];
  sessions: ClassSessionAttendanceItemApiDto[];
  attendedLessons: number;
  totalLessons: number;
  latestTeacherNote: string;
  feedbacks?: ProgressFeedback[];
  feedbacksError?: string;
  source: 'api';
}

export interface StudentAssignmentDetailViewModel {
  asg: AssignmentDetailItem;
  status: SubmissionStatus;
  submittedFileName: string;
  submittedMeta: string;
  submission?: StudentSubmissionDetailApiDto | null;
  source: 'api';
}

export interface StudentProgressViewModel {
  studentId: number;
  studentName: string;
  overallAttendanceRate: number;
  attendedSessionsCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalSessionsCount: number;
  enrolledClassesCount: number;
  currentClasses: ProgressClassItem[];
  pastClasses: ProgressClassItem[];
  source: 'api';
}

export interface StudentTuitionViewModel {
  studentId: number;
  studentName: string;
  totalUnpaidAmount: number;
  bill: TuitionBill;
  history: TuitionHistoryItem[];
  source: 'api';
  unpaidInvoices?: TuitionInvoiceItemApiDto[];
}

function fmtVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
}

function mapApiTuitionToViewModel(apiData: StudentTuitionOverviewApiDto): StudentTuitionViewModel {
  const totalUnpaid = apiData.totalUnpaidAmount || 0;
  const unpaidItems = (apiData.unpaidInvoices || []).map((inv) => ({
    name: `${inv.className} (Month ${inv.periodMonth}/${inv.periodYear})`,
    amount: fmtVnd(inv.amountDue),
  }));

  const bill: TuitionBill = {
    period: unpaidItems.length || apiData.paymentHistory?.length ? (apiData.period || 'Tuition overview') : 'Tuition overview',
    totalAmount: fmtVnd(totalUnpaid),
    dueDate: unpaidItems.length ? (apiData.dueDate || '') : '',
    remainingDaysText:
      apiData.remainingDaysText ||
      (totalUnpaid > 0 ? 'Tuition payment due' : 'Completed all tuition for this term'),
    items: unpaidItems,
    subTotal: fmtVnd(totalUnpaid),
  };

  const history: TuitionHistoryItem[] = (apiData.paymentHistory || []).map((p) => ({
    id: p.paymentId,
    period: p.period,
    amount: fmtVnd(p.amount),
    date: p.paidAt,
    status: p.status || 'Paid',
  }));

  return {
    studentId: apiData.studentId,
    studentName: apiData.studentName,
    totalUnpaidAmount: totalUnpaid,
    bill,
    history,
    source: 'api',
    unpaidInvoices: apiData.unpaidInvoices || [],
  };
}

function mapSubjectTheme(subjectCode?: string, subjectName?: string): {
  subjectThemeClass: string;
  badge: string;
} {
  const combined = `${subjectCode || ''} ${subjectName || ''}`.toUpperCase();
  if (combined.includes('PHYS') || combined.includes('VAT') || combined.includes('LY') || combined.includes('LÝ')) {
    return { subjectThemeClass: 'theme-physics', badge: subjectName || 'Physics' };
  }
  if (combined.includes('CHEM') || combined.includes('HOA') || combined.includes('HÓA')) {
    return { subjectThemeClass: 'theme-chemistry', badge: subjectName || 'Chemistry' };
  }
  if (combined.includes('ENG') || combined.includes('ANH') || combined.includes('IELTS')) {
    return { subjectThemeClass: 'theme-english', badge: subjectName || 'English' };
  }
  if (combined.includes('LIT') || combined.includes('VAN') || combined.includes('VĂN')) {
    return { subjectThemeClass: 'theme-literature', badge: subjectName || 'Literature' };
  }
  if (combined.includes('BIO') || combined.includes('SINH')) {
    return { subjectThemeClass: 'theme-biology', badge: subjectName || 'Biology' };
  }
  return { subjectThemeClass: 'theme-math', badge: subjectName || 'Subject not provided' };
}

function mapSubjectBannerTheme(subjectCode?: string, subjectName?: string): {
  subjectClass: string;
  accent: string;
  grad: string;
} {
  const brandGreenGrad = 'linear-gradient(135deg, #065F46 0%, #078444 60%, #10B981 100%)';
  const brandGreenAccent = '#078444';

  const combined = `${subjectCode || ''} ${subjectName || ''}`.toUpperCase();
  if (combined.includes('PHYS') || combined.includes('VAT') || combined.includes('LY') || combined.includes('LÝ')) {
    return {
      subjectClass: 'subject-vat-ly',
      accent: brandGreenAccent,
      grad: brandGreenGrad,
    };
  }
  if (combined.includes('CHEM') || combined.includes('HOA') || combined.includes('HÓA')) {
    return {
      subjectClass: 'subject-hoa-hoc',
      accent: brandGreenAccent,
      grad: brandGreenGrad,
    };
  }
  if (combined.includes('ENG') || combined.includes('ANH') || combined.includes('IELTS')) {
    return {
      subjectClass: 'subject-tieng-anh',
      accent: brandGreenAccent,
      grad: brandGreenGrad,
    };
  }
  if (combined.includes('LIT') || combined.includes('VAN') || combined.includes('VĂN')) {
    return {
      subjectClass: 'subject-ngu-van',
      accent: brandGreenAccent,
      grad: brandGreenGrad,
    };
  }
  if (combined.includes('BIO') || combined.includes('SINH')) {
    return {
      subjectClass: 'subject-sinh-hoc',
      accent: brandGreenAccent,
      grad: brandGreenGrad,
    };
  }
  return {
    subjectClass: 'subject-toan',
    accent: brandGreenAccent,
    grad: brandGreenGrad,
  };
}

function mapProgressTheme(subjectCode?: string, subjectName?: string, index = 0): {
  colorTheme: string;
  icon: string;
} {
  const combined = `${subjectCode || ''} ${subjectName || ''}`.toUpperCase();
  if (combined.includes('PHYS') || combined.includes('VAT') || combined.includes('LY') || combined.includes('LÝ')) {
    return { colorTheme: 'prog-purple', icon: 'bi-lightning-charge' };
  }
  if (combined.includes('CHEM') || combined.includes('HOA') || combined.includes('HÓA')) {
    return { colorTheme: 'prog-orange', icon: 'bi-droplet' };
  }
  if (combined.includes('ENG') || combined.includes('ANH') || combined.includes('IELTS')) {
    return { colorTheme: 'prog-green', icon: 'bi-translate' };
  }
  const colorThemes = ['prog-blue', 'prog-purple', 'prog-orange', 'prog-green'];
  return { colorTheme: colorThemes[index % colorThemes.length], icon: 'bi-calculator' };
}

function mapApiClassToEnrolledItem(dto: StudentEnrolledClassApiDto): EnrolledClassItem {
  const { subjectThemeClass, badge } = mapSubjectTheme(dto.subjectCode, dto.subjectName);
  const total = dto.totalLessons;
  const attended = dto.attendedLessons;
  const attendanceRate = typeof total === 'number' && total > 0 && typeof attended === 'number'
    ? Math.round((attended * 100) / total) : undefined;

  return {
    classId: dto.classId,
    className: dto.className,
    badge,
    subjectThemeClass,
    teacherName: dto.teacherName || 'Not assigned',
    teacherInitials: dto.teacherInitials || 'TC',
    scheduleText: dto.scheduleText || 'Updating schedule',
    room: dto.room || 'Not assigned',
    attendanceRate,
    attendedSessions: attended,
    totalSessions: total,
    isCompleted: dto.status === 'completed',
  };
}

function formatDateTimeVi(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    }
  } catch {
    // ignore
  }
  return dateStr;
}

export function mapApiFeedbackToViewModel(
  dto: LearnerFeedbackItemApiDto,
  fallbackRole: 'parent' | 'student' = 'student',
  fallbackName = ''
): FeedbackApprovalRequest {
  const statusLower = (dto.status || 'pending').toLowerCase();
  const canEdit =
    dto.canEdit !== undefined
      ? dto.canEdit
      : statusLower === 'pending' && (dto.reviewedBy === null || dto.reviewedBy === undefined);

  let statusLabel = dto.statusLabel || '';
  if (!statusLabel) {
    if (statusLower === 'approved') statusLabel = 'Resolved';
    else if (statusLower === 'rejected') statusLabel = 'Rejected';
    else if (dto.reviewedBy) statusLabel = 'Pending';
    else statusLabel = 'Pending Review';
  }

  const role: 'parent' | 'student' =
    dto.requesterRole === 'parent'
      ? 'parent'
      : dto.requesterRole === 'student'
        ? 'student'
        : fallbackRole;

  return {
    id: dto.requestId,
    requestCode: dto.requestCode,
    requestType: 'feedback',
    title: dto.title || `Feedback #${dto.requestCode}`,
    description: dto.description || '',
    senderName: dto.requesterName || fallbackName,
    senderRole: role,
    className: dto.className || undefined,
    createdAt: formatDateTimeVi(dto.createdAt) || 'Just now',
    status: (statusLower === 'approved' || statusLower === 'rejected' ? statusLower : 'pending') as
      | 'pending'
      | 'approved'
      | 'rejected',
    statusLabel,
    canEdit,
    priority: dto.priority || 'medium',
    reviewedBy: dto.reviewerName || (dto.reviewedBy ? 'Admin Staff' : undefined),
    reviewedAt: formatDateTimeVi(dto.reviewedAt) || undefined,
    reviewNotes: dto.reviewNotes || undefined,
  };
}

export function mapApiLearnerNotifToStudentItem(dto: LearnerNotificationItemApiDto): NotificationItem {
  let category: NotificationItem['category'] = 'system';
  const typeLower = (dto.type || '').toLowerCase();
  if (
    typeLower.includes('class') ||
    typeLower.includes('homework') ||
    typeLower.includes('assignment') ||
    typeLower.includes('schedule')
  ) {
    category = 'class';
  } else if (typeLower.includes('tuition') || typeLower.includes('payment') || typeLower.includes('fee')) {
    category = 'payment';
  } else if (typeLower.includes('message')) {
    category = 'message';
  } else if (typeLower.includes('achievement')) {
    category = 'achievement';
  }

  return {
    id: dto.notificationId,
    category,
    title: dto.title,
    summary: dto.content,
    timestamp: formatDateTimeVi(dto.createdAt) || 'Just now',
    unread: !dto.isRead,
  };
}

function mapApiChildrenListToChildStudents(apiChildren: ParentChildOverviewApiDto[]): ChildStudent[] {
  return (apiChildren || []).map((child) => ({
    id: child.id,
    code: child.code,
    name: child.name,
    avatar: child.avatar,
    grade: child.grade,
    school: child.school,
    dob: child.dob,
    phone: child.phone,
    classesCount: child.classesCount,
    attendanceRate: child.attendanceRate,
    averageScore: child.averageScore,
    unpaidAmount: child.unpaidAmount,
    classes: (child.classes || []).map((cls) => ({
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
    })),
  }));
}

function mapApiProfileToStudentProfile(dto: LearnerProfileApiDto): StudentProfileData {
  return {
    fullName: dto.fullName || '',
    dob: dto.dateOfBirth ? dto.dateOfBirth.split('T')[0] : '',
    gender: dto.gender || '',
    enrollDate: dto.enrolledSince ? dto.enrolledSince.split('T')[0] : '',
    address: dto.address || '',
    phone: dto.phone || '',
    email: dto.email || '',
    avatarUrl: dto.avatarUrl || '',
  };
}

/**
 * [Bounded Context: Learning]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 3 (Student & Parent)
 */
const LOCAL_READ_NOTIFS_KEY = 'edutrack_confirmed_read_notification_ids';

export function getLocalReadNotificationIds(userId?: number): Set<number> {
  try {
    const key = `${LOCAL_READ_NOTIFS_KEY}_${getAuthUser()?.userId || userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // fallback
  }
  return new Set();
}

export function saveLocalReadNotificationId(id: number, userId?: number) {
  try {
    const key = `${LOCAL_READ_NOTIFS_KEY}_${getAuthUser()?.userId || userId}`;
    const set = getLocalReadNotificationIds(userId);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function saveAllLocalReadNotificationIds(ids: number[], userId?: number) {
  try {
    const key = `${LOCAL_READ_NOTIFS_KEY}_${getAuthUser()?.userId || userId}`;
    const set = getLocalReadNotificationIds(userId);
    ids.forEach((id) => set.add(id));
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export const learningDAL = {
  getLocalReadIds(userId?: number): Set<number> {
    return getLocalReadNotificationIds(userId);
  },

  /**
   * Lấy số lượng thông báo chưa đọc của Học sinh
   */
  async getStudentUnreadCount(studentId = DEFAULT_STUDENT_ID): Promise<number> {
    const targetStudentId = resolveStudentId(studentId);
    const notifs = await this.getStudentNotifications(targetStudentId);
    return notifs.filter((n) => n.unread).length;
  },

  /**
   * Lấy số lượng thông báo chưa đọc của Phụ huynh
   */
  async getParentUnreadCount(
    parentId = DEFAULT_PARENT_ID,
    studentId?: number
  ): Promise<number> {
    const targetParentId = resolveParentId(parentId);
    const notifs = await this.getParentNotifications(targetParentId, studentId);
    return notifs.filter((n) => !n.isRead).length;
  },
  /**
   * Lấy toàn bộ dữ liệu Dashboard của Học sinh từ Backend
   */
  async getStudentDashboard(studentId = DEFAULT_STUDENT_ID): Promise<StudentDashboardViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const apiData = await learningApi.getStudentDashboard(targetStudentId);
    if (apiData) {
      if (apiData.studentId !== targetStudentId) throw new Error("Account data did not match the signed-in user.");
      const mappedClasses = (apiData.classes || []).map(mapApiClassToEnrolledItem);
      return {
        studentId: apiData.studentId,
        studentCode: apiData.studentCode,
        fullName: apiData.fullName,
        avatarInitials: apiData.avatarInitials || 'ST',
        enrolledClassesCount: apiData.enrolledClassesCount ?? mappedClasses.length,
        pendingAssignmentsCount: apiData.pendingAssignmentsCount ?? 0,
        classes: mappedClasses,
        source: 'api',
      };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy danh sách các con đã liên kết kèm chỉ số học tập & lớp học từ Backend cho Phụ huynh
   */
  async getParentChildrenOverview(parentId = DEFAULT_PARENT_ID): Promise<ChildStudent[]> {
    const targetParentId = resolveParentId(parentId);
    const apiChildren = await learningApi.getParentChildrenOverview(targetParentId);
    if (Array.isArray(apiChildren)) {
      return apiChildren.map((child) => ({
        id: child.id,
        code: child.code,
        name: child.name,
        avatar: child.avatar,
        grade: child.grade,
        school: child.school,
        dob: child.dob,
        phone: child.phone,
        classesCount: child.classesCount,
        attendanceRate: child.attendanceRate,
        averageScore: child.averageScore,
        unpaidAmount: child.unpaidAmount,
        classes: (child.classes || []).map((cls) => ({
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
        })),
      }));
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy chi tiết lớp học (kèm tài liệu ContentUnits, bài tập Assignments + trạng thái nộp & lịch sử buổi học)
   */
  async getStudentClassDetail(
    classId: number,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentClassDetailViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const apiData = await learningApi.getStudentClassDetail(targetStudentId, classId);
    if (apiData) {
      const theme = mapSubjectBannerTheme(apiData.subjectCode, apiData.subjectName);
      const cls: ClassDetailItem = {
        id: apiData.classId,
        name: apiData.className,
        subject: apiData.subjectName,
        subjectClass: theme.subjectClass,
        grad: theme.grad,
        accent: theme.accent,
        teacher: apiData.teacherName || 'Not assigned',
        teacherInitials: apiData.teacherInitials || 'GV',
        taName: apiData.taName || '',
        taInitials: apiData.taInitials || '',
        taEmail: apiData.taEmail || '',
        taPhone: apiData.taPhone || '',
        schedule: apiData.schedule || 'Not scheduled',
        room: apiData.room || 'Not assigned',
        email: apiData.teacherEmail || '',
        phone: apiData.teacherPhone || '',
        description: apiData.description || '',
        studentCount: apiData.studentCount ?? 0,
      };

      const materials: MaterialItem[] = Array.isArray(apiData.materials)
        ? apiData.materials.map((m) => ({
          id: m.id,
          classId: m.classId,
          type: (m.type as 'PDF' | 'DOC' | 'PPT' | 'IMG') || 'PDF',
          fileName: m.fileName,
          description: m.description,
          uploadDate: m.uploadDate,
          uploadedBy: m.uploadedBy,
          sizeMb: m.sizeMb,
          fileUrl: m.fileUrl,
        }))
        : [];

      const assignments: AssignmentItem[] = Array.isArray(apiData.assignments)
        ? apiData.assignments.map((a) => ({
          id: a.id,
          classId: a.classId,
          title: a.title,
          dueDate: a.dueDate,
          status: (a.status as 'Chưa nộp' | 'Đã nộp' | 'Quá hạn') || 'Chưa nộp',
        }))
        : [];

      const feedbacks: ProgressFeedback[] = [];
      let feedbacksError: string | undefined;
      try {
        const progVm = await learningDAL.getStudentProgress(targetStudentId);
        const matchedClass = [...progVm.currentClasses, ...progVm.pastClasses].find(
          (c) => c.classId === classId || c.id === String(classId)
        );
        if (matchedClass && Array.isArray(matchedClass.feedbacks)) {
          feedbacks.push(...matchedClass.feedbacks);
        }
      } catch (fbErr) {
        feedbacksError = 'Unable to load evaluations. Please retry.';
        console.warn('[learningDAL] Không tải được feedbacks từ tiến độ:', fbErr);
      }

      const rawNote = apiData.latestTeacherNote?.trim();
      const isEmptyNote =
        !rawNote ||
        rawNote.toLowerCase().includes('chưa có nhận xét') ||
        rawNote.toLowerCase().includes('no teacher evaluation');

      if (!isEmptyNote && !feedbacks.some((f) => f.quote === rawNote)) {
        feedbacks.unshift({
          assignmentTitle: `[Periodic Evaluation] ${apiData.className}`,
          quote: rawNote,
          teacherName: apiData.teacherName || 'Lead Teacher',
          statusType: 'dat',
          statusIcon: 'bi-check2-all',
          statusLabel: 'Teacher Note',
          category: 'evaluation',
        });
      }

      return {
        cls,
        materials,
        assignments,
        sessions: apiData.sessions || [],
        attendedLessons: apiData.attendedLessons ?? 0,
        totalLessons: apiData.totalLessons ?? 0,
        latestTeacherNote: isEmptyNote ? '' : rawNote,
        feedbacks,
        feedbacksError,
        source: 'api',
      };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy thời khóa biểu tuần của Học sinh (hoặc Con của Phụ huynh)
   */
  async getStudentSchedule(studentId = DEFAULT_STUDENT_ID): Promise<SessionItem[]> {
    const targetStudentId = resolveStudentId(studentId);
    const apiSlots = await learningApi.getStudentSchedule(targetStudentId);
    if (Array.isArray(apiSlots)) {
      return apiSlots.map((slot) => {
        const theme = mapSubjectBannerTheme(slot.subjectCode, slot.subject);
        return {
          id: slot.id,
          className: slot.className,
          subject: slot.subject,
          startH: slot.startH,
          startM: slot.startM,
          endH: slot.endH,
          endM: slot.endM,
          teacher: slot.teacher,
          initials: slot.initials,
          avatarBg: theme.accent,
          room: slot.room,
          day: slot.day,
          status: slot.status || 'upcoming',
        };
      });
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy báo cáo Tiến độ học tập & Điểm danh của Học sinh (hoặc Con của Phụ huynh)
   */
  async getStudentProgress(studentId = DEFAULT_STUDENT_ID): Promise<StudentProgressViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const apiData = await learningApi.getStudentProgress(targetStudentId);
    if (apiData) {
      const mappedClasses: ProgressClassItem[] = (apiData.currentClasses || []).map(
        (cls, idx) => {
          const progTheme = mapProgressTheme(cls.subjectCode, cls.subjectName, idx);
          return {
            id: cls.id,
            classId: cls.classId,
            className: cls.className,
            subjectName: cls.subjectName,
            colorTheme: progTheme.colorTheme,
            icon: progTheme.icon,
            attended: cls.attended,
            total: cls.total,
            percentage: cls.percentage,
            isCompleted: cls.isCompleted,
            feedbacks: (cls.feedbacks || []).map((fb) => ({
              assignmentTitle: fb.assignmentTitle,
              quote: fb.quote,
              teacherName: fb.teacherName,
              statusType: fb.statusType,
              statusIcon: fb.statusIcon,
              statusLabel: fb.statusLabel,
              category: fb.category || (fb.assignmentTitle.includes('[Đánh giá') || fb.assignmentTitle.includes('[Evaluation') ? 'evaluation' : 'assignment'),
            })),
          };
        }
      );

      const currentClasses = mappedClasses.filter((c) => !c.isCompleted);
      const pastClasses = mappedClasses.filter((c) => c.isCompleted);

      const presentCount = apiData.presentCount ?? 0;
      const absentCount = apiData.absentCount ?? 0;
      const lateCount = apiData.lateCount ?? 0;
      const totalSessionsCount = presentCount + absentCount + lateCount;
      const attendedSessionsCount = presentCount;
      const overallAttendanceRate =
        totalSessionsCount > 0
          ? Math.round((presentCount * 100) / totalSessionsCount)
          : 0;

      return {
        studentId: apiData.studentId,
        studentName: apiData.studentName,
        overallAttendanceRate,
        attendedSessionsCount,
        presentCount,
        absentCount,
        lateCount,
        totalSessionsCount,
        enrolledClassesCount: apiData.enrolledClassesCount,
        currentClasses,
        pastClasses,
        source: 'api',
      };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy thông tin Hóa đơn học phí & Lịch sử giao dịch của đúng Học sinh đó
   */
  async getStudentTuition(studentId = DEFAULT_STUDENT_ID): Promise<StudentTuitionViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const apiData = await learningApi.getStudentTuition(targetStudentId);
    if (!apiData) {
      throw new Error('Failed to load tuition data from the system.');
    }
    return mapApiTuitionToViewModel(apiData);
  },

  /**
   * Phụ huynh thực hiện thanh toán toàn bộ học phí còn nợ cho con (hoặc theo danh sách kỳ được chọn)
   */
  async payStudentTuition(
    studentId = DEFAULT_STUDENT_ID,
    paymentMethod = 'bank_transfer',
    parentId = DEFAULT_PARENT_ID,
    transactionCode?: string,
    invoiceIds?: number[]
  ): Promise<StudentTuitionViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const targetParentId = resolveParentId(parentId);
    const apiData = await learningApi.payStudentTuition({
      studentId: targetStudentId,
      parentId: targetParentId,
      paymentMethod,
      transactionCode,
      invoiceIds,
    });
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('edutrack-notifications-invalidated', String(Date.now())); } catch { /* ignore */ }
      window.dispatchEvent(new StorageEvent('storage', { key: 'edutrack-notifications-invalidated' }));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    }
    return mapApiTuitionToViewModel(apiData);
  },

  /**
   * Tạo URL thanh toán học phí trực tuyến qua cổng VNPay Sandbox
   */
  async createVnPayPaymentUrl(
    studentId = DEFAULT_STUDENT_ID,
    parentId = DEFAULT_PARENT_ID,
    invoiceIds?: number[],
    returnUrl?: string
  ): Promise<CreateVnPayPaymentResponseApiDto> {
    const targetStudentId = resolveStudentId(studentId);
    const targetParentId = resolveParentId(parentId);
    const defaultReturnUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;
    return await learningApi.createVnPayPaymentUrl({
      studentId: targetStudentId,
      parentId: targetParentId,
      invoiceIds,
      returnUrl: returnUrl || defaultReturnUrl,
    });
  },

  /**
   * Xác thực kết quả trả về từ cổng VNPay Sandbox và cập nhật dữ liệu học phí
   */
  async verifyVnPayReturn(
    queryParams: Record<string, string>,
    studentId = DEFAULT_STUDENT_ID,
    parentId = DEFAULT_PARENT_ID
  ): Promise<{
    isSuccess: boolean;
    alreadyProcessed: boolean;
    responseCode: string;
    transactionNo: string;
    txnRef: string;
    bankCode: string;
    amountPaid: number;
    message: string;
    tuitionVm?: StudentTuitionViewModel;
  }> {
    const targetStudentId = resolveStudentId(studentId);
    const targetParentId = resolveParentId(parentId);
    const rawQueryString =
      typeof window !== 'undefined' ? window.location.search : undefined;
    const res = await learningApi.verifyVnPayReturn({
      studentId: targetStudentId,
      parentId: targetParentId,
      rawQueryString,
      queryParams,
    });

    if (res.isSuccess && typeof window !== 'undefined') {
      try { localStorage.setItem('edutrack-notifications-invalidated', String(Date.now())); } catch { /* ignore */ }
      window.dispatchEvent(new StorageEvent('storage', { key: 'edutrack-notifications-invalidated' }));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    }

    return {
      isSuccess: res.isSuccess,
      alreadyProcessed: res.alreadyProcessed,
      responseCode: res.responseCode,
      transactionNo: res.transactionNo,
      txnRef: res.txnRef,
      bankCode: res.bankCode,
      amountPaid: res.amountPaid,
      message: res.message,
      tuitionVm: res.tuitionOverview ? mapApiTuitionToViewModel(res.tuitionOverview) : undefined,
    };
  },

  /**
   * Khôi phục hóa đơn kỳ hiện tại về trạng thái chờ thanh toán (Phục vụ Demo)
   */
  async resetDemoTuition(studentId = DEFAULT_STUDENT_ID): Promise<StudentTuitionViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const apiData = await learningApi.resetDemoTuition(targetStudentId);
    return mapApiTuitionToViewModel(apiData);
  },

  /**
   * Lấy chi tiết Bài tập kèm bài đã nộp, điểm Giáo viên và điểm AI chấm sơ bộ
   */
  async getStudentAssignmentDetail(
    assignmentId: number,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentAssignmentDetailViewModel> {
    const targetStudentId = resolveStudentId(studentId);
    const apiData = await learningApi.getStudentAssignmentDetail(targetStudentId, assignmentId);
    if (apiData) {
      const sub = apiData.submission;
      const hasSubmitted = Boolean(sub);
      const status: SubmissionStatus = hasSubmitted ? 'submitted' : 'not-submitted';

      let scoreText: string | undefined;
      if (sub?.score !== null && sub?.score !== undefined) {
        scoreText = `${sub.score} / ${apiData.maxScore} (Graded by Teacher)`;
      } else if (sub?.aiScore !== null && sub?.aiScore !== undefined) {
        scoreText = `${sub.aiScore} / ${apiData.maxScore} (Preliminary AI score)`;
      } else {
        scoreText = `Pending grading (Max ${apiData.maxScore} pts)`;
      }

      const asg: AssignmentDetailItem = {
        id: apiData.assignmentId,
        title: apiData.title,
        class: apiData.className || 'Class not provided',
        dueDate: apiData.dueDate,
        defaultStatus: status,
        classId: apiData.classId,
        score: scoreText,
        maxScore: apiData.maxScore,
        description: apiData.description ?? '',
        fileUrl: apiData.fileUrl,
      };

      return {
        asg,
        status,
        submittedFileName: sub?.fileName || '',
        submittedMeta: sub ? `Submitted at ${sub.submittedAt} • Saved on system` : '',
        submission: sub,
        source: 'api',
      };
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Tải tệp bài làm học sinh lên máy chủ (POST /api/learning/submissions/upload)
   */
  async uploadSubmissionFile(file: File): Promise<{
    success: boolean;
    message: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  }> {
    return confirmedUpload(await learningApi.uploadSubmissionFile(file));
  },

  /**
   * Nộp bài tập mới hoặc cập nhật bài nộp của học sinh lên Backend
   */
  async submitHomework(
    assignmentId: number,
    fileName: string,
    fileSizeMb: string,
    studentId = DEFAULT_STUDENT_ID,
    fileUrl?: string
  ): Promise<StudentSubmissionDetailApiDto> {
    const targetStudentId = resolveStudentId(studentId);
    if (!fileUrl?.trim()) throw new Error('Upload a file before submitting.');
    const resolvedUrl = fileUrl;
    return await learningApi.submitHomework({
      assignmentId,
      studentId: targetStudentId,
      fileName,
      fileUrl: resolvedUrl,
      fileSizeText: `${fileSizeMb} MB`,
    });
  },

  /**
   * Xóa / Rút lại bài nộp trên Backend
   */
  async deleteSubmission(
    assignmentId: number,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<boolean> {
    const targetStudentId = resolveStudentId(studentId);
    return await learningApi.deleteSubmission(targetStudentId, assignmentId);
  },

  /**
   * Lấy danh sách Phản hồi & Đơn xin phép của Học sinh hoặc Phụ huynh
   */
  async getLearnerFeedbacks(
    userId: number,
    userRole: 'parent' | 'student',
    userName: string,
    studentId?: number
  ): Promise<FeedbackApprovalRequest[]> {
    const resolvedUser = userRole === 'parent' ? resolveParentId(userId) : resolveStudentId(userId);
    const resolvedStudent = userRole === 'parent' ? studentId : resolveStudentId(studentId);
    const apiList = await learningApi.getLearnerFeedbacks(resolvedUser, resolvedStudent);
    if (Array.isArray(apiList)) {
      return apiList.map((item) => mapApiFeedbackToViewModel(item, userRole, userName));
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Gửi Phản hồi mới lên Admin Staff (mặc định request_type = 'feedback')
   */
  async createLearnerFeedback(
    payload: CreateLearnerFeedbackPayload,
    userRole: 'parent' | 'student',
    userName: string
  ): Promise<FeedbackApprovalRequest> {
    const resolvedUser = userRole === 'parent' ? resolveParentId(payload.userId) : resolveStudentId(payload.userId);
    const createdDto = await learningApi.createLearnerFeedback({
      ...payload,
      userId: resolvedUser,
    });
    return mapApiFeedbackToViewModel(createdDto, userRole, userName);
  },

  /**
   * Chỉnh sửa Phản hồi khi đơn còn ở trạng thái 'Chưa xem xét giải quyết'
   */
  async updateLearnerFeedback(
    requestId: number,
    payload: UpdateLearnerFeedbackPayload,
    userRole: 'parent' | 'student',
    userName: string
  ): Promise<FeedbackApprovalRequest> {
    const resolvedUser = userRole === 'parent' ? resolveParentId(payload.userId) : resolveStudentId(payload.userId);
    const updatedDto = await learningApi.updateLearnerFeedback(requestId, {
      ...payload,
      userId: resolvedUser,
    });
    return mapApiFeedbackToViewModel(updatedDto, userRole, userName);
  },

  /**
   * Lấy danh sách Thông báo của Học sinh từ Backend
   */
  async getStudentNotifications(studentId = DEFAULT_STUDENT_ID): Promise<NotificationItem[]> {
    const targetStudentId = resolveStudentId(studentId);
    const apiList = await learningApi.getStudentNotifications(targetStudentId);
    if (Array.isArray(apiList)) {
      return apiList.map(mapApiLearnerNotifToStudentItem);
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Lấy danh sách Thông báo của Phụ huynh từ Backend (lọc theo con đang chọn)
   */
  async getParentNotifications(
    parentId = DEFAULT_PARENT_ID,
    studentId?: number
  ): Promise<LearnerNotificationItemApiDto[]> {
    const targetParentId = resolveParentId(parentId);
    const list = await learningApi.getParentNotifications(targetParentId, studentId);
    if (Array.isArray(list)) {
      return list;
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  async markNotificationRead(notificationId: number, userId?: number): Promise<boolean> {
    const currentId = getAuthUser()?.userId;
    if (!currentId) throw new Error('Please sign in again.');
    const ok = await learningApi.markNotificationRead(notificationId, currentId);
    if (!ok) throw new Error('Read status was not confirmed.');
    saveLocalReadNotificationId(notificationId, currentId);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('edutrack-notifications-invalidated', String(Date.now())); } catch { /* ignore */ }
      window.dispatchEvent(new StorageEvent('storage', { key: 'edutrack-notifications-invalidated' }));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    }
    return ok;
  },

  async markAllNotificationsRead(
    userId: number,
    studentId?: number,
    notificationIds?: number[]
  ): Promise<number> {
    const currentId = getAuthUser()?.userId;
    if (!currentId) throw new Error('Please sign in again.');
    const count = await learningApi.markAllNotificationsRead(currentId, studentId);
    if (notificationIds) saveAllLocalReadNotificationIds(notificationIds, currentId);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('edutrack-notifications-invalidated', String(Date.now())); } catch { /* ignore */ }
      window.dispatchEvent(new StorageEvent('storage', { key: 'edutrack-notifications-invalidated' }));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    }
    return count;
  },

  /**
   * Lấy thông tin Hồ sơ cá nhân của Học sinh
   */
  async getStudentProfile(studentId = DEFAULT_STUDENT_ID): Promise<StudentProfileData> {
    const targetStudentId = resolveStudentId(studentId);
    const dto = await learningApi.getStudentProfile(targetStudentId);
    if (dto && dto.userId === targetStudentId) {
      return mapApiProfileToStudentProfile(dto);
    }
    throw new Error('The server did not return valid data. Please retry.');
  },

  /**
   * Cập nhật thông tin Hồ sơ cá nhân của Học sinh xuống CSDL
   */
  async updateStudentProfile(
    data: StudentProfileData,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentProfileData> {
    const targetStudentId = resolveStudentId(studentId);
    const payload: UpdateLearnerProfilePayload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dob,
      gender: data.gender,
      avatarUrl: data.avatarUrl,
      address: data.address,
    };
    const dto = await learningApi.updateStudentProfile(targetStudentId, payload);
    if (dto?.userId !== targetStudentId) throw new Error("Profile update was not confirmed for this account.");
    return mapApiProfileToStudentProfile(dto);
  },

  /**
   * Lấy thông tin Hồ sơ cá nhân của Phụ huynh
   */
  async getParentProfile(parentId = DEFAULT_PARENT_ID): Promise<LearnerProfileApiDto> {
    const targetParentId = resolveParentId(parentId);
    const dto = await learningApi.getParentProfile(targetParentId);
    if (!dto || dto.userId !== targetParentId) {
      throw new Error('Parent profile not found');
    }
    return dto;
  },

  /**
   * Cập nhật thông tin Hồ sơ cá nhân của Phụ huynh xuống CSDL
   */
  async updateParentProfile(
    payload: UpdateLearnerProfilePayload,
    parentId = DEFAULT_PARENT_ID
  ): Promise<LearnerProfileApiDto> {
    const targetParentId = resolveParentId(parentId);
    const updated = await learningApi.updateParentProfile(targetParentId, payload);
    if (updated?.userId !== targetParentId) throw new Error("Profile update was not confirmed for this account.");
    return updated;
  },
};

export default learningDAL;
