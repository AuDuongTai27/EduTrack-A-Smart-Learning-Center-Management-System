import type { Subject } from './Subject';
import type { TeacherClass } from './TeacherClass';
import type { TaClass } from './TaClass';
import type { StudentClass } from './StudentClass';
import type { ClassSchedule } from './ClassSchedule';
import type { ClassSession } from './ClassSession';
import type { ContentUnit } from './ContentUnit';
import type { Assignment } from './Assignment';
import type { ProgressNote } from './ProgressNote';
import type { TuitionInvoice } from './TuitionInvoice';
import type { ApprovalRequest } from './ApprovalRequest';
import type { Notification } from './Notification';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Class (bảng classes)
 */
export interface Class {
  classId: number;
  className: string;
  subjectId: number;
  room?: string | null;
  tuitionFee: number;
  startDate: string;
  endDate?: string | null;
  status: 'active' | 'inactive' | string;

  // Navigation Properties
  subject?: Subject;
  teacherClasses?: TeacherClass[];
  taClasses?: TaClass[];
  studentClasses?: StudentClass[];
  classSchedules?: ClassSchedule[];
  classSessions?: ClassSession[];
  contentUnits?: ContentUnit[];
  assignments?: Assignment[];
  progressNotes?: ProgressNote[];
  tuitionInvoices?: TuitionInvoice[];
  approvalRequests?: ApprovalRequest[];
  notifications?: Notification[];
}
