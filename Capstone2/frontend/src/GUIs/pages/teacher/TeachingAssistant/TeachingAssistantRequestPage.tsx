import { useEffect, useState } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  RequestListHeader,
  RequestPagination,
  RequestTable,
} from "../../../components/teacher/TeachingAssistant/request";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function TeachingAssistantRequestPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRequests() {
      try {
        setLoading(true);
        const res = await feedbackDAL.getAllRequests();
        if (isMounted && res.data) {
          setRequests(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách yêu cầu TA:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {/* Page Header Title & Breadcrumb */}
      <PageHeader
        title="Đơn Từ &amp; Yêu Cầu Đã Gửi"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teaching-assistant/dashboard" },
          { label: "Yêu cầu trợ giảng" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang tải danh sách đơn từ và yêu cầu...</span>
        </div>
      )}

      {/* Sent Requests List */}
      <div className="card class-list-card border-0 mb-4">
        {/* Card Header */}
        <RequestListHeader />

        {/* Toolbar & Table */}
        <RequestTable requests={requests} />

        {/* Footer Pagination */}
        <RequestPagination />
      </div>
    </>
  );
}
