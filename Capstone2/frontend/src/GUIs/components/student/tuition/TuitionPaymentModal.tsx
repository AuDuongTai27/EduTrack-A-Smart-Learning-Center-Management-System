import React, { useState, useEffect } from 'react';
import type { TuitionInvoiceItemApiDto } from '../../../../BLL/models/learning';

interface TuitionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  period?: string;
  totalAmountText?: string;
  unpaidInvoices?: TuitionInvoiceItemApiDto[];
  onPayWithVnPay?: (selectedInvoiceIds?: number[]) => Promise<void> | void;
}

export function TuitionPaymentModal({
  isOpen,
  onClose,
  studentName = 'Lê Văn An',
  period = 'October 2026 Term',
  totalAmountText = '0 VND',
  unpaidInvoices = [],
  onPayWithVnPay,
}: TuitionPaymentModalProps) {
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Khởi tạo các kỳ được chọn khi mở modal
  useEffect(() => {
    if (isOpen) {
      if (unpaidInvoices && unpaidInvoices.length > 0) {
        setSelectedInvoiceIds(unpaidInvoices.map((inv) => inv.invoiceId));
      } else {
        setSelectedInvoiceIds([]);
      }
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

  const handleConfirm = async () => {
    if (hasMultipleInvoices && selectedInvoiceIds.length === 0) return;
    setIsProcessing(true);
    try {
      const targetIds = hasMultipleInvoices ? selectedInvoiceIds : undefined;
      if (onPayWithVnPay) {
        await onPayWithVnPay(targetIds);
      }
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
                  VNPay Online Tuition Payment
                </h5>
                <p className="mb-0 text-white-50 small">
                  {period} &middot; Student {studentName}
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
                      Select tuition terms to pay ({selectedInvoiceIds.length}/{unpaidInvoices.length}):
                    </label>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                      onClick={toggleSelectAll}
                    >
                      {selectedInvoiceIds.length === unpaidInvoices.length ? 'Deselect all' : 'Select all'}
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
                                Month {inv.periodMonth}/{inv.periodYear}
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
                      * Please select at least one term to proceed with transfer.
                    </div>
                  )}
                </div>
              )}

              {/* Tổng số tiền thanh toán (Đóng toàn phần 100%) */}
              <div className="p-3 bg-light rounded-3 mb-3 d-flex justify-content-between align-items-center border">
                <div>
                  <span className="text-muted small fw-semibold d-block">
                    Total payment amount (100% in full):
                  </span>
                  <span className="small text-secondary">
                    {hasMultipleInvoices
                      ? `Selected ${selectedInvoiceIds.length} term(s)`
                      : 'Fixed based on invoice balance'}
                  </span>
                </div>
                <span className="fs-4 fw-extrabold text-primary font-monospace">
                  {displayTotalText}
                </span>
              </div>

              <div className="p-3 rounded-3 border border-primary-subtle bg-primary-subtle bg-opacity-25 mb-2">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2 text-primary fw-bold small text-uppercase">
                    <i className="bi bi-shield-check fs-6" />
                    <span>VNPay Payment Gateway (Sandbox)</span>
                  </div>
                  <span className="badge bg-primary text-white">v2.1.0</span>
                </div>
                <p className="small text-dark mb-2">
                  You will be redirected to <strong>VNPay Sandbox Gateway</strong> to complete the online payment. After authentication, the system will automatically return and mark your invoices as paid.
                </p>
                <div className="p-2.5 rounded-2 bg-white border small text-dark" style={{ padding: '10px 12px' }}>
                  <div className="fw-bold text-secondary mb-1" style={{ fontSize: '11.5px' }}>
                    <i className="bi bi-credit-card me-1 text-primary" />
                    VNPay Sandbox Test Card Credentials:
                  </div>
                  <div className="d-grid gap-1" style={{ fontSize: '12px' }}>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Bank:</span>
                      <strong className="font-monospace">NCB (Ngân hàng Quốc Dân)</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Card Number:</span>
                      <strong className="font-monospace text-primary">9704198526191432198</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Card Holder:</span>
                      <strong className="font-monospace">NGUYEN VAN A</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Issue Date / OTP:</span>
                      <strong className="font-monospace">07/15 &middot; OTP: 123456</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 bg-light p-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary px-4 fw-semibold d-flex align-items-center gap-2"
                onClick={handleConfirm}
                disabled={isProcessing || (hasMultipleInvoices && selectedInvoiceIds.length === 0)}
              >
                {isProcessing ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className="bi bi-box-arrow-up-right" />
                )}
                <span>
                  {isProcessing ? 'Redirecting to VNPay...' : 'Proceed to VNPay Sandbox'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TuitionPaymentModal;
