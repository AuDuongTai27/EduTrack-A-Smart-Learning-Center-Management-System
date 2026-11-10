import React, { useState } from 'react';

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  period?: string;
  totalAmountText?: string;
  onConfirmPayment?: (transactionCode?: string) => Promise<void> | void;
}

export function TuitionPaymentModal({
  isOpen,
  onClose,
  studentName = 'Lê Văn An',
  period = 'Kỳ tháng 10 / 2026',
  totalAmountText = '0 đ',
  onConfirmPayment,
}: TuitionPaymentModalProps) {
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const transferNote = `EDUTRACK HP ${studentName.toUpperCase()}`;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      if (onConfirmPayment) {
        await onConfirmPayment(transactionCode.trim() || undefined);
      }
      setTransactionCode('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />
      <div
        className="modal fade show d-block"
        id="paymentModal"
        tabIndex={-1}
        aria-labelledby="paymentModalLabel"
        aria-modal="true"
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content payment-modal-card">
            <div className="modal-header payment-modal-header border-0">
              <div>
                <h5 className="modal-title fw-bold" id="paymentModalLabel">
                  Chuyển khoản thanh toán học phí
                </h5>
                <p className="mb-0 text-white-50 small">
                  {period} &middot; Học sinh {studentName}
                </p>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body p-4">
              <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center border">
                <span className="text-muted small fw-semibold">Tổng số tiền thanh toán:</span>
                <span className="fs-4 fw-extrabold text-primary">{totalAmountText}</span>
              </div>

              <div className="p-3 rounded-3 border border-primary-subtle bg-primary-subtle bg-opacity-25 mb-3">
                <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold small text-uppercase">
                  <i className="bi bi-bank2 fs-6" />
                  <span>Thông tin tài khoản nhận học phí Trung tâm</span>
                </div>
                <div className="small d-grid gap-2 text-dark">
                  <div className="d-flex justify-content-between gap-2">
                    <span className="text-muted">Ngân hàng:</span>
                    <strong className="text-end">Vietcombank (CN TP.HCM)</strong>
                  </div>
                  <div className="d-flex justify-content-between gap-2">
                    <span className="text-muted">Số tài khoản:</span>
                    <strong className="font-monospace text-primary">1029 3847 56</strong>
                  </div>
                  <div className="d-flex justify-content-between gap-2">
                    <span className="text-muted">Chủ tài khoản:</span>
                    <strong className="text-end">TRUNG TAM DAO TAO EDUTRACK</strong>
                  </div>
                  <div className="d-flex justify-content-between gap-2">
                    <span className="text-muted">Nội dung CK:</span>
                    <strong className="font-monospace text-end">{transferNote}</strong>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label htmlFor="txCodeInput" className="form-label small fw-bold text-dark mb-1">
                  Mã giao dịch ngân hàng (Tùy chọn)
                </label>
                <input
                  id="txCodeInput"
                  type="text"
                  className="form-control"
                  placeholder="VD: FT26314981234 (Để trống hệ thống sẽ tự cấp mã tham chiếu)"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  maxLength={80}
                  disabled={isProcessing}
                />
                <small className="text-muted d-block mt-1">
                  Khoản thanh toán sẽ được ghi nhận trực tiếp vào hóa đơn và lịch sử giao dịch trên hệ thống.
                </small>
              </div>
            </div>

            <div className="modal-footer border-0 bg-light p-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onClose}
                disabled={isProcessing}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing && <span className="spinner-border spinner-border-sm"></span>}
                <span>{isProcessing ? 'Đang ghi nhận...' : 'Xác nhận đã chuyển khoản'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TuitionPaymentModal;
