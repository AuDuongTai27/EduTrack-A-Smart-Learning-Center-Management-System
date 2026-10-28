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
};

export default learningApi;
