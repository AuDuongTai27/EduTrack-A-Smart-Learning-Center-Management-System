import type { ClassDto } from "./ClassDto";
import type { ClassScheduleDto } from "./ClassScheduleDto";

export type ManagementRole = "center-manager" | "admin-staff";
export interface ClassFormValues {
  className: string;
  subjectId: string;
  room: string;
  tuitionFee: string;
  startDate: string;
  endDate: string;
  status: string;
}
export interface ClassStudentDto {
  scId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  classId: number;
  className: string;
  enrolledDate?: string | null;
  status: string;
  droppedAt?: string | null;
  dropReason?: string | null;
}
export interface ClassTeacherDto {
  teacherClassId: number;
  teacherId: number;
  teacherName: string;
  teacherCode: string;
  classId: number;
  assignedAt: string;
  status: string;
}
export interface ClassTaDto {
  taClassId: number;
  taId: number;
  taName: string;
  taCode: string;
  classId: number;
  assignedAt: string;
  status: string;
}
export interface ClassSessionDto {
  sessionId: number;
  classId: number;
  scheduleId?: number | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  room?: string | null;
  status: string;
}
export interface ClassDetailData {
  overview: ClassDto;
  students: ClassStudentDto[];
  teachers: ClassTeacherDto[];
  assistants: ClassTaDto[];
  schedules: ClassScheduleDto[];
  sessions: ClassSessionDto[];
}
export interface ClassQuery<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
