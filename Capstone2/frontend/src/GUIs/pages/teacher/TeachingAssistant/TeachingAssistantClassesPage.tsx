import PageHeader from "../../../components/Common/PageHeader";
import {
  ClassListHeader,
  ClassListPagination,
  ClassListTable,
  ClassListToolbar,
} from "../../../components/teacher/TeachingAssistant/classes";

export default function TeachingAssistantClassesPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="My Classes"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "My Classes" },
        ]}
      />

      {/* Class list section */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <ClassListHeader />

        {/* Toolbar */}
        <ClassListToolbar />

        {/* Table */}
        <ClassListTable />

        {/* Footer Pagination */}
        <ClassListPagination />
      </div>
    </>
  );
}
