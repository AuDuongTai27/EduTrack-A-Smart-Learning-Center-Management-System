import PageHeader from "../../../components/Common/PageHeader";
import { ClassListHeader, ClassListPagination, ClassListTable, ClassListToolbar } from "../../../components/teacher/Teacher/classes";
export default function TeacherClassesPage() {
  return (
    <>
      {/* Breadcrumb & Page Title */}
      <PageHeader
        title="My Classes"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
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
