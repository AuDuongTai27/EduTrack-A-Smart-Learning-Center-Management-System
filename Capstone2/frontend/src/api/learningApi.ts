const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface StudentEnrolledClassApiDto {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
  teacherInitials: string;
  scheduleText: string;
  room: string;
  attendedLessons: number;
  totalLessons: number;
  status: string;
}

export interface StudentDashboardApiDto {
  studentId: number;
  studentCode: string;
  fullName: string;
  avatarInitials: string;
  enrolledClassesCount: number;
  pendingAssignmentsCount: number;
  classes: StudentEnrolledClassApiDto[];
}

export interface ParentChildClassApiDto {
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

export interface ParentChildOverviewApiDto {
  id: number;
  code: string;
  name: string;
  avatar: string;
  grade: string;
  school: string;
  dob: string;
  phone?: string;
  relationship: string;
  isPrimaryContact: boolean;
  classesCount: number;
  attendanceRate: number;
  averageScore: number;
  unpaidAmount: number;
  classes: ParentChildClassApiDto[];
}

export interface ClassMaterialItemApiDto {
  id: number;
  classId: number;
  type: 'PDF' | 'DOC' | 'PPT' | 'IMG';
  fileName: string;
  description: string;
  uploadDate: string;
  uploadedBy: string;
  sizeMb: number;
}

export interface ClassAssignmentItemApiDto {
  id: number;
  classId: number;
  title: string;
  dueDate: string;
  status: 'Chưa nộp' | 'Đã nộp' | 'Quá hạn';
  score?: number | null;
  aiScore?: number | null;
  maxScore: number;
}

export interface ClassSessionAttendanceItemApiDto {
  sessionId: number;
  sessionNo: number;
  date: string;
  topic: string;
  status: string;
  statusLabel: string;
  notes: string;
}

export interface StudentClassDetailApiDto {
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
  room: string;
  schedule: string;
  description: string;
  studentCount: number;
  attendedLessons: number;
  totalLessons: number;
  latestTeacherNote: string;
  teacherName: string;
  teacherInitials: string;
  teacherEmail: string;
  teacherPhone: string;
  materials: ClassMaterialItemApiDto[];
  assignments: ClassAssignmentItemApiDto[];
  sessions: ClassSessionAttendanceItemApiDto[];
}

export interface StudentSubmissionDetailApiDto {
  submissionId: number;
  assignmentId: number;
  studentId: number;
  fileUrl: string;
  fileName: string;
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  aiScore?: number | null;
  aiFeedbackJson?: string | null;
  aiSummary?: string | null;
  status: string;
}

export interface StudentAssignmentDetailApiDto {
  assignmentId: number;
  classId: number;
  className: string;
  title: string;
  description?: string | null;
  fileUrl?: string | null;
  dueDate: string;
  maxScore: number;
  isAiGradingEnabled: boolean;
  rubricJson?: string | null;
  submission?: StudentSubmissionDetailApiDto | null;
}

export interface SubmitHomeworkPayload {
  assignmentId: number;
  studentId: number;
  fileName?: string;
  fileUrl?: string;
  fileSizeText?: string;
}

export interface StudentScheduleSlotApiDto {
  id: string;
  classId: number;
  className: string;
  subject: string;
  subjectCode: string;
  startH: number;
  startM: number;
  endH: number;
  endM: number;
  teacher: string;
  initials: string;
  room: string;
  day: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface StudentProgressFeedbackApiDto {
  assignmentTitle: string;
  quote: string;
  teacherName: string;
  statusType: 'dat' | 'chuadat' | 'canluuy' | 'chuacham';
  statusIcon: string;
  statusLabel: string;
}

export interface StudentProgressClassApiDto {
  id: string;
  classId: number;
  className: string;
  subjectName: string;
  subjectCode: string;
  attended: number;
  total: number;
  percentage: number;
  isCompleted: boolean;
  feedbacks: StudentProgressFeedbackApiDto[];
}

export interface StudentProgressOverviewApiDto {
  studentId: number;
  studentName: string;
  overallAttendanceRate: number;
  attendedSessionsCount: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalSessionsCount: number;
  enrolledClassesCount: number;
  currentClasses: StudentProgressClassApiDto[];
}

export interface TuitionInvoiceItemApiDto {
  invoiceId: number;
  classId: number;
  className: string;
  periodMonth: number;
  periodYear: number;
  amountDue: number;
  dueDate: string;
  status: string;
}

export interface TuitionPaymentHistoryApiDto {
  paymentId: number;
  invoiceId: number;
  className: string;
  period: string;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  transactionCode: string;
  status: string;
}

export interface StudentTuitionOverviewApiDto {
  studentId: number;
  studentName: string;
  period: string;
  dueDate: string;
  remainingDaysText: string;
  totalUnpaidAmount: number;
  unpaidInvoices: TuitionInvoiceItemApiDto[];
  paymentHistory: TuitionPaymentHistoryApiDto[];
}

export interface PayStudentTuitionPayload {
  studentId: number;
  parentId: number;
  paymentMethod: string;
  invoiceIds?: number[];
}

export interface LearnerFeedbackItemApiDto {
  requestId: number;
  requestCode: string;
  requestType: string;
  title: string;
  description: string;
  studentId?: number | null;
  studentName?: string | null;
  classId?: number | null;
  className?: string | null;
  requestedBy: number;
  requesterName: string;
  requesterRole: 'student' | 'parent' | string;
  reviewedBy?: number | null;
  reviewerName?: string | null;
  priority: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  statusLabel?: string;
  canEdit?: boolean;
  createdAt: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
}

export interface CreateLearnerFeedbackPayload {
  userId: number;
  studentId?: number | null;
  classId?: number | null;
  title: string;
  description: string;
  priority?: string;
}

export interface UpdateLearnerFeedbackPayload {
  userId: number;
  title: string;
  description: string;
}

export interface LearnerNotificationItemApiDto {
  notificationId: number;
  userId?: number | null;
  userName?: string | null;
  classId?: number | null;
  className?: string | null;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * [Bounded Context: Learning]
 * Tầng Network API dành riêng cho Thành viên 3 (Student & Parent)
 */
export const learningApi = {
  /**
   * Lấy dữ liệu tổng quan Dashboard của Học sinh (kèm danh sách lớp, giáo viên, lịch học)
   */
  async getStudentDashboard(studentId: number): Promise<StudentDashboardApiDto | null> {
    const response = await fetch(`${API_BASE_URL}/learning/student/${studentId}/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Dashboard`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Lấy dữ liệu tổng quan danh sách con đã liên kết của Phụ huynh
   */
  async getParentChildrenOverview(parentId: number): Promise<ParentChildOverviewApiDto[]> {
    const response = await fetch(`${API_BASE_URL}/learning/parent/${parentId}/children-overview`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Parent Children Overview`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Lấy chi tiết lớp học (tài liệu ContentUnits, danh sách bài tập kèm trạng thái nộp, điểm danh các buổi học)
   */
  async getStudentClassDetail(studentId: number, classId: number): Promise<StudentClassDetailApiDto | null> {
    const response = await fetch(`${API_BASE_URL}/learning/student/${studentId}/classes/${classId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Class Detail`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Lấy thời khóa biểu tuần của Học sinh (GET /api/learning/student/{studentId}/schedule)
   */
  async getStudentSchedule(studentId: number): Promise<StudentScheduleSlotApiDto[]> {
    const response = await fetch(`${API_BASE_URL}/learning/student/${studentId}/schedule`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Schedule`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Lấy báo cáo Tiến độ học tập & Điểm danh của Học sinh (GET /api/learning/student/{studentId}/progress)
   */
  async getStudentProgress(studentId: number): Promise<StudentProgressOverviewApiDto | null> {
    const response = await fetch(`${API_BASE_URL}/learning/student/${studentId}/progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Progress`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Lấy thông tin Hóa đơn học phí & Lịch sử giao dịch của Học sinh (GET /api/learning/parent/tuition/{studentId})
   */
  async getStudentTuition(studentId: number): Promise<StudentTuitionOverviewApiDto | null> {
    const response = await fetch(`${API_BASE_URL}/learning/parent/tuition/${studentId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Tuition`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Phụ huynh thanh toán học phí trực tuyến cho con (POST /api/learning/parent/payments)
   */
  async payStudentTuition(payload: PayStudentTuitionPayload): Promise<StudentTuitionOverviewApiDto> {
    const response = await fetch(`${API_BASE_URL}/learning/parent/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi thanh toán học phí`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Tạo lại hóa đơn chờ thanh toán cho kỳ hiện tại để Demo (POST /api/learning/parent/tuition/{studentId}/reset-demo)
   */
  async resetDemoTuition(studentId: number): Promise<StudentTuitionOverviewApiDto> {
    const response = await fetch(`${API_BASE_URL}/learning/parent/tuition/${studentId}/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi khôi phục hóa đơn demo`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Lấy chi tiết bài tập kèm bài đã nộp, điểm Giáo viên & kết quả AI chấm
   */
  async getStudentAssignmentDetail(
    studentId: number,
    assignmentId: number
  ): Promise<StudentAssignmentDetailApiDto | null> {
    const response = await fetch(
      `${API_BASE_URL}/learning/submissions/student/${studentId}/assignment/${assignmentId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải Student Assignment Detail`);
    }
    const json = await response.json();
    return json?.data ?? json ?? null;
  },

  /**
   * Nộp bài tập mới hoặc nộp lại bài tập (POST /api/learning/submissions)
   */
  async submitHomework(payload: SubmitHomeworkPayload): Promise<StudentSubmissionDetailApiDto> {
    const response = await fetch(`${API_BASE_URL}/learning/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi nộp bài tập`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Xóa / Rút lại bài nộp của học sinh
   */
  async deleteSubmission(studentId: number, assignmentId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/learning/submissions/student/${studentId}/assignment/${assignmentId}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi xóa bài nộp`);
    }
    return true;
  },

  /**
   * Lấy lịch sử Phản hồi & Đơn xin phép của Học sinh hoặc Phụ huynh (GET /api/learning/feedback/user/{userId})
   */
  async getLearnerFeedbacks(userId: number, studentId?: number): Promise<LearnerFeedbackItemApiDto[]> {
    const query = studentId ? `?studentId=${studentId}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/feedback/user/${userId}${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải danh sách phản hồi`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Gửi Phản hồi mới lên Admin Staff (POST /api/learning/feedback - mặc định request_type = 'feedback')
   */
  async createLearnerFeedback(payload: CreateLearnerFeedbackPayload): Promise<LearnerFeedbackItemApiDto> {
    const response = await fetch(`${API_BASE_URL}/learning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi gửi phản hồi mới`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Chỉnh sửa Phản hồi khi đơn còn ở trạng thái 'Chưa xem xét giải quyết' (PUT /api/learning/feedback/{requestId})
   */
  async updateLearnerFeedback(
    requestId: number,
    payload: UpdateLearnerFeedbackPayload
  ): Promise<LearnerFeedbackItemApiDto> {
    const response = await fetch(`${API_BASE_URL}/learning/feedback/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi cập nhật phản hồi`);
    }
    const json = await response.json();
    return json?.data ?? json;
  },

  /**
   * Lấy danh sách Thông báo của Học sinh (GET /api/learning/student/{studentId}/notifications)
   */
  async getStudentNotifications(studentId: number): Promise<LearnerNotificationItemApiDto[]> {
    const response = await fetch(`${API_BASE_URL}/learning/student/${studentId}/notifications`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải thông báo học sinh`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Lấy danh sách Thông báo của Phụ huynh (GET /api/learning/parent/{parentId}/notifications)
   */
  async getParentNotifications(parentId: number, studentId?: number): Promise<LearnerNotificationItemApiDto[]> {
    const query = studentId ? `?studentId=${studentId}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/parent/${parentId}/notifications${query}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi tải thông báo phụ huynh`);
    }
    const json = await response.json();
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    return [];
  },

  /**
   * Đánh dấu một thông báo là đã đọc (PUT /api/learning/student/notifications/{notificationId}/read)
   */
  async markNotificationRead(notificationId: number): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/learning/student/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi đánh dấu đã đọc thông báo`);
    }
    return true;
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc (PUT /api/learning/student/{userId}/notifications/read-all)
   */
  async markAllNotificationsRead(userId: number, studentId?: number): Promise<number> {
    const query = studentId ? `?studentId=${studentId}` : '';
    const response = await fetch(`${API_BASE_URL}/learning/student/${userId}/notifications/read-all${query}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} khi đánh dấu đã đọc tất cả thông báo`);
    }
    const json = await response.json();
    return json?.updatedCount ?? 0;
  },
};

export default learningApi;
