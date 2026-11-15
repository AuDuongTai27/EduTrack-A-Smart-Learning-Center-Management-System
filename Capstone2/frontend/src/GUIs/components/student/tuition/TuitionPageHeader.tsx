import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

export function TuitionPageHeader() {
  return (
    <StudentPageHeader
      title="Tuition & Payments"
      subtitle={
        <>
          Billing period <span className="fw-semibold text-dark">August 2026</span> · View fee details and your payment history.
        </>
      }
      breadcrumbs={[
        { label: 'Home', href: '/student/dashboard' },
        { label: 'Tuition & Payments' },
      ]}
    />
  );
}

export default TuitionPageHeader;
