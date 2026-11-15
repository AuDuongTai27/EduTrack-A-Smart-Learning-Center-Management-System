import React, { useState, useEffect } from 'react';
import { LearnerPageLoader } from '../../components/student/common/LearnerPageLoader';
import { TuitionPageHeader } from '../../components/student/tuition/TuitionPageHeader';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import type {
  TuitionBill,
  TuitionHistoryItem,
} from '../../components/student/tuition/tuitionData';

export function StudentTuitionPage() {
  const [bill, setBill] = useState<TuitionBill | null>(null);
  const [history, setHistory] = useState<TuitionHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadTuition = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const vm = await learningDAL.getStudentTuition(DEFAULT_STUDENT_ID);
      if (vm) {
        setBill(vm.bill);
        setHistory(vm.history);
      }
    } catch (err) {
      console.warn('Lỗi khi tải thông tin học phí học sinh:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load tuition information from the system.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTuition();
  }, []);

  if (loading && !bill) {
    return (
      <LearnerPageLoader
        title="Loading tuition information..."
        message="The system is checking current term invoices and your payment history."
        containerClassName="tuition-container"
      />
    );
  }

  return (
    <main className="main-content">
      <div className="content-container tuition-container">
        {/* 1. Breadcrumbs & Page Header */}
        <TuitionPageHeader />

        {errorMsg && (
          <div className="alert alert-danger rounded-4 border-0 shadow-xs mb-4 d-flex align-items-center justify-content-between">
            <div>
              <i className="bi bi-exclamation-triangle-fill me-2" />
              {errorMsg}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger rounded-pill px-3"
              onClick={() => void loadTuition()}
            >
              Retry
            </button>
          </div>
        )}

        {bill && (
          <>
            {/* 2. Bill Card (2-Column Grid) */}
            <TuitionBillCard bill={bill} />

            {/* 3. Student Notice (Học sinh chỉ xem thông tin, Phụ huynh thực hiện thanh toán) */}
            <div className="alert alert-info border-0 rounded-4 p-3 d-flex align-items-center gap-3 my-4 bg-primary bg-opacity-10 text-primary">
              <i className="bi bi-info-circle-fill fs-4 flex-shrink-0"></i>
              <div className="small">
                <strong>Tuition Notice:</strong> Students can only view their invoice details and transaction history. Online payment is carried out by <strong>Parents</strong> on the Parent Portal or paid directly at the EduTrack Center Admin Staff desk.
              </div>
            </div>

            {/* 4. Payment History Section */}
            <TuitionHistorySection history={history} />
          </>
        )}
      </div>
    </main>
  );
}

export default StudentTuitionPage;
