import type { TuitionInvoice } from '../../BLL/models/TuitionInvoice';
import type { Payment } from '../../BLL/models/Payment';

/**
 * Dữ liệu mẫu hóa đơn học phí bám sát DbSeeder.cs (bảng tuition_invoices)
 */
export const MOCK_TUITION_INVOICES: TuitionInvoice[] = [
  {
    invoiceId: 1,
    studentId: 6, // An
    classId: 1, // Math 9
    periodMonth: 9,
    periodYear: 2026,
    amountDue: 1500000.0,
    dueDate: '2026-09-10',
    status: 'paid',
  },
  {
    invoiceId: 2,
    studentId: 7, // Bích
    classId: 1, // Math 9
    periodMonth: 9,
    periodYear: 2026,
    amountDue: 1500000.0,
    dueDate: '2026-09-10',
    status: 'paid',
  },
  {
    invoiceId: 3,
    studentId: 8, // Cường
    classId: 1, // Math 9
    periodMonth: 9,
    periodYear: 2026,
    amountDue: 1500000.0,
    dueDate: '2026-09-10',
    status: 'overdue',
  },
  {
    invoiceId: 4,
    studentId: 6, // An
    classId: 2, // Phys 9
    periodMonth: 9,
    periodYear: 2026,
    amountDue: 1400000.0,
    dueDate: '2026-09-10',
    status: 'paid',
  },
  {
    invoiceId: 5,
    studentId: 7, // Bích
    classId: 2, // Phys 9
    periodMonth: 9,
    periodYear: 2026,
    amountDue: 1400000.0,
    dueDate: '2026-09-10',
    status: 'unpaid',
  },
];

/**
 * Dữ liệu mẫu thanh toán bám sát DbSeeder.cs (bảng payment)
 * Áp dụng phương thức online: bank_transfer, vnpay, momo
 */
export const MOCK_PAYMENTS: Payment[] = [
  {
    paymentId: 1,
    invoiceId: 1,
    amount: 1500000.0,
    paymentMethod: 'bank_transfer',
    transactionCode: 'MBVCB.789123456',
    paidAt: '2026-09-05T10:29:38Z',
    paidByUserId: 9, // Lê Văn Nam (Phụ huynh An)
    recordedBy: 2, // Admin Staff
    note: 'Settled via Vietcombank transfer by Parent Le Van Nam (PAR001)',
  },
  {
    paymentId: 2,
    invoiceId: 2,
    amount: 1500000.0,
    paymentMethod: 'vnpay',
    transactionCode: 'VNPAY20260906001',
    paidAt: '2026-09-06T14:20:00Z',
    paidByUserId: 10, // Phạm Thị Mai (Phụ huynh Bích)
    recordedBy: 2, // Admin Staff
    note: 'Settled via VNPay portal by Parent Pham Thi Mai (PAR002)',
  },
  {
    paymentId: 3,
    invoiceId: 4,
    amount: 1400000.0,
    paymentMethod: 'bank_transfer',
    transactionCode: 'MBTCB.992817263',
    paidAt: '2026-09-07T09:15:22Z',
    paidByUserId: 9, // Lê Văn Nam (Phụ huynh An)
    recordedBy: 2, // Admin Staff
    note: 'Settled via Techcombank transfer by Parent Le Van Nam (PAR001)',
  },
];
