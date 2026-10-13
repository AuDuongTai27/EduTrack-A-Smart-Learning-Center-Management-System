import type { Class } from '../../BLL/models/Class';
import type { TeacherClass } from '../../BLL/models/TeacherClass';
import type { TaClass } from '../../BLL/models/TaClass';
import type { StudentClass } from '../../BLL/models/StudentClass';

/**
 * Dữ liệu mẫu lớp học bám sát DbSeeder.cs (bảng classes)
 */
export const MOCK_CLASSES: Class[] = [
  {
    classId: 1,
    className: 'Class 9 - Advanced Mathematics',
    subjectId: 1,
    room: 'Room 201',
    tuitionFee: 1500000.0,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'active',
  },
  {
    classId: 2,
    className: 'Class 9 - Intensive Physics',
    subjectId: 2,
    room: 'Room 202',
    tuitionFee: 1400000.0,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    status: 'active',
  },
  {
    classId: 3,
    className: 'Class 8 - English Foundation',
    subjectId: 4,
    room: 'Lab 101',
    tuitionFee: 1800000.0,
    startDate: '2026-09-15',
    endDate: '2027-01-15',
    status: 'active',
  },
];

/**
 * Dữ liệu mẫu phân công giáo viên bám sát DbSeeder.cs (bảng teacher_classes)
 */
export const MOCK_TEACHER_CLASSES: TeacherClass[] = [
  {
    teacherClassId: 1,
    teacherId: 3, // ThS. Hoàng Quốc Việt
    classId: 1,
    assignedAt: '2026-08-25T00:00:00Z',
    status: 'active',
  },
  {
    teacherClassId: 2,
    teacherId: 4, // ThS. Huỳnh Khánh Duy
    classId: 2,
    assignedAt: '2026-08-25T00:00:00Z',
    status: 'active',
  },
];

/**
 * Dữ liệu mẫu trợ giảng bám sát DbSeeder.cs (bảng ta_classes)
 */
export const MOCK_TA_CLASSES: TaClass[] = [
  {
    taClassId: 1,
    taId: 5, // Âu Dương Tài
    classId: 1,
    assignedAt: '2026-08-28T00:00:00Z',
    status: 'active',
  },
  {
    taClassId: 2,
    taId: 5, // Âu Dương Tài
    classId: 2,
    assignedAt: '2026-08-28T00:00:00Z',
    status: 'active',
  },
];

/**
 * Dữ liệu mẫu học sinh tham gia lớp bám sát DbSeeder.cs (bảng student_classes)
 */
export const MOCK_STUDENT_CLASSES: StudentClass[] = [
  {
    scId: 1,
    studentId: 6, // STU001 - Lê Văn An
    classId: 1,
    enrolledDate: '2026-09-01',
    status: 'active',
    droppedAt: null,
    dropReason: null,
  },
  {
    scId: 2,
    studentId: 7, // STU002 - Phạm Thị Bích
    classId: 1,
    enrolledDate: '2026-09-01',
    status: 'active',
    droppedAt: null,
    dropReason: null,
  },
  {
    scId: 3,
    studentId: 8, // STU003 - Đặng Minh Cường
    classId: 1,
    enrolledDate: '2026-09-02',
    status: 'active',
    droppedAt: null,
    dropReason: null,
  },
  {
    scId: 4,
    studentId: 6, // STU001 - Lê Văn An
    classId: 2,
    enrolledDate: '2026-09-01',
    status: 'active',
    droppedAt: null,
    dropReason: null,
  },
  {
    scId: 5,
    studentId: 7, // STU002 - Phạm Thị Bích
    classId: 2,
    enrolledDate: '2026-09-01',
    status: 'active',
    droppedAt: null,
    dropReason: null,
  },
];
