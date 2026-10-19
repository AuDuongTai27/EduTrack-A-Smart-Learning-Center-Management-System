import PageHeader from "../../../components/Common/PageHeader";
import { ScheduleListHeader, ScheduleListToolbar, ScheduleTable, ScheduleListPagination } from "../../../components/teacher/Teacher/schedule";

export default function TeacherSchedulePage() {
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

        {/* Table */}
        <ScheduleTable />

        {/* Footer Pagination */}
        <ScheduleListPagination />

      </div>
    </>
  );
}
