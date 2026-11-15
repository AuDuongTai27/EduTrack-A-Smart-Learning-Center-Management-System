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
        <h2 className="history-section-title">Payment History</h2>
        <span className="history-count-label">{history.length} transaction{history.length === 1 ? '' : 's'}</span>
      </div>

      <div className="history-table-card">
        <div className="history-grid-header">
          <span>Billing Period</span>
          <span>Amount Paid</span>
          <span>Payment Date</span>
          <span>Status</span>
        </div>

        {history.length === 0 ? (
          <div className="p-4 text-center text-muted small">
            No payment transactions recorded yet.
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
