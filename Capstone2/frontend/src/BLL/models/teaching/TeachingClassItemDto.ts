export interface TeachingClassItemDto {
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
  room?: string;
  tuitionFee: number;
  startDate: string;
  endDate?: string;
  status: string;
  studentCount: number;
  teacherName?: string;
  taName?: string;
  partnerName?: string;
  scheduleSummary?: string;
}

