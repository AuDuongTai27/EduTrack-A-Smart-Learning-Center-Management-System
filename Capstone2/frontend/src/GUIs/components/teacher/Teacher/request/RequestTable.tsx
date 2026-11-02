import React, { useState, useMemo } from "react";
import type { ApprovalRequestDto } from "../../../../../BLL/models/ApprovalRequestDto";
import EditRequestModal from "./EditRequestModal";

export interface RequestTableProps {
  requests?: ApprovalRequestDto[];
  onRequestUpdated?: (updatedRequest: ApprovalRequestDto) => void;
}

export default function RequestTable({ requests = [], onRequestUpdated }: RequestTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);
  const [editingRequest, setEditingRequest] = useState<ApprovalRequestDto | null>(null);

  const getStatusBadge = (req: ApprovalRequestDto) => {
    const s = (req.status || "pending").toLowerCase();
    if (s === "approved") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-check-circle-fill me-1" /> Đã duyệt
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-x-circle-fill me-1" /> Từ chối
        </span>
      );
    }

    // Nếu chưa có reviewer tiếp nhận hoặc canEdit = true -> "Chưa xem xét giải quyết"
    const isUnreviewed = req.canEdit || (!req.reviewedBy && s === "pending");
    if (isUnreviewed) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-clock-history me-1" /> {req.statusLabel || "Chưa xem xét giải quyết"}
        </span>
      );
    }

    // Admin/Giáo vụ đã xem / tiếp nhận -> "Chờ duyệt"
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2 fw-semibold">
        <i className="bi bi-hourglass-split me-1" /> {req.statusLabel || "Chờ duyệt"}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || "medium").toLowerCase();
    if (p === "high") {
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">Khẩn cấp</span>;
    }
    if (p === "low") {
      return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Thấp</span>;
    }
    return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Bình thường</span>;
  };

  const getRequestTypeLabel = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "leave_request":
        return "Nghỉ phép";
      case "schedule_change":
        return "Đổi lịch";
      case "facility_request":
        return "Thiết bị/Phòng";
      case "teaching_support":
        return "Hỗ trợ";
      default:
        return "Kiến nghị";
    }
  };

  // Lọc theo từ khóa tìm kiếm
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;
    const term = searchTerm.toLowerCase();
    return requests.filter(
      (r) =>
        r.requestCode?.toLowerCase().includes(term) ||
        r.title?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.requestType?.toLowerCase().includes(term)
    );
  }, [requests, searchTerm]);

  // Phân trang
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, currentPage, rowsPerPage]);

  return (
    <>
      {/* Toolbar */}
      <div className="table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-bottom">
        <div className="table-entries-select d-flex align-items-center gap-2">
          <span className="small text-muted">Hiển thị</span>
          <select
            className="form-select form-select-sm"
            id="entriesSelect"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "auto" }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="small text-muted">yêu cầu / trang</span>
        </div>
        <div>
          <div className="input-group input-group-sm" style={{ width: 260 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-0"
              id="tableSearchInput"
              placeholder="Tìm theo mã hoặc tiêu đề..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive-container">
        <table className="table custom-table align-middle mb-0" id="requestsTable">
          <thead className="table-light">
            <tr>
              <th className="th-checkbox" style={{ width: 40 }}>
                <div className="form-check m-0">
                  <input className="form-check-input" type="checkbox" id="selectAllRequests" />
                </div>
              </th>
              <th>Mã Đơn</th>
              <th>Loại Đơn</th>
              <th>Tiêu Đề Yêu Cầu</th>
              <th>Mức Ưu Tiên</th>
              <th>Ngày Gửi</th>
              <th>Trạng Thái</th>
              <th className="text-end">Thao Tác</th>
            </tr>
          </thead>
          <tbody id="requestTableBody">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((req, idx) => {
                const dateStr = req.createdAt
                  ? new Date(req.createdAt).toLocaleString("vi-VN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Vừa gửi";

                const isEditable = req.canEdit || (!req.reviewedBy && (req.status || "pending").toLowerCase() === "pending");

                return (
                  <tr key={req.requestId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <span className="class-id-link fw-bold text-primary">
                        {req.requestCode || `#${req.requestId}`}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {getRequestTypeLabel(req.requestType)}
                      </span>
                    </td>
                    <td>
                      <span className="text-dark fw-semibold d-block">
                        {req.title || req.description || "Yêu cầu từ giáo viên"}
                      </span>
                      {req.className && (
                        <small className="text-muted d-block">{req.className}</small>
                      )}
                    </td>
                    <td>{getPriorityBadge(req.priority)}</td>
                    <td className="text-muted small">{dateStr}</td>
                    <td>{getStatusBadge(req)}</td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1 justify-content-end">
                        {isEditable ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                            onClick={() => setEditingRequest(req)}
                            title="Chỉnh sửa đơn (Chưa xem xét giải quyết)"
                          >
                            <i className="bi bi-pencil-square" /> Sửa
                          </button>
                        ) : (
                          <span
                            className="badge bg-light text-muted border py-1.5 px-2"
                            title="Đơn đã được Ban Giám Đốc/Giáo vụ tiếp nhận xem xét nên đã khóa chỉnh sửa"
                          >
                            <i className="bi bi-lock-fill me-1" /> Đã khóa
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <i className="bi bi-eye" /> Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-1" />
                  Chưa có đơn từ hoặc yêu cầu nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal chỉnh sửa đơn từ */}
      <EditRequestModal
        isOpen={editingRequest !== null}
        request={editingRequest}
        onClose={() => setEditingRequest(null)}
        onRequestUpdated={(updated) => {
          setEditingRequest(null);
          onRequestUpdated?.(updated);
        }}
        userRoleName="Giáo viên"
      />

      {/* Modal xem chi tiết đơn từ */}
      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-primary" />
                  Chi Tiết Đơn: {selectedRequest.requestCode}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedRequest(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <h6 className="fw-bold mb-1">{selectedRequest.title}</h6>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    {getStatusBadge(selectedRequest)}
                    <span className="badge bg-light text-dark border">
                      {getRequestTypeLabel(selectedRequest.requestType)}
                    </span>
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                </div>

                {/* Gợi ý trạng thái xử lý */}
                {((selectedRequest.canEdit || (!selectedRequest.reviewedBy && (selectedRequest.status || "pending").toLowerCase() === "pending"))) ? (
                  <div className="alert alert-info py-2 px-3 small mb-3">
                    <i className="bi bi-info-circle me-1" /> Đơn đang ở trạng thái <strong>Chưa xem xét giải quyết</strong>. Bạn vẫn có thể chỉnh sửa nội dung đơn trước khi ban quản lý tiếp nhận.
                  </div>
                ) : (selectedRequest.status || "pending").toLowerCase() === "pending" && selectedRequest.reviewedBy ? (
                  <div className="alert alert-warning py-2 px-3 small mb-3">
                    <i className="bi bi-hourglass-split me-1" /> Đơn đã được tiếp nhận bởi <strong>{selectedRequest.reviewerName || "Ban Quản lý"}</strong> và đang trong trạng thái <strong>Chờ duyệt</strong> (đã khóa quyền chỉnh sửa).
                  </div>
                ) : null}

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <label className="form-label small fw-bold text-muted mb-1">Nội dung chi tiết:</label>
                  <p className="mb-0 text-dark small" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedRequest.description || "Không có nội dung chi tiết."}
                  </p>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Người gửi:</small>
                    <strong className="text-dark small">{selectedRequest.requesterName || "Giáo viên"}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Ngày gửi:</small>
                    <span className="text-dark small">
                      {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString("vi-VN") : "N/A"}
                    </span>
                  </div>
                </div>

                {selectedRequest.reviewedAt && (
                  <div className="p-3 bg-white rounded-3 border">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <span className="small fw-bold text-success">
                        <i className="bi bi-person-check me-1" />
                        Người duyệt: {selectedRequest.reviewerName || "Ban Giám Đốc"}
                      </span>
                      <small className="text-muted">
                        {new Date(selectedRequest.reviewedAt).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    {selectedRequest.reviewNotes && (
                      <p className="small mb-0 text-secondary fst-italic">
                        Phản hồi: "{selectedRequest.reviewNotes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {(selectedRequest.canEdit || (!selectedRequest.reviewedBy && (selectedRequest.status || "pending").toLowerCase() === "pending")) && (
                  <button
                    type="button"
                    className="btn btn-warning btn-sm me-auto d-inline-flex align-items-center gap-1 text-dark fw-semibold"
                    onClick={() => {
                      const req = selectedRequest;
                      setSelectedRequest(null);
                      setEditingRequest(req);
                    }}
                  >
                    <i className="bi bi-pencil-square" /> Chỉnh sửa đơn này
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
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
