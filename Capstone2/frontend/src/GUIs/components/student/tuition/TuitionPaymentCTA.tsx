import React from 'react';

interface TuitionPaymentCTAProps {
  onPayNow: () => void;
}

export const TuitionPaymentCTA: React.FC<TuitionPaymentCTAProps> = ({ onPayNow }) => {
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
};

export default TuitionPaymentCTA;
