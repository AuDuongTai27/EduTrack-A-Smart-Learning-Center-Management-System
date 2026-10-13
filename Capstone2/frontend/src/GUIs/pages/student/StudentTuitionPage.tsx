import React from 'react';
import { TuitionPageHeader } from '../../components/student/tuition/TuitionPageHeader';
import { TuitionBillCard } from '../../components/student/tuition/TuitionBillCard';
import { TuitionHistorySection } from '../../components/student/tuition/TuitionHistorySection';

export const StudentTuitionPage: React.FC = () => {
  return (
    <main className="main-content">
      <div className="content-container tuition-container">
        {/* 1. Breadcrumbs & Page Header */}
        <TuitionPageHeader />

        {/* 2. Bill Card (2-Column Grid) */}
        <TuitionBillCard />

        {/* 3. Student Notice (Học sinh chỉ xem thông tin, Phụ huynh thực hiện thanh toán) */}
        <div className="alert alert-info border-0 rounded-4 p-3 d-flex align-items-center gap-3 my-4 bg-primary bg-opacity-10 text-primary">
          <i className="bi bi-info-circle-fill fs-4 flex-shrink-0"></i>
          <div className="small">
            <strong>Thông báo học phí:</strong> Học sinh chỉ xem chi tiết hóa đơn và lịch sử giao dịch. Chức năng thanh toán trực tuyến do <strong>Phụ huynh</strong> thực hiện trên Cổng phụ huynh hoặc đóng trực tiếp tại bàn Giáo vụ trung tâm EduTrack.
          </div>
        </div>

        {/* 4. Payment History Section */}
        <TuitionHistorySection />
      </div>
    </main>
  );
};

export default StudentTuitionPage;

