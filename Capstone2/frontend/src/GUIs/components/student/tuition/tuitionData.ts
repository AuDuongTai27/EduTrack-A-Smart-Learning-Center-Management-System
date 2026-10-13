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
    { name: 'Lớp Toán 9A – Đại Số', amount: '3.500.000 đ' },
    { name: 'Lớp Vật Lý 9B – Cơ Học', amount: '2.000.000 đ' },
    { name: 'Lớp Tiếng Anh – Giao Tiếp', amount: '1.500.000 đ' },
    { name: 'Tài liệu học tập', amount: '300.000 đ' },
    { name: 'Phí quản lý nền tảng', amount: '200.000 đ' },
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
