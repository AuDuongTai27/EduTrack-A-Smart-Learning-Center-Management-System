import PageHeader from "../../../components/Common/PageHeader";
import {
  RequestListHeader,
  RequestTable,
  RequestPagination
} from "../../../components/teacher/Teacher/request";
export default function TeacherRequestPage() {
  return (
    <>
      {/* Page Header Title & Breadcrumb */}
      <PageHeader
        title="Request List"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Request" },
        ]}
      />

      {/* Sent Requests List */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <RequestListHeader />

        {/* Toolbar & Table */}
        <RequestTable />

        {/* Footer Pagination */}
        <RequestPagination />
      </div>
    </>
  );
}
