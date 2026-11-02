import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import { ScheduleListHeader, ScheduleListToolbar, ScheduleTable, ScheduleListPagination } from "../../../components/teacher/Teacher/schedule";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { TeachingScheduleItemDto } from "../../../../BLL/models/teaching/TeachingScheduleDto";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

export default function TeacherSchedulePage() {
  const [schedules, setSchedules] = useState<TeachingScheduleItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Schedule Classes"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Schedule" },
        ]}
      />

      {/* Schedule Classes Section */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <ScheduleListHeader />

        {/* Toolbar: Entries select & Search */}
        <ScheduleListToolbar />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải thời khóa biểu giảng dạy...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <ScheduleTable schedules={schedules} />

            {/* Footer Pagination */}
            <ScheduleListPagination />
          </>
        )}
      </div>
    </>
  );
}
