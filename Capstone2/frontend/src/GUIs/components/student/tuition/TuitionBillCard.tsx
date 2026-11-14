import React from 'react';
import { CURRENT_TUITION_BILL, type TuitionBill } from './tuitionData';

export interface TuitionBillCardProps {
  bill?: TuitionBill;
}

export function TuitionBillCard({ bill = CURRENT_TUITION_BILL }: TuitionBillCardProps) {
  const isPaid =
    bill.totalAmount.trim() === '0 đ' ||
    bill.totalAmount.trim() === '0đ' ||
    bill.totalAmount.trim() === '0 VND' ||
    bill.remainingDaysText.toLowerCase().includes('hoàn thành') ||
    bill.remainingDaysText.toLowerCase().includes('đã nộp') ||
    bill.remainingDaysText.toLowerCase().includes('completed') ||
    bill.remainingDaysText.toLowerCase().includes('paid');

  return (
    <div className="bill-card">
      <div className="bill-accent-bar"></div>
      <div className="bill-grid-layout">
        {/* Left Column: Total Due */}
        <div className="bill-left-col">
          <div className="bill-total-label">Total Amount Due</div>
          <div className={`bill-hero-amount ${isPaid ? 'text-success' : ''}`}>
            {bill.totalAmount}
          </div>

          <div className="bill-meta-lines">
            <div className="bill-meta-item">
              <span className="bill-meta-title">Billing Period:</span>
              <span className="bill-meta-value">{bill.period}</span>
            </div>
            <div className="bill-meta-item">
              <span className="bill-meta-title">Due Date:</span>
              <span className={`bill-meta-due-date ${isPaid ? 'is-paid' : ''}`}>
                {bill.dueDate}
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className={`bill-remaining-chip ${isPaid ? 'is-paid' : 'is-unpaid'}`}>
              <i
                className={`bi ${
                  isPaid ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'
                }`}
              ></i>
              <span>{bill.remainingDaysText}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="bill-right-col">
          <div className="breakdown-heading-row">
            <h2 className="breakdown-heading">Fee Breakdown</h2>
            <i
              className="bi bi-info-circle text-muted"
              title="Details of fees for the term"
            ></i>
          </div>

          <div className="breakdown-list">
            {bill.items.map((item, index) => (
              <div key={index} className="breakdown-item-row">
                <span className="breakdown-item-name">{item.name}</span>
                <span className="breakdown-item-amount">{item.amount}</span>
              </div>
            ))}
          </div>

          <div className="breakdown-totals-box">
            <div className="breakdown-total-row">
              <span className="breakdown-total-label">Total</span>
              <span className="breakdown-total-val">{bill.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TuitionBillCard;
