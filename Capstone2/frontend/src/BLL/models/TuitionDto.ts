export interface TuitionInvoiceDto {
  invoiceId: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  classId: number;
  className: string;
  amountDue: number;
  dueDate: string;
  status: string;

  // Extended compatibility fields for UI/Reports
  tuitionId?: number;
  invoiceCode?: string;
  period?: string;
  amount?: number;
  paidAmount?: number;
  createdAt?: string;
  notes?: string;
}

export type TuitionDto = TuitionInvoiceDto;

export interface PaymentDto {
  paymentId: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionCode?: string | null;
  paidAt: string;
  paidByUserId?: number | null;
  payerName?: string | null;
  recordedBy?: number | null;
  recorderName?: string | null;
  note?: string | null;
}
