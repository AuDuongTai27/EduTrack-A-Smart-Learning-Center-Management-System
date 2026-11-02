import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  RequestListHeader,
  RequestPagination,
  RequestTable,
} from "../../../components/teacher/TeachingAssistant/request";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

const DEFAULT_TA_ID = 5; // Trợ giảng Âu Dương Tài

export default function TeachingAssistantRequestPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    let isMounted = true;
    async function loadRequests() {
      try {
        setLoading(true);
        const res = await teachingDAL.getRequests(DEFAULT_TA_ID, filterStatus);
        if (isMounted && res.data) {
          setRequests(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách yêu cầu trợ giảng:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRequests();
    return () => {
      isMounted = false;
    };
  }, [filterStatus]);

  const handleRequestCreated = (newRequest: ApprovalRequestDto) => {
    setRequests((prev) => [newRequest, ...prev]);
  };

  const handleRequestUpdated = (updatedRequest: ApprovalRequestDto) => {
    setRequests((prev) =>
      prev.map((r) => (r.requestId === updatedRequest.requestId ? updatedRequest : r))
    );
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [requests, sortOrder]);

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

      {/* Sent Requests List */}
      <div className="card class-list-card border-0 mb-4 shadow-sm">
        {/* Card Header */}
        <RequestListHeader
          filterStatus={filterStatus}
          onFilterStatusChange={(s) => setFilterStatus(s)}
          sortOrder={sortOrder}
          onSortOrderChange={(o) => setSortOrder(o)}
          onRequestCreated={handleRequestCreated}
          defaultRequestedBy={DEFAULT_TA_ID}
          userRoleName="Trợ giảng"
        />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải danh sách đơn từ và yêu cầu...</p>
          </div>
        ) : (
          <>
            {/* Toolbar & Table */}
            <RequestTable requests={sortedRequests} onRequestUpdated={handleRequestUpdated} />

            {/* Footer Pagination */}
            <RequestPagination />
          </>
        )}
      </div>
    </>
  );
}
