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
};

export default learningApi;
