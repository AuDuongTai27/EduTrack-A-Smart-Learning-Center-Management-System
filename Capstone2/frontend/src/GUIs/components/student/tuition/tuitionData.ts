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
  period: 'August 2026',
  totalAmount: '7.500.000 đ',
  dueDate: '15/08/2026',
  remainingDaysText: '8 days remaining to pay',
  items: [
    { name: '[FE-Mock] Math 9A – Algebra', amount: '3.500.000 đ' },
    { name: '[FE-Mock] Physics 9B – Mechanics', amount: '2.000.000 đ' },
    { name: '[FE-Mock] English – Communication', amount: '1.500.000 đ' },
    { name: '[FE-Mock] Learning materials', amount: '300.000 đ' },
    { name: '[FE-Mock] Platform management fee', amount: '200.000 đ' },
  ],
  subTotal: '7.500.000 đ',
};

export const TUITION_HISTORY: TuitionHistoryItem[] = [
  { id: 1, period: 'July 2026', amount: '7.500.000 đ', date: '02/07/2026', status: 'Paid' },
  { id: 2, period: 'June 2026', amount: '7.200.000 đ', date: '01/06/2026', status: 'Paid' },
  { id: 3, period: 'May 2026', amount: '7.200.000 đ', date: '30/04/2026', status: 'Paid' },
  { id: 4, period: 'April 2026', amount: '6.800.000 đ', date: '01/04/2026', status: 'Paid' },
  { id: 5, period: 'March 2026', amount: '6.800.000 đ', date: '28/02/2026', status: 'Paid' },
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
    period: `Month ${firstDueDate.getMonth() + 1} / ${firstDueDate.getFullYear()}`,
    totalAmount: fmtMoney(total),
    dueDate: dueDateStr,
    remainingDaysText: 'Payment due',
    items: invoices.map((inv) => ({
      name: inv.className || `Tuition fee #${inv.classId}`,
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
    let periodStr = 'September 2026';
    if (p.paidAt) {
      try {
        const d = new Date(p.paidAt);
        if (!isNaN(d.getTime())) {
          dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          periodStr = `Month ${d.getMonth() + 1} / ${d.getFullYear()}`;
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
      status: 'Paid',
    };
  });
}
