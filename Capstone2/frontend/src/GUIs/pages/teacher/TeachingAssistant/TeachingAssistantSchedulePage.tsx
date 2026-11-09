import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  ScheduleListHeader,
  ScheduleListToolbar,
  ScheduleTable,
  ScheduleListPagination,
  type SortField,
  type SortOrder,
} from "../../../components/teacher/TeachingAssistant/schedule";
import { ScheduleTimetableCard } from "../../../components/student/schedule/ScheduleTimetableCard";
import { ScheduleLegendStrip } from "../../../components/student/schedule/ScheduleLegendStrip";
import {
  getMonday,
  addDays,
  fmtDayMon,
  mapTeachingScheduleDtoToSessionItem,
  type SessionItem,
} from "../../../components/student/schedule/scheduleData";
import teachingDAL, { DEFAULT_TA_ID } from "../../../../DAL/teachingDAL";
import type { TeachingScheduleItemDto } from "../../../../BLL/models/teaching/TeachingScheduleDto";

export default function TeachingAssistantSchedulePage() {
  const [schedules, setSchedules] = useState<TeachingScheduleItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Search, Day Filter, Status Filter & Sorting states (for List view)
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("dayOfWeek");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  useEffect(() => {
    let isMounted = true;
    async function fetchSchedules() {
      try {
        setLoading(true);
        const res = await teachingDAL.getMySchedule(DEFAULT_TA_ID);
        if (isMounted && res.data) {
          setSchedules(res.data);
        }
      } catch (err) {
        console.error("Failed to load TA schedules:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSchedules();
    return () => {
      isMounted = false;
    };
  }, []);

  // Calendar dates computation
  const todayDate = new Date();
  const todayRef = new Date(todayDate.toDateString());

  const monday = addDays(getMonday(todayRef), weekOffset * 7);
  const sunday = addDays(monday, 6);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const todayIdx = days.findIndex(
    (d) => d.toDateString() === todayRef.toDateString()
  );

  const weekRangeText = `${fmtDayMon(monday)} – ${fmtDayMon(sunday)}`;

  // Convert schedules to SessionItems for the calendar timetable grid (isTa = true)
  const calendarSessions: SessionItem[] = useMemo(() => {
    return schedules.map((s, idx) => mapTeachingScheduleDtoToSessionItem(s, true, idx));
  }, [schedules]);

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev: SortOrder) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const DAY_ORDER: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };

  // Filtered and Sorted schedules for List view
  const filteredSchedules = useMemo(() => {
    let result = schedules;

    // Filter by day
    if (dayFilter !== "all") {
      result = result.filter((s) => s.dayOfWeek?.toLowerCase() === dayFilter.toLowerCase());
    }

    // Filter by status (all / active / inactive)
    if (statusFilter !== "all") {
      result = result.filter(
        (s) => (s.status || "active").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.className.toLowerCase().includes(term) ||
          (s.subjectName && s.subjectName.toLowerCase().includes(term)) ||
          (s.room && s.room.toLowerCase().includes(term)) ||
          (s.teacherName && s.teacherName.toLowerCase().includes(term))
      );
    }

    // Sorting
    return [...result].sort((a: any, b: any) => {
      let comparison = 0;
      if (sortField === "className") {
        comparison = (a.className || "").localeCompare(b.className || "");
      } else if (sortField === "dayOfWeek") {
        const orderA = DAY_ORDER[(a.dayOfWeek || "").toLowerCase()] ?? 99;
        const orderB = DAY_ORDER[(b.dayOfWeek || "").toLowerCase()] ?? 99;
        comparison = orderA - orderB;
      } else if (sortField === "time") {
        comparison = (a.startTime || "").localeCompare(b.startTime || "");
      } else if (sortField === "studentCount") {
        const countA = a.studentCount ?? 0;
        const countB = b.studentCount ?? 0;
        comparison = countA - countB;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [schedules, dayFilter, statusFilter, searchTerm, sortField, sortOrder]);

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredSchedules.slice(start, start + rowsPerPage);
  }, [filteredSchedules, currentPage, rowsPerPage]);

  const headerActions = (
    <div className="d-flex flex-wrap align-items-center gap-2">
      {/* Week Navigator (shown in calendar mode) */}
      {viewMode === "calendar" && (
        <div className="week-navigator-controls d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn-week-today"
            id="btnWeekToday"
            onClick={() => setWeekOffset(0)}
          >
            Hôm nay
          </button>

          <div className="week-nav-group d-flex align-items-center">
            <button
              type="button"
              className="btn-week-nav"
              id="btnWeekPrev"
              aria-label="Tuần trước"
              onClick={() => setWeekOffset((w) => w - 1)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="week-range-text px-2" id="weekRangeText">
              {weekRangeText}
            </span>
            <button
              type="button"
              className="btn-week-nav"
              id="btnWeekNext"
              aria-label="Tuần sau"
              onClick={() => setWeekOffset((w) => w + 1)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* View Mode Toggle (Fixed at far right) */}
      <div className="btn-group btn-group-sm ms-auto" role="group" aria-label="Chế độ hiển thị">
        <button
          type="button"
          className={`btn ${viewMode === "calendar" ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setViewMode("calendar")}
          title="Lịch biểu"
        >
          <i className="bi bi-calendar3"></i>
        </button>
        <button
          type="button"
          className={`btn ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"}`}
          onClick={() => setViewMode("list")}
          title="Danh sách"
        >
          <i className="bi bi-list-ul"></i>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Breadcrumb & Page Title with Actions */}
      <PageHeader
        title="Lịch Trực & Ca Trợ Giảng"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Lịch trực" },
        ]}
        action={headerActions}
      />

      {loading ? (
        <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-3">
          <div className="spinner-border text-primary mx-auto mb-2" role="status" />
          <p className="text-muted mb-0">Đang tải lịch trực trợ giảng...</p>
        </div>
      ) : viewMode === "calendar" ? (
        /* Calendar Timetable Mode */
        <div className="d-flex flex-column gap-3 mb-4">
          {/* Summary Strip */}
          <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-4 border shadow-sm">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-semibold">
                <i className="bi bi-calendar-week me-1"></i> Lịch trực ca tuần
              </span>
              <span className="small text-muted">
                Tổng cộng <strong>{calendarSessions.length}</strong> ca trực trợ giảng đã xếp lịch
              </span>
            </div>
            <span className="small text-muted d-none d-md-inline">
              <i className="bi bi-clock me-1"></i> Giờ trực theo múi giờ Việt Nam (GMT+7)
            </span>
          </div>

          {/* Calendar Timetable Card */}
          <ScheduleTimetableCard
            days={days}
            todayIdx={todayIdx}
            weekOffset={weekOffset}
            todayDate={todayDate}
            sessions={calendarSessions}
          />

          {/* Legend Strip */}
          <ScheduleLegendStrip />
        </div>
      ) : (
        /* List / Table Mode */
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
            statusFilter={statusFilter}
            onStatusFilterChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          />

          {/* Table */}
          <ScheduleTable
            schedules={paginatedSchedules}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Footer Pagination */}
          <ScheduleListPagination
            totalItems={filteredSchedules.length}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </>
  );
}
