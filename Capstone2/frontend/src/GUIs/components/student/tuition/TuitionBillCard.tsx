import React from 'react';
import { CURRENT_TUITION_BILL } from './tuitionData';

export function TuitionBillCard() {
  const bill = CURRENT_TUITION_BILL;

  return (
    <div className="bill-card">
      <div className="bill-accent-bar"></div>
      <div className="bill-grid-layout">
        {/* Left Column: Total Due */}
        <div className="bill-left-col">
          <div className="bill-total-label">Tổng tiền cần đóng</div>
          <div className="bill-hero-amount">{bill.totalAmount}</div>

          <div className="bill-meta-lines">
            <div className="bill-meta-item">
              <span className="bill-meta-title">Kỳ đóng:</span>
              <span className="bill-meta-value">{bill.period}</span>
            </div>
            <div className="bill-meta-item">
              <span className="bill-meta-title">Hạn đóng:</span>
              <span className="bill-meta-due-date">{bill.dueDate}</span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="bill-remaining-chip">
              <i className="bi bi-info-circle-fill"></i>
              <span>{bill.remainingDaysText}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown */}
        <div className="bill-right-col">
          <div className="breakdown-heading-row">
            <h2 className="breakdown-heading">Chi phí từng phần</h2>
            <i
              className="bi bi-info-circle text-muted"
              title="Chi tiết các khoản phí trong kỳ học"
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
            <div className="breakdown-subtotal-row">
              <span>Tạm tính (Sub-total)</span>
              <span className="fw-semibold">{bill.subTotal}</span>
            </div>
            <div className="breakdown-total-row">
              <span className="breakdown-total-label">Tổng cộng (Total)</span>
              <span className="breakdown-total-val">{bill.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TuitionBillCard;
