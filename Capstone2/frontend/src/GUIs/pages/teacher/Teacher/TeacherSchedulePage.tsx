import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import { ScheduleListHeader, ScheduleListToolbar, ScheduleTable, ScheduleListPagination } from "../../../components/teacher/Teacher/schedule";
import teachingDAL, { DEFAULT_TEACHER_ID } from "../../../../DAL/teachingDAL";
import type { TeachingScheduleItemDto } from "../../../../BLL/models/teaching/TeachingScheduleDto";

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<TeachingScheduleItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search, Day Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  useEffect(() => {
    let isMounted = true;
    async function fetchSchedules() {
      try {
        setLoading(true);
        const res = await teachingDAL.getMySchedule(DEFAULT_TEACHER_ID);
        if (isMounted && res.data) {
          setSchedules(res.data);
        }
      } catch (err) {
        console.error("Failed to load teacher schedules:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSchedules();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSchedules = useMemo(() => {
    let result = schedules;
    if (dayFilter !== "all") {
      result = result.filter((s) => s.dayOfWeek?.toLowerCase() === dayFilter.toLowerCase());
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.className.toLowerCase().includes(term) ||
          (s.room && s.room.toLowerCase().includes(term)) ||
          (s.taName && s.taName.toLowerCase().includes(term))
      );
    }
    return result;
  }, [schedules, dayFilter, searchTerm]);

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSchedules.slice(start, start + rowsPerPage);
  }, [filteredSchedules, currentPage, rowsPerPage]);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Thời Khóa Biểu Giảng Dạy"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Thời khóa biểu" },
        ]}
      />

      {/* Schedule Classes Section */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header */}
        <ScheduleListHeader />

        {/* Toolbar: Entries select & Search & Day filter */}
        <ScheduleListToolbar
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          dayFilter={dayFilter}
          onDayFilterChange={(val) => {
            setDayFilter(val);
            setCurrentPage(1);
          }}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(val) => {
            setRowsPerPage(val);
            setCurrentPage(1);
          }}
          totalFiltered={filteredSchedules.length}
          totalAll={schedules.length}
        />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải thời khóa biểu giảng dạy...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <ScheduleTable schedules={paginatedSchedules} />

            {/* Footer Pagination */}
            <ScheduleListPagination
              totalItems={filteredSchedules.length}
              currentPage={currentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </>
  );
}
