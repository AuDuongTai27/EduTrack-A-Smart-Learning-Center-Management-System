import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  RequestListHeader,
  RequestTable,
  RequestPagination
} from "../../../components/teacher/Teacher/request";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function TeacherRequestPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      try {
        setLoading(true);
        // GetAll: Fetch all approval requests
        const res = await feedbackDAL.getAllRequests();
        if (isMounted) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error("Failed to load approval requests:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, []);

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

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Loading requests...</p>
          </div>
        ) : (
          <>
            {/* Toolbar & Table */}
            <RequestTable requests={requests} />

            {/* Footer Pagination */}
            <RequestPagination />
          </>
        )}
      </div>
    </>
  );
}
