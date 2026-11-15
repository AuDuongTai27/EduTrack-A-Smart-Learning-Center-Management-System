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

  // Search, Filter, Sort & Pagination states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10; // Cố định mặc định 10 lớp mỗi trang

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

  const filteredAndSortedClasses = useMemo(() => {
    let result = [...classes];

    // Lọc theo trạng thái
    if (statusFilter !== "all") {
      result = result.filter((c) => {
        const isActive =
          c.status?.toLowerCase() === "active" ||
          c.status === "Đang học" ||
          c.status === "open";
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    // Tìm kiếm theo từ khóa
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

    // Sắp xếp tự nhiên theo tên lớp (ví dụ: Class 8 < Class 9, Lớp 10 < Lớp 11)
    result.sort((a, b) => {
      const comp = a.className.localeCompare(b.className, "vi", {
        numeric: true,
        sensitivity: "base",
      });
      return sortOrder === "asc" ? comp : -comp;
    });

    return result;
  }, [classes, statusFilter, searchTerm, sortOrder]);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredAndSortedClasses.slice(start, start + rowsPerPage);
  }, [filteredAndSortedClasses, currentPage, rowsPerPage]);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="My Classes"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Class List" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Loading assigned classes...</span>
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
        />

        {/* Table */}
        <ClassListTable
          classes={paginatedClasses}
          sortOrder={sortOrder}
          onToggleSort={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
        />

        {/* Footer Pagination */}
        <ClassListPagination
          totalItems={filteredAndSortedClasses.length}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </>
  );
}
