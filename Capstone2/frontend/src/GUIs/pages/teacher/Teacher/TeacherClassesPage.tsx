import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  ClassListHeader,
  ClassListPagination,
  ClassListTable,
  ClassListToolbar,
} from "../../../components/teacher/Teacher/classes";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingClassItemDto } from "../../../../BLL/models/teaching/TeachingClassItemDto";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeachingClassItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      try {
        setLoading(true);
        const res = await teachingDAL.getMyClasses(DEFAULT_TEACHER_ID);
        if (isMounted && res.data) {
          setClasses(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách lớp học của giáo viên:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadClasses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Lớp Học Của Tôi"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Danh sách lớp học" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải danh sách lớp học phụ trách...</span>
        </div>
      )}

      {/* Class list section */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <ClassListHeader />

        {/* Toolbar */}
        <ClassListToolbar />

        {/* Table */}
        <ClassListTable classes={classes} />

        {/* Footer Pagination */}
        <ClassListPagination />
      </div>
    </>
  );
}
