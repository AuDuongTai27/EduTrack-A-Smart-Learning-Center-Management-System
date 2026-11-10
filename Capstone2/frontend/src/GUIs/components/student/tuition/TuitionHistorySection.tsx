import React from 'react';
import type { TuitionHistoryItem } from './tuitionData';
import { TuitionHistoryRow } from './components/TuitionHistoryRow';

export interface TuitionHistorySectionProps {
  history?: TuitionHistoryItem[];
}

export function TuitionHistorySection({ history = [] }: TuitionHistorySectionProps) {
  return (
    <section>
      <div className="history-section-header">
        <h2 className="history-section-title">Lịch sử thanh toán</h2>
        <span className="history-count-label">{history.length} giao dịch</span>
      </div>

      <div className="history-table-card">
        <div className="history-grid-header">
          <span>Kỳ đóng</span>
          <span>Số tiền đóng</span>
          <span>Ngày thanh toán</span>
          <span>Trạng thái</span>
        </div>

        {history.length === 0 ? (
          <div className="p-4 text-center text-muted small">
            Chưa có giao dịch thanh toán nào được ghi nhận.
          </div>
        ) : (
          history.map((row) => (
            <TuitionHistoryRow key={row.id} item={row} />
          ))
        )}
      </div>
    </section>
  );
}

export default TuitionHistorySection;
