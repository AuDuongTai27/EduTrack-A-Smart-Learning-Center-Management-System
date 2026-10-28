import {
  learningApi,
  type StudentEnrolledClassApiDto,
} from '../api/learningApi';
import {
  MOCK_ENROLLED_CLASSES,
  type EnrolledClassItem,
} from '../GUIs/components/student/classes/classesData';
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
};

export default learningDAL;
