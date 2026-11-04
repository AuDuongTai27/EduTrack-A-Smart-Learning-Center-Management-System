import React from 'react';

interface TuitionPaymentCTAProps {
  onPayNow: () => void;
  totalUnpaidAmount?: number;
}

export function TuitionPaymentCTA({
  onPayNow,
  totalUnpaidAmount = 2900000,
}: TuitionPaymentCTAProps) {
  if (totalUnpaidAmount <= 0) {
    return (
      <div className="payment-cta-wrap">
        <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
          <span className="badge bg-success-subtle text-success border border-success-subtle px-4 py-2.5 rounded-pill fs-6 fw-semibold">
            <i className="bi bi-check-circle-fill me-2"></i>
            Đã tất toán toàn bộ học phí trong kỳ
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-cta-wrap">
      <button type="button" className="btn-pay-now" id="btnPayNow" onClick={onPayNow}>
        <i className="bi bi-wallet2 fs-5"></i>
        <span>Thanh toán ngay (Đóng hết một lượt)</span>
      </button>
      <p className="payment-sub-note">
        <i className="bi bi-info-circle"></i>
        <span>Thanh toán một lần duy nhất cho toàn bộ các khoản phí còn nợ</span>
      </p>
    </div>
  );
}

export default TuitionPaymentCTA;
