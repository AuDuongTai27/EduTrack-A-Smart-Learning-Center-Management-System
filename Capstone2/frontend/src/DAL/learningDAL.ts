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
} from '../BLL/models/learning';
import {
  INITIAL_PROFILE,
  type StudentProfileData,
} from '../GUIs/components/student/profile/profileData';
import {
  INITIAL_FEEDBACK_REQUESTS,
  type FeedbackApprovalRequest,
} from '../GUIs/components/student/feedback/feedbackData';
import {
  INITIAL_NOTIFICATIONS,
  type NotificationItem,
} from '../GUIs/components/student/notifications/notificationsData';
import {
  MOCK_ENROLLED_CLASSES,
  type EnrolledClassItem,
} from '../GUIs/components/student/classes/classesData';
import {
  CLASSES_DATA,
  MATERIALS_DATA,
  ASSIGNMENTS_DATA,
  type ClassDetailItem,
  type MaterialItem,
  type AssignmentItem,
} from '../GUIs/components/student/classDetail/classDetailData';
import {
  ASSIGNMENTS_DB,
  DEFAULT_ASG,
  type AssignmentDetailItem,
  type SubmissionStatus,
} from '../GUIs/components/student/assignmentDetail/assignmentDetailData';
import {
  SESSIONS,
  type SessionItem,
} from '../GUIs/components/student/schedule/scheduleData';
import {
  CURRENT_PROGRESS_CLASSES,
  type ProgressClassItem,
} from '../GUIs/components/student/progress/progressData';
import type {
  TuitionBill,
  TuitionHistoryItem,
} from '../GUIs/components/student/tuition/tuitionData';
import {
  parentDAL,
  DEFAULT_PARENT_ID,
  type ChildStudent,
} from './parentDAL';

// Mặc định học sinh đang đăng nhập trong bản demo là Lê Văn An (STU001, UserId = 6)
export const DEFAULT_STUDENT_ID = 6;

export interface StudentDashboardViewModel {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarInitials: string;
  enrolledClassesCount: number;
  pendingAssignmentsCount: number;
  classes: EnrolledClassItem[];
  source: 'api' | 'mock';
}

export interface StudentClassDetailViewModel {
  cls: ClassDetailItem;
  materials: MaterialItem[];
  assignments: AssignmentItem[];
  sessions: ClassSessionAttendanceItemApiDto[];
  attendedLessons: number;
  totalLessons: number;
  latestTeacherNote: string;
  source: 'api' | 'mock';
}

export interface StudentAssignmentDetailViewModel {
  asg: AssignmentDetailItem;
  status: SubmissionStatus;
  submittedFileName: string;
  submittedMeta: string;
  submission?: StudentSubmissionDetailApiDto | null;
  source: 'api' | 'mock';
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
  source: 'api' | 'mock';
}

export interface StudentTuitionViewModel {
  studentId: number;
  studentName: string;
  totalUnpaidAmount: number;
  bill: TuitionBill;
  history: TuitionHistoryItem[];
  source: 'api' | 'mock';
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
    period: apiData.period || 'Term October / 2026',
    totalAmount: fmtVnd(totalUnpaid),
    dueDate: apiData.dueDate || '10/11/2026',
    remainingDaysText:
      apiData.remainingDaysText ||
      (totalUnpaid > 0 ? 'Tuition payment due' : 'Completed all tuition for this term'),
    items:
      unpaidItems.length > 0
        ? unpaidItems
        : [
            {
              name: 'Completed tuition for all subjects this term',
              amount: '0 đ',
            },
          ],
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
  return { subjectThemeClass: 'theme-math', badge: subjectName || 'Mathematics' };
}

