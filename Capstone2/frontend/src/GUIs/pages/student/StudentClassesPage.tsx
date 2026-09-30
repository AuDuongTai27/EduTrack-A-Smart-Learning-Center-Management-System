import React from 'react';
import { ClassesGridSection } from '../../components/student/classes/ClassesGridSection';

export const StudentClassesPage: React.FC = () => {
  return (
    <main className="main-content">
      <div className="content-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Lớp học</h1>
          <p className="page-subtitle">Tất cả lớp học bạn đang tham gia trong kỳ này</p>
        </div>

        {/* Section Header & Classes Grid */}
        <ClassesGridSection />
      </div>
    </main>
  );
};

export default StudentClassesPage;
