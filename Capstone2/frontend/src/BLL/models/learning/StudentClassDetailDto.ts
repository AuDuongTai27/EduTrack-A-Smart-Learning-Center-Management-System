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

