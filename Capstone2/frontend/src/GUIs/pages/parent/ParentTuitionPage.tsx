import React, { useState, useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionPaymentCTA } from '../../components/student/tuition/TuitionPaymentCTA';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';
import { TuitionPaymentModal } from '../../components/student/tuition/TuitionPaymentModal';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';
import type { TuitionInvoiceItemApiDto } from '../../../BLL/models/learning';
import type {
  TuitionBill,
  TuitionHistoryItem,
} from '../../components/student/tuition/tuitionData';

export function ParentTuitionPage() {
  const { selectedChild, loading: parentLoading, updateChildUnpaidAmount } = useParent();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bill, setBill] = useState<TuitionBill | null>(null);
  const [history, setHistory] = useState<TuitionHistoryItem[]>([]);
  const [totalUnpaid, setTotalUnpaid] = useState<number>(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState<TuitionInvoiceItemApiDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const studentId = selectedChild?.id || DEFAULT_STUDENT_ID;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadTuition() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const vm = await learningDAL.getStudentTuition(studentId);
        if (isMounted && vm) {
          setBill(vm.bill);
          setHistory(vm.history);
          setTotalUnpaid(vm.totalUnpaidAmount);
          setUnpaidInvoices(vm.unpaidInvoices || []);
          updateChildUnpaidAmount(studentId, vm.totalUnpaidAmount);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thông tin học phí phụ huynh:', err);
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Không tải được dữ liệu học phí từ hệ thống.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTuition();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleConfirmPayment = async (transactionCode?: string, selectedInvoiceIds?: number[]) => {
    setErrorMsg(null);
    try {
      const updatedVm = await learningDAL.payStudentTuition(
        studentId,
        'bank_transfer',
        DEFAULT_PARENT_ID,
        transactionCode,
        selectedInvoiceIds
      );
      setBill(updatedVm.bill);
      setHistory(updatedVm.history);
      setTotalUnpaid(updatedVm.totalUnpaidAmount);
      setUnpaidInvoices(updatedVm.unpaidInvoices || []);
      updateChildUnpaidAmount(studentId, updatedVm.totalUnpaidAmount);
      showToast(`Đã ghi nhận thanh toán học phí cho học sinh ${selectedChild?.name || ''}!`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Thanh toán học phí thất bại.');
      throw err;
    }
  };

  if (parentLoading || (loading && !bill)) {
    return (
      <LearnerPageLoader
        title="Đang tải thông tin học phí..."
        message="Hệ thống đang kiểm tra hóa đơn kỳ hiện tại và lịch sử thanh toán học phí của con."
        containerClassName="tuition-container"
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container tuition-container">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className="position-fixed top-0 start-50 translate-middle-x p-3"
            style={{ zIndex: 1090, marginTop: '16px' }}
          >
            <div className="toast show align-items-center text-bg-success border-0 shadow" role="alert">
              <div className="d-flex">
                <div className="toast-body d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill fs-6"></i>
                  <span>{toastMessage}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  onClick={() => setToastMessage(null)}
                ></button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Header Dành Cho Phụ Huynh */}
        <div className="page-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <h1 className="page-title mb-1">Học phí của con</h1>
            <p className="page-subtitle text-muted mb-0">
              Quản lý và chuyển khoản học phí trực tuyến cho học sinh <strong>{selectedChild?.name}</strong> ({selectedChild?.grade})
            </p>
          </div>

          {selectedChild && (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-person-check me-1"></i> Hồ sơ: {selectedChild.name}
            </span>
          )}
        </div>

        {errorMsg && (
          <div className="alert alert-danger rounded-4 border-0 shadow-xs mb-4 d-flex align-items-center justify-content-between">
            <div>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {errorMsg}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => setErrorMsg(null)}
              aria-label="Close"
            />
          </div>
        )}

        {bill && (
          <>
            {/* 2. Bill Card (Hóa đơn học phí hiện tại) */}
            <TuitionBillCard bill={bill} />

            {/* 3. Payment CTA Action (DÀNH RIÊNG CHO PHỤ HUYNH CÓ NÚT THANH TOÁN) */}
            <TuitionPaymentCTA
              onPayNow={() => setModalOpen(true)}
              totalUnpaidAmount={totalUnpaid}
            />

            {/* 4. Payment History Section (Lịch sử các giao dịch) */}
            <TuitionHistorySection history={history} />

            {/* Payment Modal (Chuyển khoản ngân hàng trực tiếp) */}
            <TuitionPaymentModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              studentName={selectedChild?.name}
              period={bill.period}
              totalAmountText={bill.totalAmount}
              unpaidInvoices={unpaidInvoices}
              onConfirmPayment={handleConfirmPayment}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default ParentTuitionPage;
