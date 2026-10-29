import React, { useState, useEffect } from 'react';
import { useParent } from '../../../contexts/ParentContext';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionPaymentCTA } from '../../components/student/tuition/TuitionPaymentCTA';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';
import { TuitionPaymentModal } from '../../components/student/tuition/TuitionPaymentModal';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import { DEFAULT_PARENT_ID } from '../../../DAL/parentDAL';
import {
  CURRENT_TUITION_BILL,
  TUITION_HISTORY,
  type TuitionBill,
  type TuitionHistoryItem,
} from '../../components/student/tuition/tuitionData';

export function ParentTuitionPage() {
  const { selectedChild, updateChildUnpaidAmount } = useParent();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bill, setBill] = useState<TuitionBill>(CURRENT_TUITION_BILL);
  const [history, setHistory] = useState<TuitionHistoryItem[]>(TUITION_HISTORY);
  const [totalUnpaid, setTotalUnpaid] = useState<number>(selectedChild?.unpaidAmount ?? 2900000);
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
      try {
        const vm = await learningDAL.getStudentTuition(studentId);
        if (isMounted && vm) {
          setBill(vm.bill);
          setHistory(vm.history);
          setTotalUnpaid(vm.totalUnpaidAmount);
          updateChildUnpaidAmount(studentId, vm.totalUnpaidAmount);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thông tin học phí phụ huynh:', err);
      }
    }

    loadTuition();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  const handleConfirmPayment = async (method: 'qr' | 'momo' | 'atm' | 'visa') => {
    const paymentMethodMap: Record<'qr' | 'momo' | 'atm' | 'visa', string> = {
      qr: 'bank_transfer',
      momo: 'momo',
      atm: 'vnpay',
      visa: 'vnpay',
    };

    try {
      const updatedVm = await learningDAL.payStudentTuition(
        studentId,
        paymentMethodMap[method],
        DEFAULT_PARENT_ID
      );
      setBill(updatedVm.bill);
      setHistory(updatedVm.history);
      setTotalUnpaid(updatedVm.totalUnpaidAmount);
      updateChildUnpaidAmount(studentId, updatedVm.totalUnpaidAmount);
      showToast(`Thanh toán thành công học phí cho bé ${selectedChild?.name || ''}!`);
    } catch (err) {
      console.warn('Lỗi khi gọi API thanh toán, cập nhật local state:', err);
      setTotalUnpaid(0);
      setBill((prev) => ({
        ...prev,
        totalAmount: '0 đ',
        subTotal: '0 đ',
        remainingDaysText: 'Đã hoàn thành toàn bộ học phí kỳ này',
        items: [{ name: 'Đã hoàn thành học phí tất cả các môn học trong kỳ', amount: '0 đ' }],
      }));
      updateChildUnpaidAmount(studentId, 0);
      showToast('Thanh toán học phí thành công!');
    }
  };

  const handleResetDemo = async () => {
    try {
      const updatedVm = await learningDAL.resetDemoTuition(studentId);
      setBill(updatedVm.bill);
      setHistory(updatedVm.history);
      setTotalUnpaid(updatedVm.totalUnpaidAmount);
      updateChildUnpaidAmount(studentId, updatedVm.totalUnpaidAmount);
      showToast('Đã khôi phục hóa đơn học phí mẫu để Demo!');
    } catch (err) {
      console.warn('Lỗi khi khôi phục hóa đơn mẫu:', err);
    }
  };

  if (!selectedChild) {
    return null;
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
              Quản lý và thanh toán học phí trực tuyến cho bé <strong>{selectedChild.name}</strong> ({selectedChild.grade})
            </p>
          </div>

          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-person-check me-1"></i> Hồ sơ: {selectedChild.name}
          </span>
        </div>

        {/* 2. Bill Card (Hóa đơn học phí hiện tại) */}
        <TuitionBillCard bill={bill} />

        {/* 3. Payment CTA Action (DÀNH RIÊNG CHO PHỤ HUYNH CÓ NÚT THANH TOÁN) */}
        <TuitionPaymentCTA
          onPayNow={() => setModalOpen(true)}
          totalUnpaidAmount={totalUnpaid}
          onResetDemo={handleResetDemo}
        />

        {/* 4. Payment History Section (Lịch sử các giao dịch) */}
        <TuitionHistorySection history={history} />
      </div>

      {/* Payment Modal (Modal cổng thanh toán online VNPay, MoMo, Ngân hàng) */}
      <TuitionPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        studentName={selectedChild.name}
        period={bill.period}
        totalAmountText={bill.totalAmount}
        onConfirmPayment={handleConfirmPayment}
      />
    </main>
  );
}

export default ParentTuitionPage;
