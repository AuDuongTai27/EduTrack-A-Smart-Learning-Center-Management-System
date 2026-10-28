import {
  learningApi,
  type StudentEnrolledClassApiDto,
  type ClassSessionAttendanceItemApiDto,
  type StudentSubmissionDetailApiDto,
  type StudentTuitionOverviewApiDto,
} from '../api/learningApi';
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
import {
  CURRENT_TUITION_BILL,
  TUITION_HISTORY,
  type TuitionBill,
  type TuitionHistoryItem,
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
  source: 'api' | 'mock';
}

export interface StudentTuitionViewModel {
  studentId: number;
  studentName: string;
  totalUnpaidAmount: number;
  bill: TuitionBill;
  history: TuitionHistoryItem[];
  source: 'api' | 'mock';
}

function fmtVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} đ`;
}

function mapApiTuitionToViewModel(apiData: StudentTuitionOverviewApiDto): StudentTuitionViewModel {
  const totalUnpaid = apiData.totalUnpaidAmount || 0;
  const unpaidItems = (apiData.unpaidInvoices || []).map((inv) => ({
    name: `${inv.className} (Tháng ${inv.periodMonth}/${inv.periodYear})`,
    amount: fmtVnd(inv.amountDue),
  }));

  const bill: TuitionBill = {
    period: apiData.period || 'Kỳ tháng 10 / 2026',
    totalAmount: fmtVnd(totalUnpaid),
    dueDate: apiData.dueDate || '10/11/2026',
    remainingDaysText:
      apiData.remainingDaysText ||
      (totalUnpaid > 0 ? 'Còn hạn thanh toán học phí' : 'Đã hoàn thành toàn bộ học phí kỳ này'),
    items:
      unpaidItems.length > 0
        ? unpaidItems
        : [
            {
              name: 'Đã hoàn thành học phí tất cả các môn học trong kỳ',
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
    status: p.status || 'Đã nộp',
  }));

  return {
    studentId: apiData.studentId,
    studentName: apiData.studentName,
    totalUnpaidAmount: totalUnpaid,
    bill,
    history: history.length > 0 ? history : TUITION_HISTORY,
    source: 'api',
  };
}

function mapSubjectTheme(subjectCode?: string, subjectName?: string): {
  subjectThemeClass: string;
  badge: string;
} {
  const combined = `${subjectCode || ''} ${subjectName || ''}`.toUpperCase();
  if (combined.includes('PHYS') || combined.includes('VAT') || combined.includes('LY') || combined.includes('LÝ')) {
    return { subjectThemeClass: 'theme-physics', badge: subjectName || 'Vật lý' };
  }
  if (combined.includes('CHEM') || combined.includes('HOA') || combined.includes('HÓA')) {
    return { subjectThemeClass: 'theme-chemistry', badge: subjectName || 'Hóa học' };
  }
  if (combined.includes('ENG') || combined.includes('ANH') || combined.includes('IELTS')) {
    return { subjectThemeClass: 'theme-english', badge: subjectName || 'Tiếng Anh' };
  }
  if (combined.includes('LIT') || combined.includes('VAN') || combined.includes('VĂN')) {
    return { subjectThemeClass: 'theme-literature', badge: subjectName || 'Ngữ văn' };
  }
  if (combined.includes('BIO') || combined.includes('SINH')) {
    return { subjectThemeClass: 'theme-biology', badge: subjectName || 'Sinh học' };
  }
  return { subjectThemeClass: 'theme-math', badge: subjectName || 'Toán học' };
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
    teacherName: dto.teacherName || 'Giáo viên phụ trách',
    teacherInitials: dto.teacherInitials || 'GV',
    scheduleText: dto.scheduleText || 'Đang cập nhật lịch',
    room: dto.room || 'Phòng học chính',
  };
}

/**
 * [Bounded Context: Learning]
 * Tầng Data Access Layer (DAL) dành riêng cho Thành viên 3 (Student & Parent)
 */
export const learningDAL = {
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
      if (apiChildren && apiChildren.length > 0) {
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

        const materials: MaterialItem[] =
          apiData.materials && apiData.materials.length > 0
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

        const assignments: AssignmentItem[] =
          apiData.assignments && apiData.assignments.length > 0
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
      latestTeacherNote: 'Điểm danh đầy đủ, tương tác tích cực trên lớp.',
      source: 'mock',
    };
  },

  /**
   * Lấy thời khóa biểu tuần của Học sinh (hoặc Con của Phụ huynh)
   */
  async getStudentSchedule(studentId = DEFAULT_STUDENT_ID): Promise<SessionItem[]> {
    try {
      const apiSlots = await learningApi.getStudentSchedule(studentId);
      if (apiSlots && apiSlots.length > 0) {
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
              })),
            };
          }
        );

        return {
          studentId: apiData.studentId,
          studentName: apiData.studentName,
          overallAttendanceRate: apiData.overallAttendanceRate,
          attendedSessionsCount: apiData.attendedSessionsCount,
          presentCount: apiData.presentCount,
          absentCount: apiData.absentCount,
          lateCount: apiData.lateCount,
          totalSessionsCount: apiData.totalSessionsCount,
          enrolledClassesCount: apiData.enrolledClassesCount,
          currentClasses: mappedClasses.length > 0 ? mappedClasses : CURRENT_PROGRESS_CLASSES,
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
      source: 'mock',
    };
  },

  /**
   * Lấy thông tin Hóa đơn học phí & Lịch sử giao dịch của đúng Học sinh đó
   */
  async getStudentTuition(studentId = DEFAULT_STUDENT_ID): Promise<StudentTuitionViewModel> {
    try {
      const apiData = await learningApi.getStudentTuition(studentId);
      if (apiData) {
        return mapApiTuitionToViewModel(apiData);
      }
    } catch (error) {
      console.warn('[learningDAL] Không kết nối được Backend Student Tuition, dùng mock fallback:', error);
    }

    return {
      studentId,
      studentName: 'Lê Văn An',
      totalUnpaidAmount: 7500000,
      bill: CURRENT_TUITION_BILL,
      history: TUITION_HISTORY,
      source: 'mock',
    };
  },

  /**
   * Phụ huynh thực hiện thanh toán toàn bộ học phí còn nợ cho con
   */
  async payStudentTuition(
    studentId = DEFAULT_STUDENT_ID,
    paymentMethod = 'bank_transfer',
    parentId = DEFAULT_PARENT_ID
  ): Promise<StudentTuitionViewModel> {
    const apiData = await learningApi.payStudentTuition({
      studentId,
      parentId,
      paymentMethod,
    });
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
          scoreText = `${sub.score} / ${apiData.maxScore} (GV đã chấm)`;
        } else if (sub?.aiScore !== null && sub?.aiScore !== undefined) {
          scoreText = `${sub.aiScore} / ${apiData.maxScore} (AI chấm sơ bộ)`;
        } else {
          scoreText = `Chờ chấm (Tối đa ${apiData.maxScore} đ)`;
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
          submittedFileName: sub?.fileName || 'Bai_lam_hoc_sinh.pdf',
          submittedMeta: sub ? `Đã nộp lúc ${sub.submittedAt} • Đã lưu trên hệ thống` : '',
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
      submittedFileName: 'Bai_lam_PT_bac2_LeVanAn.pdf',
      submittedMeta: 'Đã nộp lúc 18:42, 13/09/2026 • 2.4 MB',
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
};

export default learningDAL;
