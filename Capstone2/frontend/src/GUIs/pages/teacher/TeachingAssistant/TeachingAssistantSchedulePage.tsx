import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  ScheduleListHeader,
  ScheduleListPagination,
  ScheduleListToolbar,
  ScheduleTable,
} from "../../../components/teacher/TeachingAssistant/schedule";
import scheduleDAL from "../../../../DAL/scheduleDAL";
import type { ClassScheduleDto } from "../../../../BLL/models/ClassScheduleDto";

export default function TeachingAssistantSchedulePage() {
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadSchedules() {
      try {
        setLoading(true);
        const res = await scheduleDAL.getAllClassSchedules();
        if (isMounted && res.data) {
          setSchedules(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải lịch trợ giảng:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadSchedules();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Lịch Trợ Giảng &amp; Thời Khóa Biểu"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Thời khóa biểu trợ giảng" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải danh sách lịch học trợ giảng...</span>
        </div>
      )}

      {/* Schedule Classes Section */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <ScheduleListHeader />

        {/* Toolbar: Entries select & Search */}
        <ScheduleListToolbar />

        {/* Table */}
        <ScheduleTable schedules={schedules} />

        {/* Footer Pagination */}
        <ScheduleListPagination />
      </div>
    </>
  );
}
