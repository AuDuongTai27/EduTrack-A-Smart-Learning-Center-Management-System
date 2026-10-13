import type { UserRole } from './UserRole';
import type { ParentStudent } from './ParentStudent';
import type { TeacherClass } from './TeacherClass';
import type { TaClass } from './TaClass';
import type { StudentClass } from './StudentClass';
import type { Attendance } from './Attendance';
import type { Assignment } from './Assignment';
import type { Submission } from './Submission';
import type { ProgressNote } from './ProgressNote';
import type { TuitionInvoice } from './TuitionInvoice';
import type { Payment } from './Payment';
import type { ApprovalRequest } from './ApprovalRequest';
import type { Notification } from './Notification';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.User (bảng users)
 */
export interface User {
  userId: number;
  userCode: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  passwordHash?: string;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  specialty?: string | null;
  enrolledSince?: string | null;
  status: 'active' | 'inactive' | 'locked' | string;
  createdAt: string;

  // Navigation Properties
  userRoles?: UserRole[];
  parentLinks?: ParentStudent[];
  studentLinks?: ParentStudent[];
  teacherClasses?: TeacherClass[];
  taClasses?: TaClass[];
  studentClasses?: StudentClass[];
  attendances?: Attendance[];
  createdAssignments?: Assignment[];
  submissions?: Submission[];
  studentProgressNotes?: ProgressNote[];
  tuitionInvoices?: TuitionInvoice[];
  paymentsMade?: Payment[];
  approvalRequests?: ApprovalRequest[];
  notifications?: Notification[];
}
