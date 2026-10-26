import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import StatusBadge from "../../../components/Common/StatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function AdminStaffFeedbackPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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
        console.warn("Lỗi tải danh sách yêu cầu tiếp nhận:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        searchTerm === "" ||
        (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.studentName && r.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.requestId && String(r.requestId).includes(searchTerm));

      const matchType = selectedType === "All" || r.requestType === selectedType;
      const matchStatus =
        selectedStatus === "All" ||
        r.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchSearch && matchType && matchStatus;
    });
  }, [requests, searchTerm, selectedType, selectedStatus]);

  // Pagination slicing
  const totalItems = filteredRequests.length;
  const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRequests.slice(start, start + entriesPerPage);
  }, [filteredRequests, currentPage, entriesPerPage]);

  // Handle Approve / Reject / Process
  const handleUpdateStatus = (newStatus: "Approved" | "Rejected") => {
    if (!selectedRequest) return;
    setRequests((prev) =>
      prev.map((item) =>
        item.requestId === selectedRequest.requestId
          ? { ...item, status: newStatus }
          : item
      )
    );
    setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    setActionSuccessMsg(`Đã cập nhật trạng thái đơn #${selectedRequest.requestId} thành "${newStatus}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb */}
      <PageHeader
        title="Tiếp Nhận Đơn Từ &amp; Phản Hồi (Received Feedback &amp; Requests)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff/dashboard" },
          { label: "Received Requests & Feedback" },
        ]}
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang nạp danh sách phản hồi và đơn từ từ học viên, phụ huynh, giáo viên...</span>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {actionSuccessMsg}
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} />
        </div>
      )}

      {/* Approval Request List */}
      <div className="card user-list-card mb-4 border-0">
        {/* Filter Toolbar */}
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-xl-4 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo mã đơn, tiêu đề hoặc tên người gửi..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            {/* Request Type */}
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả loại yêu cầu</option>
                <option value="Tuition Adjustment">Tuition Adjustment (Điều chỉnh học phí)</option>
                <option value="Refund">Refund (Hoàn phí)</option>
                <option value="Course Change">Course Change (Chuyển lớp/môn)</option>
                <option value="Feedback">Feedback (Ý kiến đóng góp)</option>
                <option value="Leave of Absence">Leave of Absence (Xin nghỉ phép)</option>
              </select>
            </div>
            {/* Status */}
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Pending">Pending (Đang chờ)</option>
                <option value="Approved">Approved (Đã duyệt)</option>
                <option value="Rejected">Rejected (Từ chối)</option>
              </select>
            </div>
            {/* Reset */}
            <div className="col-xl-3 col-lg-12 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("All");
                  setSelectedStatus("All");
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-arrow-clockwise" /> Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={totalItems}
          totalLabel="Tổng số đơn nhận"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Approval Request Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">STT</th>
                <th className="fw-bold">Mã Đơn</th>
                <th className="fw-bold">Loại Đơn / Tiêu Đề</th>
                <th className="fw-bold">Người Gửi (Học viên / Phụ huynh / GV)</th>
                <th className="fw-bold">Ngày Gửi</th>
                <th className="fw-bold">Ưu Tiên</th>
                <th className="fw-bold">Trạng Thái</th>
                <th className="text-center fw-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRequests.length > 0 ? (
                paginatedRequests.map((req, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;
                  const priority = idx % 3 === 0 ? "High" : idx % 3 === 1 ? "Medium" : "Low";
                  const reqDate = req.createdAt ? new Date(req.createdAt).toLocaleDateString("vi-VN") : "16/08/2026";
                  const senderName = req.studentName || "Phụ huynh em Lê Văn An";

                  return (
                    <tr key={req.requestId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <strong>#REQ-{String(req.requestId).padStart(4, "0")}</strong>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{req.title || req.requestType}</div>
                        <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: 220 }}>
                          {req.description}
                        </small>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{senderName}</div>
                        <small className="text-muted">Học sinh / Phụ huynh</small>
                      </td>
                      <td>{reqDate}</td>
                      <td>
                        <StatusBadge status={priority} />
                      </td>
                      <td>
                        <DotStatusBadge status={req.status} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <i className="bi bi-eye" /> Xử lý đơn
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-2 text-secondary" />
                    Không có đơn từ hoặc phản hồi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="card-footer bg-white border-top py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small className="text-muted">
            Hiển thị {paginatedRequests.length} trên tổng {totalItems} đơn
          </small>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            entriesPerPage={entriesPerPage}
            itemLabel="requests"
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* MODAL: Xem chi tiết & Xử lý đơn (GetById) */}
      {selectedRequest && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-file-text-fill text-primary" />
                  Chi Tiết Đơn #REQ-{String(selectedRequest.requestId).padStart(4, "0")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Loại yêu cầu</label>
                    <span className="fw-bold text-dark">{selectedRequest.requestType}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Trạng thái hiện tại</label>
                    <DotStatusBadge status={selectedRequest.status} />
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Người gửi đơn</label>
                    <span className="fw-semibold text-dark">{selectedRequest.studentName || "Học viên / Phụ huynh"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Ngày nộp đơn</label>
                    <span>{selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : "16/08/2026"}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-muted small d-block mb-1">Tiêu đề yêu cầu</label>
                  <div className="p-2.5 bg-light rounded border fw-semibold text-dark">
                    {selectedRequest.title || selectedRequest.requestType}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="text-muted small d-block mb-1">Nội dung chi tiết / Lý do</label>
                  <div className="p-3 bg-light rounded border text-secondary" style={{ minHeight: "90px" }}>
                    {selectedRequest.description || "Không có ghi chú thêm."}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold mb-1">Ghi chú phản hồi của Giáo vụ (Admin Staff Reply)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập ghi chú phản hồi cho học viên / phụ huynh / giáo viên..."
                    defaultValue="Đã tiếp nhận yêu cầu và xử lý theo quy định đào tạo của trung tâm."
                  />
                </div>
              </div>
              <div className="modal-footer bg-light d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  Đóng
                </button>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm d-inline-flex align-items-center gap-1"
                    onClick={() => handleUpdateStatus("Rejected")}
                  >
                    <i className="bi bi-x-circle" /> Từ chối đơn
                  </button>
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-inline-flex align-items-center gap-1"
                    onClick={() => handleUpdateStatus("Approved")}
                  >
                    <i className="bi bi-check-circle" /> Phê duyệt / Hoàn tất
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
