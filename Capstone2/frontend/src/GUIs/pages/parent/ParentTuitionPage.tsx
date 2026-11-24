import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const processedVnPayRef = useRef<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bill, setBill] = useState<TuitionBill | null>(null);
  const [history, setHistory] = useState<TuitionHistoryItem[]>([]);
  const [totalUnpaid, setTotalUnpaid] = useState<number>(0);
  const [unpaidInvoices, setUnpaidInvoices] = useState<TuitionInvoiceItemApiDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyingVnPay, setVerifyingVnPay] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const studentId = selectedChild?.id || DEFAULT_STUDENT_ID;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Xử lý callback khi VNPay Sandbox redirect quay về /parent/tuition?vnp_Amount=...&vnp_ResponseCode=...
  useEffect(() => {
    const vnpResponseCode = searchParams.get('vnp_ResponseCode');
    const vnpTxnRef = searchParams.get('vnp_TxnRef');
    const vnpSecureHash = searchParams.get('vnp_SecureHash');

    if (!vnpResponseCode || !vnpTxnRef || !vnpSecureHash) {
      return;
    }

    const callbackKey = `${vnpTxnRef}_${vnpResponseCode}`;
    if (processedVnPayRef.current === callbackKey) {
      return;
    }
    processedVnPayRef.current = callbackKey;

    const queryParamsObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        queryParamsObj[key] = value;
      }
    });

    async function processVnPayCallback() {
      setVerifyingVnPay(true);
      setErrorMsg(null);
      try {
        const result = await learningDAL.verifyVnPayReturn(
          queryParamsObj,
          studentId,
          DEFAULT_PARENT_ID
        );

        if (result.tuitionVm) {
          setBill(result.tuitionVm.bill);
          setHistory(result.tuitionVm.history);
          setTotalUnpaid(result.tuitionVm.totalUnpaidAmount);
          setUnpaidInvoices(result.tuitionVm.unpaidInvoices || []);
          updateChildUnpaidAmount(result.tuitionVm.studentId, result.tuitionVm.totalUnpaidAmount);
        }

        if (result.isSuccess) {
          showToast(result.message || 'VNPay online tuition payment completed successfully!');
        } else {
          setErrorMsg(result.message || 'VNPay payment was cancelled or failed.');
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'Failed to verify VNPay payment response from the server.'
        );
      } finally {
        setVerifyingVnPay(false);
        // Xóa các tham số vnp_* trên thanh địa chỉ để tránh xử lý lại khi F5
        setSearchParams({}, { replace: true });
      }
    }

    processVnPayCallback();
  }, [searchParams, setSearchParams, studentId, updateChildUnpaidAmount]);

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
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load tuition data from the system.');
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

  const handlePayWithVnPay = async (selectedInvoiceIds?: number[]) => {
    setErrorMsg(null);
    try {
      const returnUrl = `${window.location.origin}${window.location.pathname}`;
      const vnpRes = await learningDAL.createVnPayPaymentUrl(
        studentId,
        DEFAULT_PARENT_ID,
        selectedInvoiceIds,
        returnUrl
      );
      if (!vnpRes?.paymentUrl) {
        throw new Error('Could not generate VNPay Sandbox payment URL.');
      }
      window.location.href = vnpRes.paymentUrl;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to initiate VNPay Sandbox payment.');
      throw err;
    }
  };

  if (parentLoading || verifyingVnPay || (loading && !bill)) {
    return (
      <LearnerPageLoader
        title={verifyingVnPay ? 'Verifying VNPay payment...' : 'Loading tuition information...'}
        message={
          verifyingVnPay
            ? 'Checking VNPay digital signature and updating your child’s tuition invoice status.'
            : "The system is checking current term invoices and child's tuition payment history."
        }
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
            <h1 className="page-title mb-0">Child's Tuition</h1>
          </div>
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
            {totalUnpaid > 0 && (
              <TuitionPaymentCTA
                onPayNow={() => setModalOpen(true)}
                totalUnpaidAmount={totalUnpaid}
              />
            )}

            {/* 4. Payment History Section (Lịch sử các giao dịch) */}
            <TuitionHistorySection history={history} />

            {/* Payment Modal (Thanh toán trực tuyến qua cổng VNPay Sandbox) */}
            <TuitionPaymentModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              studentName={selectedChild?.name}
              period={bill.period}
              totalAmountText={bill.totalAmount}
              unpaidInvoices={unpaidInvoices}
              onPayWithVnPay={handlePayWithVnPay}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default ParentTuitionPage;
