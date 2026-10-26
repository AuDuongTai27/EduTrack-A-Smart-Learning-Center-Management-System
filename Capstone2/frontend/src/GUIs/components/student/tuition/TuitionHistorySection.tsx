import React from 'react';
import { TUITION_HISTORY, type TuitionHistoryItem } from './tuitionData';
import { TuitionHistoryRow } from './components/TuitionHistoryRow';

export interface TuitionHistorySectionProps {
  history?: TuitionHistoryItem[];
}

export function TuitionHistorySection({ history = TUITION_HISTORY }: TuitionHistorySectionProps) {
  return (
    <section>
      <div className="history-section-header">
        <h2 className="history-section-title">Lịch sử thanh toán</h2>
        <span className="history-count-label">{history.length} giao dịch gần nhất</span>
      </div>

      <div className="history-table-card">
        <div className="history-grid-header">
          <span>Kỳ đóng</span>
          <span>Số tiền đóng</span>
          <span>Ngày thanh toán</span>
          <span>Trạng thái</span>
        </div>

        {history.map((row) => (
          <TuitionHistoryRow key={row.id} item={row} />
        ))}
      </div>
    </section>
  );
};

export default TuitionHistorySection;
