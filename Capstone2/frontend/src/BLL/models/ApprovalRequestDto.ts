export interface ApprovalRequestDto {
  requestId: number;
  requestCode: string;
  requestType: string;
  title?: string | null;
  description?: string | null;
  studentId?: number | null;
  studentName?: string | null;
  invoiceId?: number | null;
  classId?: number | null;
  className?: string | null;
  requestedBy: number;
  requesterName: string;
  reviewedBy?: number | null;
  reviewerName?: string | null;
  priority: string;
  status: string;
  reason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
}
