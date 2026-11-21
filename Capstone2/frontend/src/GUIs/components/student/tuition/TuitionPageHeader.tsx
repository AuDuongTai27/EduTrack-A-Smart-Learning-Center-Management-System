import React from 'react';
import { StudentPageHeader } from '../common/StudentPageHeader';

export function TuitionPageHeader() {
  return (
    <StudentPageHeader
      title="Tuition & Payments"
      breadcrumbs={[
        { label: 'Home', href: '/student/dashboard' },
        { label: 'Tuition & Payments' },
      ]}
    />
  );
}

export default TuitionPageHeader;
