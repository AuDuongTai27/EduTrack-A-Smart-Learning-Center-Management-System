import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import StatusBadge from "../../../components/Common/StatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";
import feedbackDAL from "../../../../DAL/feedbackDAL";
import type { ApprovalRequestDto } from "../../../../BLL/models/ApprovalRequestDto";

export default function AdminStaffApprovalRequestPage() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("newest");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // New Request Modal state
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newRequestForm, setNewRequestForm] = useState({
    requestType: "Tuition Adjustment",
    studentName: "",
    priority: "Medium",
    title: "",
    reason: "",
  });
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRequests() {
      try {
        setLoading(true);
        const res = await feedbackDAL.getAllRequests();
        if (isMounted && res.data) {
          // Admin Staff's approval requests: requests initiated by staff or internal requests
          setRequests(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách yêu cầu phê duyệt:", err);
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
    return requests
      .filter((r) => {
        const matchSearch =
          searchTerm === "" ||
          (r.requestCode && r.requestCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.title && r.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.studentName && r.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchType = selectedType === "All" || r.requestType === selectedType;
        const matchPriority = selectedPriority === "All" || r.priority?.toLowerCase() === selectedPriority.toLowerCase();
        const matchStatus = selectedStatus === "All" || r.status?.toLowerCase() === selectedStatus.toLowerCase();

        return matchSearch && matchType && matchPriority && matchStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "newest") {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        }
        if (selectedSort === "oldest") {
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }
        if (selectedSort === "priority-desc") {
          const pMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          return (pMap[b.priority || "Low"] || 0) - (pMap[a.priority || "Low"] || 0);
        }
        if (selectedSort === "priority-asc") {
          const pMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          return (pMap[a.priority || "Low"] || 0) - (pMap[b.priority || "Low"] || 0);
        }
        return 0;
      });
  }, [requests, searchTerm, selectedType, selectedPriority, selectedStatus, selectedSort]);

  // Paginated list
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredRequests.slice(start, start + entriesPerPage);
  }, [filteredRequests, currentPage, entriesPerPage]);

  // Handle open detail modal (GetById)
  const handleViewDetails = async (req: ApprovalRequestDto) => {
    setLoadingDetail(true);
    try {
      const detail = await feedbackDAL.getRequestById(req.requestId);
      setSelectedRequest(detail || req);
    } catch {
      setSelectedRequest(req);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle create new request submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequestForm.title.trim()) {
      alert("Vui lòng nhập tiêu đề yêu cầu!");
      return;
    }

    const newReq: ApprovalRequestDto = {
      requestId: Date.now(),
      requestCode: `AR${Math.floor(1000 + Math.random() * 9000)}`,
      requestType: newRequestForm.requestType,
      title: newRequestForm.title,
      description: newRequestForm.reason,
      studentName: newRequestForm.studentName || "[FE-Mock] Học sinh chưa gán",
      priority: newRequestForm.priority,
      status: "Pending",
      reason: newRequestForm.reason,
      createdAt: new Date().toISOString(),
      requestedBy: 2,
      requesterName: "Trần Thị Nhân Viên",
    };

    setRequests([newReq, ...requests]);
    setShowNewModal(false);
    setNewRequestForm({
      requestType: "Tuition Adjustment",
      studentName: "",
      priority: "Medium",
      title: "",
      reason: "",
    });
    setActionSuccessMsg(`Đã tạo và gửi yêu cầu phê duyệt "${newReq.requestCode}" thành công lên Center Manager!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="My Approval Requests"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "My Approval Requests" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => setShowNewModal(true)}
          >
            <i className="bi bi-plus-square me-2" />
            New Request
          </button>
        }
      />

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{actionSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Approval Request Filters */}
      <div className="card user-list-card mb-4 border-0 shadow-sm">
        <div className="card-header user-list-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col-xl-3 col-lg-6">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by code, title, student..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
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
                <option value="Due Date Extension">Due Date Extension</option>
                <option value="Refund Request">Refund Request</option>
                <option value="Student Information Change">Student Information Change</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
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
            <div className="col-xl col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-xl col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="priority-desc">Priority High-Low</option>
                <option value="priority-asc">Priority Low-High</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Request List */}
      <div className="card user-list-card border-0 shadow-sm">
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom bg-white">
          <div>
            <h5 className="mb-1 fw-bold text-dark">Approval Request List</h5>
            <small className="text-muted">
              Track requests submitted by Admin Staff for Center Manager approval
            </small>
          </div>
        </div>

        <TableToolbar
          totalItems={filteredRequests.length}
          totalLabel="Total Requests"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th>No.</th>
                <th>Request Code</th>
                <th>Request Type</th>
                <th>Related To</th>
                <th>Request Content</th>
                <th>Submitted Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang tải danh sách yêu cầu phê duyệt...
                  </td>
                </tr>
              ) : paginatedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy yêu cầu phê duyệt nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;
                  const dateStr = req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr key={req.requestId || idx}>
                      <td>{itemIndex}</td>
                      <td>
                        <strong className="text-primary font-monospace">{req.requestCode || `AR${req.requestId}`}</strong>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{req.requestType}</span>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{req.studentName || "Trung tâm"}</div>
                        {req.className && <small className="text-muted">{req.className}</small>}
                      </td>
                      <td>
                        <div className="text-truncate fw-medium" style={{ maxWidth: "260px" }} title={req.title || undefined}>
                          {req.title}
                        </div>
                        <small className="text-muted text-truncate d-block" style={{ maxWidth: "260px" }}>
                          {req.description || req.reason || "—"}
                        </small>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        <StatusBadge status={req.priority || "Medium"} />
                      </td>
                      <td>
                        <DotStatusBadge status={req.status || "Pending"} />
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <TableActionButton
                            action="View Details"
                            title="Xem chi tiết đơn yêu cầu"
                            onClick={() => handleViewDetails(req)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRequests.length}
          entriesPerPage={entriesPerPage}
          itemLabel="requests"
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE NEW REQUEST MODAL */}
      {showNewModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2" />
                  Tạo yêu cầu phê duyệt mới lên Quản lý trung tâm
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowNewModal(false)}
                />
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Loại yêu cầu <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={newRequestForm.requestType}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, requestType: e.target.value })}
                        required
                      >
                        <option value="Tuition Adjustment">Tuition Adjustment (Miễn giảm / Điều chỉnh học phí)</option>
                        <option value="Due Date Extension">Due Date Extension (Gia hạn đóng học phí)</option>
                        <option value="Refund Request">Refund Request (Yêu cầu hoàn trả học phí)</option>
                        <option value="Student Information Change">Student Information Change (Sửa thông tin học viên)</option>
                        <option value="Other">Other (Yêu cầu đặc biệt khác)</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">Độ ưu tiên</label>
                      <select
                        className="form-select"
                        value={newRequestForm.priority}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, priority: e.target.value })}
                      >
                        <option value="Low">Low (Thấp)</option>
                        <option value="Medium">Medium (Trung bình)</option>
                        <option value="High">High (Khẩn cấp / Cao)</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold">Học sinh liên quan</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Nhập tên học sinh (ví dụ: Nguyễn Minh An)..."
                        value={newRequestForm.studentName}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, studentName: e.target.value })}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold">Tiêu đề yêu cầu <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Xin gia hạn đóng học phí tháng 8 cho học sinh Nguyễn Minh An..."
                        value={newRequestForm.title}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-bold">Nội dung chi tiết & Lý do đề xuất</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Nêu rõ lý do, bằng chứng hoặc căn cứ cần Center Manager phê duyệt..."
                        value={newRequestForm.reason}
                        onChange={(e) => setNewRequestForm({ ...newRequestForm, reason: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowNewModal(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4">
                    <i className="bi bi-send me-1" />
                    Gửi yêu cầu phê duyệt
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedRequest && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    {selectedRequest.requestCode || `AR${selectedRequest.requestId}`}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Chi tiết yêu cầu phê duyệt
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang tải chi tiết yêu cầu...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                      <div>
                        <h5 className="fw-bold mb-1">{selectedRequest.title}</h5>
                        <div className="d-flex align-items-center gap-3 text-muted small">
                          <span>
                            <i className="bi bi-tag me-1" />
                            {selectedRequest.requestType}
                          </span>
                          <span>
                            <i className="bi bi-clock me-1" />
                            {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : "—"}
                          </span>
                          <span>
                            <i className="bi bi-person me-1" />
                            Người gửi: <strong>{selectedRequest.requesterName || "Admin Staff"}</strong>
                          </span>
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
                          <small className="text-muted d-block mb-1">Học sinh / Đối tượng áp dụng</small>
                          <div className="fw-bold text-dark">{selectedRequest.studentName || "Không xác định"}</div>
                          {selectedRequest.className && <small className="text-muted">Lớp: {selectedRequest.className}</small>}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Người phê duyệt (Center Manager)</small>
                          <div className="fw-bold text-dark">
                            {selectedRequest.reviewerName || (selectedRequest.status === "Pending" ? "Đang chờ duyệt" : "Nguyễn Văn Quản Lý")}
                          </div>
                          {selectedRequest.reviewedAt && (
                            <small className="text-muted">
                              Thời gian: {new Date(selectedRequest.reviewedAt).toLocaleDateString("vi-VN")}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2">Nội dung chi tiết & Căn cứ đề xuất:</h6>
                      <div className="p-3 bg-light rounded border text-secondary" style={{ whiteSpace: "pre-line", minHeight: "80px" }}>
                        {selectedRequest.description || selectedRequest.reason || "Không có ghi chú thêm."}
                      </div>
                    </div>

                    {selectedRequest.reviewNotes && (
                      <div className="mb-3">
                        <h6 className="fw-bold text-dark mb-2">Phản hồi từ Center Manager:</h6>
                        <div className="p-3 bg-warning-subtle text-dark rounded border border-warning" style={{ whiteSpace: "pre-line" }}>
                          <i className="bi bi-chat-left-quote-fill me-2 text-warning" />
                          {selectedRequest.reviewNotes}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedRequest(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
