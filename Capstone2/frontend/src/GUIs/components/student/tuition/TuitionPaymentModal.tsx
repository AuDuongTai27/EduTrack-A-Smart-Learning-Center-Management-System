import React, { useState } from 'react';

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TuitionPaymentModal: React.FC<TuitionPaymentModalProps> = ({ isOpen, onClose }) => {
  const [selectedMethod, setSelectedMethod] = useState<'qr' | 'momo' | 'atm' | 'visa'>('qr');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      alert('🎉 Thanh toán thành công 7.500.000 đ! Hóa đơn điện tử đã được gửi đến email học sinh.');
      setIsProcessing(false);
      onClose();
    }, 1200);
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
                  Thanh toán học phí trực tuyến
                </h5>
                <p className="mb-0 text-white-50 small">
                  Kỳ học Tháng 8 / 2026 • Học sinh Nguyễn Minh Anh
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
              <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center">
                <span className="text-muted small">Tổng số tiền thanh toán:</span>
                <span className="fs-4 fw-extrabold text-primary">7.500.000 đ</span>
              </div>

              <label className="form-label small fw-bold text-uppercase text-muted mb-2">
                Chọn phương thức thanh toán:
              </label>

              {/* Method 1: QR Pay */}
              <div
                className={`payment-method-card ${selectedMethod === 'qr' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('qr')}
              >
                <i className="bi bi-qr-code-scan fs-4 text-primary"></i>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">Chuyển khoản qua mã VietQR</div>
                  <div className="text-muted small">Quét mã QR bằng ứng dụng ngân hàng bất kỳ</div>
                </div>
                <i
                  className={`bi bi-check-circle-fill text-primary method-check-icon ${
                    selectedMethod === 'qr' ? '' : 'd-none'
                  }`}
                ></i>
              </div>

              {/* Method 2: MoMo / E-Wallet */}
              <div
                className={`payment-method-card ${selectedMethod === 'momo' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('momo')}
              >
                <i className="bi bi-wallet-fill fs-4 text-danger"></i>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">Ví điện tử MoMo / ZaloPay</div>
                  <div className="text-muted small">Thanh toán nhanh qua ví điện tử liên kết</div>
                </div>
                <i
                  className={`bi bi-check-circle-fill text-primary method-check-icon ${
                    selectedMethod === 'momo' ? '' : 'd-none'
                  }`}
                ></i>
              </div>

              {/* Method 3: ATM / VNPAY */}
              <div
                className={`payment-method-card ${selectedMethod === 'atm' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('atm')}
              >
                <i className="bi bi-credit-card-2-front-fill fs-4 text-info"></i>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">Thẻ ATM nội địa / VNPAY-QR</div>
                  <div className="text-muted small">Hỗ trợ tất cả ngân hàng nội địa Việt Nam</div>
                </div>
                <i
                  className={`bi bi-check-circle-fill text-primary method-check-icon ${
                    selectedMethod === 'atm' ? '' : 'd-none'
                  }`}
                ></i>
              </div>

              {/* Method 4: Visa/Mastercard */}
              <div
                className={`payment-method-card ${selectedMethod === 'visa' ? 'active' : ''}`}
                onClick={() => setSelectedMethod('visa')}
              >
                <i className="bi bi-credit-card-fill fs-4 text-warning"></i>
                <div className="flex-grow-1">
                  <div className="fw-semibold text-dark">Thẻ quốc tế (Visa / MasterCard / JCB)</div>
                  <div className="text-muted small">Thanh toán quốc tế bảo mật 3D-Secure</div>
                </div>
                <i
                  className={`bi bi-check-circle-fill text-primary method-check-icon ${
                    selectedMethod === 'visa' ? '' : 'd-none'
                  }`}
                ></i>
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
                className="btn btn-primary px-4 fw-semibold"
                id="btnConfirmPayment"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Đang xử lý giao dịch...
                  </>
                ) : (
                  'Xác nhận thanh toán'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TuitionPaymentModal;
