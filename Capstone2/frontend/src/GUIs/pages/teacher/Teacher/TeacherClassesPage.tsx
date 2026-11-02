import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  ClassListHeader,
  ClassListPagination,
  ClassListTable,
  ClassListToolbar,
} from "../../../components/teacher/Teacher/classes";
import teachingDAL, { DEFAULT_TEACHER_ID } from "../../../../DAL/teachingDAL";
import type { TeachingClassItemDto } from "../../../../BLL/models/teaching/TeachingClassItemDto";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<TeachingClassItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

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

  const filteredClasses = useMemo(() => {
    let result = classes;
    if (statusFilter !== "all") {
      result = result.filter((c) => {
        const isActive = c.status?.toLowerCase() === "active" || c.status === "Đang học" || c.status === "open";
        return statusFilter === "active" ? isActive : !isActive;
      });
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.className.toLowerCase().includes(term) ||
          (c.subjectName && c.subjectName.toLowerCase().includes(term)) ||
          (c.room && c.room.toLowerCase().includes(term)) ||
          String(c.classId).includes(term)
      );
    }
    return result;
  }, [classes, statusFilter, searchTerm]);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredClasses.slice(start, start + rowsPerPage);
  }, [filteredClasses, currentPage, rowsPerPage]);

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
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header */}
        <ClassListHeader />

        {/* Toolbar */}
        <ClassListToolbar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => {
            setRowsPerPage(val);
            setCurrentPage(1);
          }}
          totalFiltered={filteredClasses.length}
          totalAll={classes.length}
        />

        {/* Table */}
        <ClassListTable classes={paginatedClasses} />

        {/* Footer Pagination */}
        <ClassListPagination
          totalItems={filteredClasses.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
