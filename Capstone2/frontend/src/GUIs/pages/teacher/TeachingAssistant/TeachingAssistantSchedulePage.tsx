import PageHeader from "../../../components/Common/PageHeader";
import {
  ScheduleListHeader,
  ScheduleListPagination,
  ScheduleListToolbar,
  ScheduleTable,
} from "../../../components/teacher/TeachingAssistant/schedule";

export default function TeachingAssistantSchedulePage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="Schedule Classes"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
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
