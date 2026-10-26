export interface TuitionBreakdownItem {
  name: string;
  amount: string;
}

export interface TuitionBill {
  period: string;
  totalAmount: string;
  dueDate: string;
  remainingDaysText: string;
  items: TuitionBreakdownItem[];
  subTotal: string;
}

export interface TuitionHistoryItem {
  id: number;
  period: string;
  amount: string;
  date: string;
  status: string;
}

export const CURRENT_TUITION_BILL: TuitionBill = {
  period: 'Tháng 8 / 2026',
  totalAmount: '7.500.000 đ',
  dueDate: '15/08/2026',
  remainingDaysText: 'Còn 8 ngày để thanh toán',
  items: [
    { name: '[FE-Mock] Lớp Toán 9A – Đại Số', amount: '3.500.000 đ' },
    { name: '[FE-Mock] Lớp Vật Lý 9B – Cơ Học', amount: '2.000.000 đ' },
    { name: '[FE-Mock] Lớp Tiếng Anh – Giao Tiếp', amount: '1.500.000 đ' },
    { name: '[FE-Mock] Tài liệu học tập', amount: '300.000 đ' },
    { name: '[FE-Mock] Phí quản lý nền tảng', amount: '200.000 đ' },
  ],
  subTotal: '7.500.000 đ',
};

export const TUITION_HISTORY: TuitionHistoryItem[] = [
  { id: 1, period: 'Tháng 7 / 2026', amount: '7.500.000 đ', date: '02/07/2026', status: 'Đã nộp' },
  { id: 2, period: 'Tháng 6 / 2026', amount: '7.200.000 đ', date: '01/06/2026', status: 'Đã nộp' },
  { id: 3, period: 'Tháng 5 / 2026', amount: '7.200.000 đ', date: '30/04/2026', status: 'Đã nộp' },
  { id: 4, period: 'Tháng 4 / 2026', amount: '6.800.000 đ', date: '01/04/2026', status: 'Đã nộp' },
  { id: 5, period: 'Tháng 3 / 2026', amount: '6.800.000 đ', date: '28/02/2026', status: 'Đã nộp' },
];

import type { TuitionInvoiceDto, PaymentDto } from '../../../../BLL/models/TuitionDto';

export function mapInvoicesToTuitionBill(invoices: TuitionInvoiceDto[]): TuitionBill {
  if (!invoices || invoices.length === 0) return CURRENT_TUITION_BILL;

  const total = invoices.reduce((acc, inv) => acc + (inv.amountDue || 0), 0);
  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  const firstDueDate = invoices[0]?.dueDate ? new Date(invoices[0].dueDate) : new Date();
  const dueDateStr = `${String(firstDueDate.getDate()).padStart(2, '0')}/${String(firstDueDate.getMonth() + 1).padStart(2, '0')}/${firstDueDate.getFullYear()}`;

  return {
    period: `Kỳ tháng ${firstDueDate.getMonth() + 1} / ${firstDueDate.getFullYear()}`,
    totalAmount: fmtMoney(total),
    dueDate: dueDateStr,
    remainingDaysText: 'Còn hạn thanh toán học phí',
    items: invoices.map((inv) => ({
      name: inv.className || `Học phí môn học #${inv.classId}`,
      amount: fmtMoney(inv.amountDue || 0),
    })),
    subTotal: fmtMoney(total),
  };
}

export function mapPaymentsToHistoryItems(payments: PaymentDto[]): TuitionHistoryItem[] {
  if (!payments || payments.length === 0) return TUITION_HISTORY;

  const fmtMoney = (val: number) =>
    new Intl.NumberFormat('vi-VN').format(val) + ' đ';

  return payments.map((p) => {
    let dateStr = '01/09/2026';
    let periodStr = 'Tháng 9 / 2026';
    if (p.paidAt) {
      try {
        const d = new Date(p.paidAt);
        if (!isNaN(d.getTime())) {
          dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          periodStr = `Tháng ${d.getMonth() + 1} / ${d.getFullYear()}`;
        }
      } catch {
        dateStr = p.paidAt;
      }
    }

    return {
      id: p.paymentId,
      period: periodStr,
      amount: fmtMoney(p.amount || 0),
      date: dateStr,
      status: 'Đã nộp',
    };
  });
}
