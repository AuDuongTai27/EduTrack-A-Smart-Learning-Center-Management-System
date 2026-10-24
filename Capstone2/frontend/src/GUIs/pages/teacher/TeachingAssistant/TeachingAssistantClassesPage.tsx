import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  ClassListHeader,
  ClassListPagination,
  ClassListTable,
  ClassListToolbar,
} from "../../../components/teacher/TeachingAssistant/classes";
import { classDAL } from "../../../../DAL/classDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";

export default function TeachingAssistantClassesPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      try {
        const res = await classDAL.getAllClasses();
        if (isMounted && res.data) {
          setClasses(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách lớp TA:", err);
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
        title="Danh Sách Lớp Học Trợ Giảng"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Lớp học phụ trách" },
        ]}
      />

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