function mapSubjectBannerTheme(subjectCode?: string, subjectName?: string): {
  subjectClass: string;
  accent: string;
  grad: string;
} {
  const combined = `${subjectCode || ''} ${subjectName || ''}`.toUpperCase();
  if (combined.includes('PHYS') || combined.includes('VAT') || combined.includes('LY') || combined.includes('LÝ')) {
    return {
      subjectClass: 'subject-vat-ly',
      accent: '#7C3AED',
      grad: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 60%, #8B5CF6 100%)',
    };
  }
  if (combined.includes('CHEM') || combined.includes('HOA') || combined.includes('HÓA')) {
    return {
      subjectClass: 'subject-hoa-hoc',
      accent: '#DC2626',
      grad: 'linear-gradient(135deg, #991B1B 0%, #DC2626 60%, #EF4444 100%)',
    };
  }
  if (combined.includes('ENG') || combined.includes('ANH') || combined.includes('IELTS')) {
    return {
      subjectClass: 'subject-tieng-anh',
      accent: '#059669',
      grad: 'linear-gradient(135deg, #065F46 0%, #059669 60%, #10B981 100%)',
    };
  }
  if (combined.includes('LIT') || combined.includes('VAN') || combined.includes('VĂN')) {
    return {
      subjectClass: 'subject-ngu-van',
      accent: '#D97706',
      grad: 'linear-gradient(135deg, #92400E 0%, #D97706 60%, #F59E0B 100%)',
    };
  }
  if (combined.includes('BIO') || combined.includes('SINH')) {
    return {
      subjectClass: 'subject-sinh-hoc',
      accent: '#0891B2',
      grad: 'linear-gradient(135deg, #164E63 0%, #0891B2 60%, #06B6D4 100%)',
    };
  }
  return {
    subjectClass: 'subject-toan',
    accent: '#2563EB',
    grad: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 60%, #3B82F6 100%)',
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
  return {
    classId: dto.classId,
    className: dto.className,
    badge,
    subjectThemeClass,
    teacherName: dto.teacherName || 'Teacher in charge',
    teacherInitials: dto.teacherInitials || 'TC',
    scheduleText: dto.scheduleText || 'Updating schedule',
    room: dto.room || 'Main Classroom',
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
  fallbackName = 'Lê Văn An'
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
    fullName: dto.fullName || INITIAL_PROFILE.fullName,
    dob: dto.dateOfBirth ? dto.dateOfBirth.split('T')[0] : '2010-02-14',
    gender: dto.gender || 'Nam',
    enrollDate: dto.enrolledSince ? dto.enrolledSince.split('T')[0] : '2025-01-05',
    address: dto.address || '45 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
    phone: dto.phone || '0956 789 012',
    email: dto.email || 'an.le@student.edutrack.vn',
    avatarUrl: dto.avatarUrl || INITIAL_PROFILE.avatarUrl,
  };
}

/**
 * [Bounded Context: Learning]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 3 (Student & Parent)
 */
const LOCAL_READ_NOTIFS_KEY = 'edutrack_read_notification_ids';

export function getLocalReadNotificationIds(userId?: number): Set<number> {
  try {
    const key = userId ? `${LOCAL_READ_NOTIFS_KEY}_${userId}` : LOCAL_READ_NOTIFS_KEY;
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
    const key = userId ? `${LOCAL_READ_NOTIFS_KEY}_${userId}` : LOCAL_READ_NOTIFS_KEY;
    const set = getLocalReadNotificationIds(userId);
    set.add(id);
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function saveAllLocalReadNotificationIds(ids: number[], userId?: number) {
  try {
    const key = userId ? `${LOCAL_READ_NOTIFS_KEY}_${userId}` : LOCAL_READ_NOTIFS_KEY;
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
    try {
      const notifs = await this.getStudentNotifications(studentId);
      const readSet = getLocalReadNotificationIds(studentId);
      return notifs.filter((n) => n.unread && !readSet.has(n.id)).length;
    } catch {
      return 0;
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc của Phụ huynh
   */
  async getParentUnreadCount(
    parentId = DEFAULT_PARENT_ID,
    studentId?: number
  ): Promise<number> {
    try {
      const notifs = await this.getParentNotifications(parentId, studentId);
      const readSet = getLocalReadNotificationIds(parentId);
      return notifs.filter((n) => !n.isRead && !readSet.has(n.notificationId)).length;
    } catch {
      return 0;
    }
  },
  /**
   * Lấy toàn bộ dữ liệu Dashboard của Học sinh từ Backend (kèm fallback an toàn khi offline)
   */
  async getStudentDashboard(studentId = DEFAULT_STUDENT_ID): Promise<StudentDashboardViewModel> {
    try {
      const apiData = await learningApi.getStudentDashboard(studentId);
      if (apiData) {
        const mappedClasses = (apiData.classes || []).map(mapApiClassToEnrolledItem);
        return {
          studentId: apiData.studentId,
          studentCode: apiData.studentCode,
          fullName: apiData.fullName,
          avatarInitials: apiData.avatarInitials || 'VA',
          enrolledClassesCount: apiData.enrolledClassesCount ?? mappedClasses.length,
          pendingAssignmentsCount: apiData.pendingAssignmentsCount ?? 0,
          classes: mappedClasses,
          source: 'api',
        };
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Student Dashboard, dùng mock fallback:', error);
    }

    return {
      studentId,
      studentCode: 'STU001',
      fullName: 'Lê Văn An',
      avatarInitials: 'VA',
      enrolledClassesCount: MOCK_ENROLLED_CLASSES.length,
      pendingAssignmentsCount: 2,
      classes: MOCK_ENROLLED_CLASSES,
      source: 'mock',
    };
  },

  /**
   * Lấy danh sách các con đã liên kết kèm chỉ số học tập & lớp học từ Backend cho Phụ huynh
   */
  async getParentChildrenOverview(parentId = DEFAULT_PARENT_ID): Promise<ChildStudent[]> {
    try {
      const apiChildren = await learningApi.getParentChildrenOverview(parentId);
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
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Parent Children Overview, dùng mock fallback:', error);
    }

    return parentDAL.getLinkedChildrenSync(parentId);
  },

  /**
   * Lấy chi tiết lớp học (kèm tài liệu ContentUnits, bài tập Assignments + trạng thái nộp & lịch sử buổi học)
   */
  async getStudentClassDetail(
    classId: number,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentClassDetailViewModel> {
    const fallbackCls = CLASSES_DATA.find((c) => c.id === classId) || CLASSES_DATA[0];
    const fallbackMaterials = MATERIALS_DATA.filter((m) => m.classId === classId);
    const fallbackAssignments = ASSIGNMENTS_DATA.filter((a) => a.classId === classId);

    try {
      const apiData = await learningApi.getStudentClassDetail(studentId, classId);
      if (apiData) {
        const theme = mapSubjectBannerTheme(apiData.subjectCode, apiData.subjectName);
        const cls: ClassDetailItem = {
          id: apiData.classId,
          name: apiData.className,
          subject: apiData.subjectName,
          subjectClass: theme.subjectClass,
          grad: theme.grad,
          accent: theme.accent,
          teacher: apiData.teacherName || fallbackCls.teacher,
          teacherInitials: apiData.teacherInitials || fallbackCls.teacherInitials,
          schedule: apiData.schedule || fallbackCls.schedule,
          room: apiData.room || fallbackCls.room,
          email: apiData.teacherEmail || fallbackCls.email,
          phone: apiData.teacherPhone || fallbackCls.phone,
          description: apiData.description || fallbackCls.description,
          studentCount: apiData.studentCount || fallbackCls.studentCount,
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
            }))
          : fallbackMaterials;

        const assignments: AssignmentItem[] = Array.isArray(apiData.assignments)
          ? apiData.assignments.map((a) => ({
              id: a.id,
              classId: a.classId,
              title: a.title,
              dueDate: a.dueDate,
              status: (a.status as 'Chưa nộp' | 'Đã nộp' | 'Quá hạn') || 'Chưa nộp',
            }))
          : fallbackAssignments;

        return {
          cls,
          materials,
          assignments,
          sessions: apiData.sessions || [],
          attendedLessons: apiData.attendedLessons,
          totalLessons: apiData.totalLessons,
          latestTeacherNote: apiData.latestTeacherNote,
          source: 'api',
        };
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Class Detail, dùng mock fallback:', error);
    }

    return {
      cls: fallbackCls,
      materials: fallbackMaterials,
      assignments: fallbackAssignments,
      sessions: [],
      attendedLessons: 5,
      totalLessons: 6,
      latestTeacherNote: 'Full attendance, actively participates in class.',
      source: 'mock',
    };
  },

  /**
   * Lấy thời khóa biểu tuần của Học sinh (hoặc Con của Phụ huynh)
   */
  async getStudentSchedule(studentId = DEFAULT_STUDENT_ID): Promise<SessionItem[]> {
    try {
      const apiSlots = await learningApi.getStudentSchedule(studentId);
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
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Student Schedule, dùng mock fallback:', error);
    }

    return SESSIONS;
  },

  /**
   * Lấy báo cáo Tiến độ học tập & Điểm danh của Học sinh (hoặc Con của Phụ huynh)
   */
  async getStudentProgress(studentId = DEFAULT_STUDENT_ID): Promise<StudentProgressViewModel> {
    try {
      const apiData = await learningApi.getStudentProgress(studentId);
      if (apiData) {
        const mappedClasses: ProgressClassItem[] = (apiData.currentClasses || []).map(
          (cls, idx) => {
            const progTheme = mapProgressTheme(cls.subjectCode, cls.subjectName, idx);
            return {
              id: cls.id,
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
            : 100;

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
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Student Progress, dùng mock fallback:', error);
    }

    return {
      studentId,
      studentName: 'Lê Văn An',
      overallAttendanceRate: 80,
      attendedSessionsCount: 35,
      presentCount: 35,
      absentCount: 4,
      lateCount: 5,
      totalSessionsCount: 44,
      enrolledClassesCount: CURRENT_PROGRESS_CLASSES.length,
      currentClasses: CURRENT_PROGRESS_CLASSES,
      pastClasses: [],
      source: 'mock',
    };
  },

  /**
   * Lấy thông tin Hóa đơn học phí & Lịch sử giao dịch của đúng Học sinh đó
   */
  async getStudentTuition(studentId = DEFAULT_STUDENT_ID): Promise<StudentTuitionViewModel> {
    const apiData = await learningApi.getStudentTuition(studentId);
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
    const apiData = await learningApi.payStudentTuition({
      studentId,
      parentId,
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
   * Khôi phục hóa đơn kỳ hiện tại về trạng thái chờ thanh toán (Phục vụ Demo)
   */
  async resetDemoTuition(studentId = DEFAULT_STUDENT_ID): Promise<StudentTuitionViewModel> {
    const apiData = await learningApi.resetDemoTuition(studentId);
    return mapApiTuitionToViewModel(apiData);
  },

  /**
   * Lấy chi tiết Bài tập kèm bài đã nộp, điểm Giáo viên và điểm AI chấm sơ bộ
   */
  async getStudentAssignmentDetail(
    assignmentId: number,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentAssignmentDetailViewModel> {
    const fallbackAsg = ASSIGNMENTS_DB[assignmentId] || DEFAULT_ASG;

    try {
      const apiData = await learningApi.getStudentAssignmentDetail(studentId, assignmentId);
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
          class: apiData.className || fallbackAsg.class,
          dueDate: apiData.dueDate,
          defaultStatus: status,
          classId: apiData.classId,
          score: scoreText,
          description: apiData.description ?? fallbackAsg.description,
        };

        return {
          asg,
          status,
          submittedFileName: sub?.fileName || 'Student_submission.pdf',
          submittedMeta: sub ? `Submitted at ${sub.submittedAt} • Saved on system` : '',
          submission: sub,
          source: 'api',
        };
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Assignment Detail, dùng mock fallback:', error);
    }

    return {
      asg: fallbackAsg,
      status: fallbackAsg.defaultStatus || 'not-submitted',
      submittedFileName: 'HW_Quadratic_Equation_LeVanAn.pdf',
      submittedMeta: 'Submitted at 18:42, 13/09/2026 • 2.4 MB',
      submission: null,
      source: 'mock',
    };
  },

  /**
   * Nộp bài tập mới hoặc cập nhật bài nộp của học sinh lên Backend
   */
  async submitHomework(
    assignmentId: number,
    fileName: string,
    fileSizeMb: string,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentSubmissionDetailApiDto> {
    return await learningApi.submitHomework({
      assignmentId,
      studentId,
      fileName,
      fileUrl: `https://storage.edutrack.edu.vn/submissions/${encodeURIComponent(fileName)}`,
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
    return await learningApi.deleteSubmission(studentId, assignmentId);
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
    try {
      const apiList = await learningApi.getLearnerFeedbacks(userId, studentId);
      if (Array.isArray(apiList)) {
        return apiList.map((item) => mapApiFeedbackToViewModel(item, userRole, userName));
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Learner Feedbacks, dùng mock fallback:', error);
    }

    return INITIAL_FEEDBACK_REQUESTS.map((r) => ({
      ...r,
      senderName: userName,
      senderRole: userRole,
    }));
  },

  /**
   * Gửi Phản hồi mới lên Admin Staff (mặc định request_type = 'feedback')
   */
  async createLearnerFeedback(
    payload: CreateLearnerFeedbackPayload,
    userRole: 'parent' | 'student',
    userName: string
  ): Promise<FeedbackApprovalRequest> {
    const createdDto = await learningApi.createLearnerFeedback(payload);
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
    const updatedDto = await learningApi.updateLearnerFeedback(requestId, payload);
    return mapApiFeedbackToViewModel(updatedDto, userRole, userName);
  },

  /**
   * Lấy danh sách Thông báo của Học sinh từ Backend
   */
  async getStudentNotifications(studentId = DEFAULT_STUDENT_ID): Promise<NotificationItem[]> {
    try {
      const apiList = await learningApi.getStudentNotifications(studentId);
      if (Array.isArray(apiList)) {
        return apiList.map(mapApiLearnerNotifToStudentItem);
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Student Notifications, dùng mock fallback:', error);
    }

    return INITIAL_NOTIFICATIONS;
  },

  /**
   * Lấy danh sách Thông báo của Phụ huynh từ Backend (lọc theo con đang chọn)
   */
  async getParentNotifications(
    parentId = DEFAULT_PARENT_ID,
    studentId?: number
  ): Promise<LearnerNotificationItemApiDto[]> {
    try {
      const list = await learningApi.getParentNotifications(parentId, studentId);
      if (Array.isArray(list)) {
        return list;
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Parent Notifications, dùng mock fallback:', error);
    }

    return [
      {
        notificationId: 1,
        title: 'New tuition notice for October 2026',
        content: 'Tuition invoice for October 2026 for student Le Van An has been issued. Parents can check and pay online in the Tuition section.',
        type: 'tuition',
        className: 'Advanced Math 9',
        createdAt: '2026-10-14T09:00:00Z',
        isRead: false,
      },
      {
        notificationId: 2,
        title: 'Periodic feedback update from Teacher',
        content: 'The teacher in charge of Advanced Math 9 has updated the October progress and attendance evaluation for student Le Van An.',
        type: 'class_review',
        className: 'Advanced Math 9',
        createdAt: '2026-10-13T17:45:00Z',
        isRead: false,
      },
      {
        notificationId: 3,
        title: 'Notice of holiday schedule and make-up classes',
        content: 'EduTrack would like to send parents the holiday schedule and make-up class plan for next week.',
        type: 'system',
        className: undefined,
        createdAt: '2026-10-10T08:00:00Z',
        isRead: true,
      },
    ];
  },

  async markNotificationRead(notificationId: number, userId?: number): Promise<boolean> {
    saveLocalReadNotificationId(notificationId, userId);
    let ok = false;
    try {
      ok = await learningApi.markNotificationRead(notificationId, userId);
    } catch (error) {
      console.warn('[learningDAL] Không thể lưu trạng thái đã đọc lên Backend:', error);
    }
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
    if (notificationIds && notificationIds.length > 0) {
      saveAllLocalReadNotificationIds(notificationIds, userId);
    }
    let count = 0;
    try {
      count = await learningApi.markAllNotificationsRead(userId, studentId);
    } catch (error) {
      console.warn('[learningDAL] Không thể lưu trạng thái đã đọc tất cả lên Backend:', error);
    }
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
    try {
      const dto = await learningApi.getStudentProfile(studentId);
      if (dto) {
        return mapApiProfileToStudentProfile(dto);
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Student Profile, dùng mock fallback:', error);
    }
    return INITIAL_PROFILE;
  },

  /**
   * Cập nhật thông tin Hồ sơ cá nhân của Học sinh xuống CSDL
   */
  async updateStudentProfile(
    data: StudentProfileData,
    studentId = DEFAULT_STUDENT_ID
  ): Promise<StudentProfileData> {
    const payload: UpdateLearnerProfilePayload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dob,
      gender: data.gender,
      avatarUrl: data.avatarUrl,
      address: data.address,
    };
    const dto = await learningApi.updateStudentProfile(studentId, payload);
    return mapApiProfileToStudentProfile(dto);
  },

  /**
   * Lấy thông tin Hồ sơ cá nhân của Phụ huynh
   */
  async getParentProfile(parentId = DEFAULT_PARENT_ID): Promise<LearnerProfileApiDto> {
    const dto = await learningApi.getParentProfile(parentId);
    if (!dto) {
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
    return await learningApi.updateParentProfile(parentId, payload);
  },
};

export default learningDAL;
