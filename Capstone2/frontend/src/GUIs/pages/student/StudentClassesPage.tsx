import React, { useState, useEffect } from 'react';
import { ClassesGridSection } from '../../components/student/classes/ClassesGridSection';
import { classDAL } from '../../../DAL/classDAL';
import {
  MOCK_ENROLLED_CLASSES,
  mapClassDtoToEnrolledItem,
  type EnrolledClassItem,
} from '../../components/student/classes/classesData';

export function StudentClassesPage() {
  const [classes, setClasses] = useState<EnrolledClassItem[]>(MOCK_ENROLLED_CLASSES);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      try {
        setLoading(true);
        const result = await classDAL.getAllClasses();
        if (isMounted && result.data && result.data.length > 0) {
          const mappedItems = result.data.map(mapClassDtoToEnrolledItem);
          setClasses(mappedItems);
        }
      } catch (err) {
        console.warn('Lỗi khi tải danh sách lớp học:', err);
        if (isMounted) {
          setClasses(MOCK_ENROLLED_CLASSES);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="main-content">
      <div className="content-container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Lớp học</h1>
          <p className="page-subtitle">Tất cả lớp học bạn đang tham gia trong kỳ này</p>
        </div>

        {/* Section Header & Classes Grid */}
        <ClassesGridSection classes={classes} loading={loading} />
      </div>
    </main>
  );
};

export default StudentClassesPage;

