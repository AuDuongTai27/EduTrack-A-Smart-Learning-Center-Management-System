import type { TuitionInvoice } from './TuitionInvoice';
import type { User } from './User';

/**
 * Ánh xạ 1-1 từ EduTrack.API.Models.Entities.Payment (bảng payment)
 */
export interface Payment {
  paymentId: number;
  invoiceId: number;
  amount: number;
  paymentMethod: 'bank_transfer' | 'vnpay' | 'momo' | string;
  transactionCode?: string | null;
  paidAt: string;
  paidByUserId?: number | null;
  recordedBy?: number | null;
  note?: string | null;

  // Navigation Properties
  invoice?: TuitionInvoice;
  payer?: User | null;
  recorder?: User | null;
}
