import PageHeader from "../../../components/Common/PageHeader";
import {
  RequestListHeader,
  RequestPagination,
  RequestTable,
} from "../../../components/teacher/TeachingAssistant/request";

export default function TeachingAssistantRequestPage() {
  return (
    <>
      {/* Page Header Title & Breadcrumb */}
      <PageHeader
        title="Request List"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
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
