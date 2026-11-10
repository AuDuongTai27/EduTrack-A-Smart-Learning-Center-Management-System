export interface TuitionInvoiceItemApiDto {
  invoiceId: number;
  classId: number;
  className: string;
  periodMonth: number;
  periodYear: number;
  amountDue: number;
  dueDate: string;
  status: string;
}

export interface TuitionPaymentHistoryApiDto {
  paymentId: number;
  invoiceId: number;
  className: string;
  period: string;
  amount: number;
  paidAt: string;
  paymentMethod: string;
  transactionCode: string;
  status: string;
}

export interface StudentTuitionOverviewApiDto {
  studentId: number;
  studentName: string;
  period: string;
  dueDate: string;
  remainingDaysText: string;
  totalUnpaidAmount: number;
  unpaidInvoices: TuitionInvoiceItemApiDto[];
  paymentHistory: TuitionPaymentHistoryApiDto[];
}

export interface PayStudentTuitionPayload {
  studentId: number;
  parentId: number;
  paymentMethod: string;
  transactionCode?: string;
  invoiceIds?: number[];
}

