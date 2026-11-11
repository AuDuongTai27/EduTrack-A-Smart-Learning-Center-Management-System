import React, { useState, useEffect } from 'react';
import type { TuitionInvoiceItemApiDto } from '../../../../BLL/models/learning';

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  period?: string;
  totalAmountText?: string;
  unpaidInvoices?: TuitionInvoiceItemApiDto[];
  onConfirmPayment?: (transactionCode?: string, selectedInvoiceIds?: number[]) => Promise<void> | void;
}

export function TuitionPaymentModal({
  isOpen,
  onClose,
  studentName = 'Lê Văn An',
  period = 'Kỳ tháng 10 / 2026',
  totalAmountText = '0 đ',
  unpaidInvoices = [],
  onConfirmPayment,
}: TuitionPaymentModalProps) {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [transactionCode, setTransactionCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Khởi tạo các kỳ được chọn khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (unpaidInvoices && unpaidInvoices.length > 0) {
        setSelectedInvoiceIds(unpaidInvoices.map((inv) => inv.invoiceId));
      } else {
        setSelectedInvoiceIds([]);
      }
      setTransactionCode('');
    }
  }, [isOpen, unpaidInvoices]);

  if (!isOpen) return null;

  const hasMultipleInvoices = unpaidInvoices && unpaidInvoices.length > 1;

  // Tính tổng số tiền theo các kỳ được chọn (đóng toàn phần 100% từng kỳ)
  const selectedInvoices = unpaidInvoices.filter((inv) =>
    selectedInvoiceIds.includes(inv.invoiceId)
  );

  const calculatedTotalAmount = hasMultipleInvoices
    ? selectedInvoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0)
    : unpaidInvoices.length === 1
      ? unpaidInvoices[0].amountDue
      : 0;

  const displayTotalText =
    unpaidInvoices.length > 0
      ? `${new Intl.NumberFormat('vi-VN').format(calculatedTotalAmount)} đ`
      : totalAmountText;

  const toggleInvoice = (invoiceId: number) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInvoiceIds.length === unpaidInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(unpaidInvoices.map((inv) => inv.invoiceId));
    }
  };

  const transferNote = `EDUTRACK HP ${studentName.toUpperCase()}`;

  const handleConfirm = async () => {
    if (hasMultipleInvoices && selectedInvoiceIds.length === 0) return;
    setIsProcessing(true);
    try {
      if (onConfirmPayment) {
        await onConfirmPayment(
          transactionCode.trim() || undefined,
          hasMultipleInvoices ? selectedInvoiceIds : undefined
        );
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
              {/* Danh sách chọn kỳ nếu có nhiều hơn 1 kỳ chưa đóng */}
              {hasMultipleInvoices && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label small fw-bold text-dark mb-0">
                      Chọn kỳ học phí muốn đóng ({selectedInvoiceIds.length}/{unpaidInvoices.length}):
                    </label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                      onClick={toggleSelectAll}
                    >
                      {selectedInvoiceIds.length === unpaidInvoices.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                  </div>
                  <div
                    className="d-flex flex-column gap-2 p-1"
                    style={{ maxHeight: '180px', overflowY: 'auto' }}
                  >
                    {unpaidInvoices.map((inv) => {
                      const isChecked = selectedInvoiceIds.includes(inv.invoiceId);
                      return (
                        <div
                          key={inv.invoiceId}
                          onClick={() => toggleInvoice(inv.invoiceId)}
                          className={`p-2 rounded-3 border d-flex align-items-center justify-content-between ${
                            isChecked
                              ? 'border-primary bg-primary-subtle bg-opacity-25'
                              : 'border-light-subtle bg-white'
                          }`}
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                        >
                          <div className="form-check mb-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleInvoice(inv.invoiceId)}
                              id={`modal-inv-${inv.invoiceId}`}
                            />
                            <label
                              className="form-check-label small fw-semibold text-dark ms-1"
                              htmlFor={`modal-inv-${inv.invoiceId}`}
                              style={{ cursor: 'pointer' }}
                            >
                              {inv.className} &middot;{' '}
                              <span className="text-secondary">
                                Tháng {inv.periodMonth}/{inv.periodYear}
                              </span>
                            </label>
                          </div>
                          <span className="badge bg-light text-primary border fw-bold">
                            {new Intl.NumberFormat('vi-VN').format(inv.amountDue)} đ
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {selectedInvoiceIds.length === 0 && (
                    <div className="small text-danger mt-1">
                      * Vui lòng chọn ít nhất một kỳ để tiến hành chuyển khoản.
                    </div>
                  )}
                </div>
              )}

              {/* Tổng số tiền thanh toán (Đóng toàn phần 100%) */}
              <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center border">
                <div>
                  <span className="text-muted small fw-semibold d-block">
                    Tổng số tiền thanh toán (Toàn phần 100%):
                  </span>
                  <span className="small text-secondary">
                    {hasMultipleInvoices
                      ? `Đã chọn ${selectedInvoiceIds.length} kỳ`
                      : 'Cố định theo dư nợ hóa đơn'}
                  </span>
                </div>
                <span className="fs-4 fw-extrabold text-primary font-monospace">
                  {displayTotalText}
                </span>
              </div>

              {/* Thông tin tài khoản trung tâm */}
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
                disabled={isProcessing || (hasMultipleInvoices && selectedInvoiceIds.length === 0)}
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
