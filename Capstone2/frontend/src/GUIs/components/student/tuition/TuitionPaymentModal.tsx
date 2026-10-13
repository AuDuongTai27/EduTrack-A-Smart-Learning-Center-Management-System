import React, { useState } from 'react';
import { PaymentMethodCard } from './components/PaymentMethodCard';

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TuitionPaymentModal({ isOpen, onClose }: TuitionPaymentModalProps) {
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
                  Kỳ học Tháng 8 / 2026 &middot; Học sinh Nguyễn Minh Anh
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

              <PaymentMethodCard
                methodId="qr"
                isSelected={selectedMethod === 'qr'}
                onSelect={() => setSelectedMethod('qr')}
                icon="bi-qr-code-scan"
                iconColor="text-primary"
                title="Chuyển khoản qua mã VietQR"
                description="Quét mã QR bằng ứng dụng ngân hàng bất kỳ"
              />

              <PaymentMethodCard
                methodId="momo"
                isSelected={selectedMethod === 'momo'}
                onSelect={() => setSelectedMethod('momo')}
                icon="bi-wallet-fill"
                iconColor="text-danger"
                title="Ví điện tử MoMo / ZaloPay"
                description="Thanh toán nhanh qua ví điện tử liên kết"
              />

              <PaymentMethodCard
                methodId="atm"
                isSelected={selectedMethod === 'atm'}
                onSelect={() => setSelectedMethod('atm')}
                icon="bi-credit-card-2-front-fill"
                iconColor="text-info"
                title="Thẻ ATM nội địa / VNPAY-QR"
                description="Hỗ trợ tất cả ngân hàng nội địa Việt Nam"
              />

              <PaymentMethodCard
                methodId="visa"
                isSelected={selectedMethod === 'visa'}
                onSelect={() => setSelectedMethod('visa')}
                icon="bi-credit-card-fill"
                iconColor="text-warning"
                title="Thẻ quốc tế (Visa / MasterCard / JCB)"
                description="Thanh toán quốc tế bảo mật 3D-Secure"
              />
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
                <span>{isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TuitionPaymentModal;
