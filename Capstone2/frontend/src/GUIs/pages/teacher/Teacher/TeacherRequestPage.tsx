import React, { useEffect, useState, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import {
  RequestListHeader,
  RequestTable,
  RequestPagination,
} from "../../../components/teacher/Teacher/request";
import teachingDAL from "../../../../DAL/teachingDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

const DEFAULT_TEACHER_ID = 3; // ThS. Hoàng Quốc Việt

export default function TeacherRequestPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await teachingDAL.getRequests(DEFAULT_TEACHER_ID, filterStatus);
        if (isMounted && res.data) {
          setRequests(res.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách yêu cầu giáo viên:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRequests();
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
        title="Đơn Từ &amp; Yêu Cầu Giảng Dạy"
        breadcrumbItems={[
          { label: "Dashboard", path: "/teacher/dashboard" },
          { label: "Yêu cầu" },
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
          defaultRequestedBy={DEFAULT_TEACHER_ID}
          userRoleName="Giáo viên"
        />

        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary mx-auto mb-2" role="status" />
            <p className="text-muted mb-0">Đang tải danh sách đơn từ...</p>
          </div>
        ) : (
          <>
            {/* Toolbar & Table (bao gồm Pagination nội bộ) */}
            <RequestTable requests={sortedRequests} onRequestUpdated={handleRequestUpdated} />
          </>
        )}
      </div>
    </>
  );
}
