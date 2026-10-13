import type { User } from './User';
import type { TuitionInvoice } from './TuitionInvoice';
import type { Class } from './Class';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.ApprovalRequest (bảng approval_requests)
 */
export interface ApprovalRequest {
  requestId: number;
  requestCode: string;
  requestType: string;
  studentId?: number | null;
  invoiceId?: number | null;
  classId?: number | null;
  requestedBy: number;
  reviewedBy?: number | null;
  priority: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;

  // Navigation Properties
  student?: User | null;
  invoice?: TuitionInvoice | null;
  class?: Class | null;
  requester?: User;
  reviewer?: User | null;
}
