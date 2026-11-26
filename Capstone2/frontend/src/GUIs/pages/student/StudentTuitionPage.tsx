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

            {/* 3. Payment History Section */}
            <div className="mt-4">
              <TuitionHistorySection history={history} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default StudentTuitionPage;
