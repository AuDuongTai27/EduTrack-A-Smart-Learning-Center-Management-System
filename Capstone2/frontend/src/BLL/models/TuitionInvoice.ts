import type { User } from './User';
import type { Class } from './Class';
import type { Payment } from './Payment';
import type { ApprovalRequest } from './ApprovalRequest';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.TuitionInvoice (bảng tuition_invoices)
 */
export interface TuitionInvoice {
  invoiceId: number;
  studentId: number;
  classId: number;
  periodMonth: number;
  periodYear: number;
  amountDue: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'pending_adjustment' | string;

  // Navigation Properties
  student?: User;
  class?: Class;
  payments?: Payment[];
  approvalRequests?: ApprovalRequest[];
}
