import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

export function TuitionPageHeader() {
  return (
    <StudentPageHeader
      title="Học phí và Thanh toán"
      subtitle={
        <>
          Kỳ học <span className="fw-semibold text-dark">Tháng 8 / 2026</span> · Xem chi tiết chi phí và lịch sử đóng học phí của bạn.
        </>
      }
      breadcrumbs={[
        { label: 'Trang chủ', href: '/student/dashboard' },
        { label: 'Học phí và Thanh toán' },
      ]}
    />
  );
}

export default TuitionPageHeader;
