import React from 'react';

interface HistoryItem {
  id: number;
  period: string;
  amount: string;
  date: string;
  status: string;
}

const HISTORY_DATA: HistoryItem[] = [
  { id: 1, period: 'Tháng 7 / 2026', amount: '7.500.000 đ', date: '02/07/2026', status: 'Đã nộp' },
  { id: 2, period: 'Tháng 6 / 2026', amount: '7.200.000 đ', date: '01/06/2026', status: 'Đã nộp' },
  { id: 3, period: 'Tháng 5 / 2026', amount: '7.200.000 đ', date: '30/04/2026', status: 'Đã nộp' },
  { id: 4, period: 'Tháng 4 / 2026', amount: '6.800.000 đ', date: '01/04/2026', status: 'Đã nộp' },
  { id: 5, period: 'Tháng 3 / 2026', amount: '6.800.000 đ', date: '28/02/2026', status: 'Đã nộp' },
];

export const TuitionHistorySection: React.FC = () => {
  return (
    <section>
      <div className="history-section-header">
        <h2 className="history-section-title">Lịch sử thanh toán</h2>
        <span className="history-count-label">5 giao dịch gần nhất</span>
      </div>

      <div className="history-table-card">
        {/* Header Row */}
        <div className="history-grid-header">
          <span>Kỳ đóng</span>
          <span>Số tiền đóng</span>
          <span>Ngày thanh toán</span>
          <span>Trạng thái</span>
        </div>

        {/* Data Rows */}
        {HISTORY_DATA.map((row) => (
          <div key={row.id} className="history-grid-row">
            <span className="history-period-text">{row.period}</span>
            <span className="history-amount-text">{row.amount}</span>
            <span className="history-date-text">{row.date}</span>
            <span className="history-status-badge">
              <i className="bi bi-check-circle-fill"></i>
              <span>{row.status}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TuitionHistorySection;
