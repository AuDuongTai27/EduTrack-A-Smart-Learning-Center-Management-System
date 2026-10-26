import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import StatusBadge from "../../../components/Common/StatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function CenterManagerApprovalRequestPage() {
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

  // Detail & Processing Modal state (GetById)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await feedbackDAL.getAllRequests();
        if (isMounted && res.data) {
          setRequests(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách yêu cầu phê duyệt center manager:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        searchTerm === "" ||
        (r.requestCode && r.requestCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.studentName && r.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === "All" || r.requestType === selectedType;
      const matchStatus =
        selectedStatus === "All" ||
        (r.status && r.status.toLowerCase() === selectedStatus.toLowerCase());
      const matchPriority =
        selectedPriority === "All" ||
        (r.priority && r.priority.toLowerCase() === selectedPriority.toLowerCase());

      return matchSearch && matchType && matchStatus && matchPriority;
    });
  }, [requests, searchTerm, selectedType, selectedStatus, selectedPriority]);

  // Paginated list
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRequests.slice(start, start + entriesPerPage);
  }, [filteredRequests, currentPage, entriesPerPage]);

  // Handle open review modal (GetById)
  const handleReviewRequest = async (req: ApprovalRequestDto) => {
    try {
      const detail = await feedbackDAL.getRequestById(req.requestId);
      setSelectedRequest(detail || req);
      setReviewNotes(detail?.reviewNotes || "");
    } catch {
      setSelectedRequest(req);
      setReviewNotes(req.reviewNotes || "");
    }
  };

  // Handle Approve or Reject
  const handleProcessRequest = (newStatus: "Approved" | "Rejected") => {
    if (!selectedRequest) return;

    const updated = requests.map((item) =>
      item.requestId === selectedRequest.requestId
        ? {
            ...item,
            status: newStatus,
            reviewNotes: reviewNotes || `Đã được Quản lý trung tâm ${newStatus === "Approved" ? "phê duyệt" : "từ chối"}.`,
            reviewedAt: new Date().toISOString(),
            reviewerName: "Nguyễn Văn Quản Lý",
          }
        : item
    );

    setRequests(updated);
    setSelectedRequest(null);
    setActionSuccessMsg(
      `Đã ${newStatus === "Approved" ? "phê duyệt" : "từ chối"} đơn #${selectedRequest.requestCode || selectedRequest.requestId} thành công!`
    );
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb */}
      <PageHeader
        title="Approval Requests"
        breadcrumbItems={[
          { label: "Center Manager", path: "/center-manager/dashboard" },
          { label: "Approval Requests" },
        ]}
      />

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{actionSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Approval Request List */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filter */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-xl-4 col-lg-6">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search request code, title or student..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Request Types</option>
                <option value="Tuition Adjustment">Tuition Adjustment</option>
                <option value="Refund">Refund Request</option>
                <option value="Due Date Extension">Due Date Extension</option>
                <option value="Student Information Change">Student Info Change</option>
                <option value="Academic">Academic Support</option>
              </select>
            </div>
            <div className="col-xl-2 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending (Đang chờ duyệt)</option>
                <option value="Approved">Approved (Đã duyệt)</option>
                <option value="Rejected">Rejected (Đã từ chối)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredRequests.length}
          totalLabel="Total requests"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Request Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Request Code</th>
                <th className="fw-bold">Type</th>
                <th className="fw-bold">Related Student / Target</th>
                <th className="fw-bold">Content Summary</th>
                <th className="fw-bold">Requester</th>
                <th className="fw-bold">Priority</th>
                <th className="fw-bold">Status</th>
                <th className="text-center fw-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp danh sách yêu cầu phê duyệt...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy yêu cầu nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;

                  return (
                    <tr key={req.requestId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <strong className="text-primary font-monospace">
                          {req.requestCode || `AR${req.requestId}`}
                        </strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{req.requestType}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{req.studentName || "Trung tâm"}</div>
                        {req.className && <small className="text-muted">{req.className}</small>}
                      </td>
                      <td>
                        <div className="text-truncate fw-medium" style={{ maxWidth: "250px" }} title={req.title || undefined}>
                          {req.title}
                        </div>
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: "250px" }}>
                          {req.description || req.reason || "—"}
                        </small>
                      </td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary">
                          {req.requesterName || "Admin Staff"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={req.priority || "Medium"} />
                      </td>
                      <td>
                        <DotStatusBadge status={req.status || "Pending"} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
                          onClick={() => handleReviewRequest(req)}
                        >
                          <i className="bi bi-shield-check" />
                          Thẩm định
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            entriesPerPage={entriesPerPage}
            itemLabel="requests"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* DETAIL & PROCESSING MODAL (GetById) */}
      {selectedRequest && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-white text-primary font-monospace fs-6">
                    {selectedRequest.requestCode || `AR${selectedRequest.requestId}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0">
                    Thẩm định & Phê duyệt yêu cầu
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                  <div>
                    <h5 className="fw-bold mb-1 text-dark">{selectedRequest.title}</h5>
                    <div className="d-flex align-items-center gap-3 text-muted small">
                      <span>Loại: <strong>{selectedRequest.requestType}</strong></span>
                      <span>Người gửi: <strong>{selectedRequest.requesterName || "Admin Staff"}</strong></span>
                      <span>Thời điểm gửi: {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : "—"}</span>
                    </div>
                  </div>
                  <div className="d-flex flex-column align-items-end gap-1">
                    <DotStatusBadge status={selectedRequest.status || "Pending"} />
                    <StatusBadge status={selectedRequest.priority || "Medium"} />
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1">Đối tượng áp dụng</small>
                      <strong className="text-dark">{selectedRequest.studentName || "Không xác định"}</strong>
                      {selectedRequest.className && <div className="small text-muted">{selectedRequest.className}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <small className="text-muted d-block mb-1">Độ ưu tiên xử lý</small>
                      <strong className="text-dark">{selectedRequest.priority || "Medium"}</strong>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">Lý do & Nội dung yêu cầu từ Giáo vụ:</h6>
                  <div className="p-3 bg-light rounded border text-secondary" style={{ whiteSpace: "pre-line", minHeight: "90px" }}>
                    {selectedRequest.description || selectedRequest.reason || "Không có thêm thông tin chi tiết."}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-dark">
                    Ý kiến phê duyệt của Quản lý trung tâm (Center Manager):
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Nhập ghi chú phản hồi, căn cứ đồng ý hoặc lý do từ chối đơn..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Đóng
                </button>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-danger px-3"
                    onClick={() => handleProcessRequest("Rejected")}
                  >
                    <i className="bi bi-x-circle me-1" />
                    Từ chối yêu cầu
                  </button>
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={() => handleProcessRequest("Approved")}
                  >
                    <i className="bi bi-check-circle me-1" />
                    Phê duyệt chấp thuận
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
