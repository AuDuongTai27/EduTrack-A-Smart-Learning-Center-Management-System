import React, { useState, useEffect } from 'react';
import { TuitionPageHeader } from '../../components/student/tuition/TuitionPageHeader';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';
import { learningDAL, DEFAULT_STUDENT_ID } from '../../../DAL/learningDAL';
import {
  CURRENT_TUITION_BILL,
  TUITION_HISTORY,
  type TuitionBill,
  type TuitionHistoryItem,
} from '../../components/student/tuition/tuitionData';

export function StudentTuitionPage() {
  const [bill, setBill] = useState<TuitionBill>(CURRENT_TUITION_BILL);
  const [history, setHistory] = useState<TuitionHistoryItem[]>(TUITION_HISTORY);

  useEffect(() => {
    let isMounted = true;

    async function loadTuition() {
      try {
        const vm = await learningDAL.getStudentTuition(DEFAULT_STUDENT_ID);
        if (isMounted && vm) {
          setBill(vm.bill);
          setHistory(vm.history);
        }
      } catch (err) {
        console.warn('Lỗi khi tải thông tin học phí học sinh:', err);
      }
    }

    loadTuition();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="main-content">
      <div className="content-container tuition-container">
        {/* 1. Breadcrumbs & Page Header */}
        <TuitionPageHeader />

        {/* 2. Bill Card (2-Column Grid) */}
        <TuitionBillCard bill={bill} />

        {/* 3. Student Notice (Học sinh chỉ xem thông tin, Phụ huynh thực hiện thanh toán) */}
        <div className="alert alert-info border-0 rounded-4 p-3 d-flex align-items-center gap-3 my-4 bg-primary bg-opacity-10 text-primary">
          <i className="bi bi-info-circle-fill fs-4 flex-shrink-0"></i>
          <div className="small">
            <strong>Thông báo học phí:</strong> Học sinh chỉ xem chi tiết hóa đơn và lịch sử giao dịch của mình. Chức năng thanh toán trực tuyến do <strong>Phụ huynh</strong> thực hiện trên Cổng phụ huynh hoặc đóng trực tiếp tại bàn Giáo vụ trung tâm EduTrack.
          </div>
        </div>

        {/* 4. Payment History Section */}
        <TuitionHistorySection history={history} />
      </div>
    </main>
  );
}

export default StudentTuitionPage;
