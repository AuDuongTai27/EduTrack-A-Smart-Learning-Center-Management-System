import React from 'react';
import type { TuitionHistoryItem } from '../tuitionData';

export interface TuitionHistoryRowProps {
  item: TuitionHistoryItem;
}

export function TuitionHistoryRow({ item: row }: TuitionHistoryRowProps) {
  return (
    <div className="history-grid-row">
      <span className="history-period-text">{row.period}</span>
      <span className="history-amount-text">{row.amount}</span>
      <span className="history-date-text">{row.date}</span>
      <span className="history-status-badge">
        <i className="bi bi-check-circle-fill"></i>
        <span>{row.status}</span>
      </span>
    </div>
  );
};

export default TuitionHistoryRow;
