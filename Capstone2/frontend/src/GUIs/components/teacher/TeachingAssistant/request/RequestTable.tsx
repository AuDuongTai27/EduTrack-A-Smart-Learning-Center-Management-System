import React, { useState, useMemo } from "react";
import type { ApprovalRequestDto } from "../../../../../BLL/models/ApprovalRequestDto";
import EditRequestModal from "../../Teacher/request/EditRequestModal";
import RequestPagination from "./RequestPagination";

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

  const getStatusLabel = (req: ApprovalRequestDto) => {
    if (req.statusLabel === "Chưa xem xét giải quyết") return "Unreviewed";
    if (req.statusLabel === "Chờ duyệt") return "Pending";
    if (req.statusLabel === "Đã duyệt") return "Approved";
    if (req.statusLabel === "Từ chối") return "Rejected";
    return req.statusLabel;
  };

  const getStatusBadge = (req: ApprovalRequestDto) => {
    const s = (req.status || "pending").toLowerCase();
    if (s === "approved") {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-check-circle-fill me-1" /> Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-x-circle-fill me-1" /> Rejected
        </span>
      );
    }

    // If reviewer has not received or canEdit = true -> Unreviewed
    const isUnreviewed = req.canEdit || (!req.reviewedBy && s === "pending");
    if (isUnreviewed) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-clock-history me-1" /> {getStatusLabel(req) || "Unreviewed"}
        </span>
      );
    }

    // Admin/Staff viewed/received -> Pending
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2 fw-semibold">
        <i className="bi bi-hourglass-split me-1" /> {getStatusLabel(req) || "Pending"}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || "medium").toLowerCase();
    if (p === "high") {
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">High</span>;
    }
    if (p === "low") {
      return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Low</span>;
    }
    return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Normal</span>;
  };

  const getRequestTypeLabel = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "leave_request":
        return "Leave Request";
      case "schedule_change":
        return "Shift Change";
      case "facility_request":
        return "Facility / Room";
      case "teaching_support":
        return "Class Support";
      default:
        return "Request";
    }
  };

  // Filter by search term
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

  // Pagination
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, currentPage, rowsPerPage]);

  return (
    <>
      {/* Toolbar */}
      <div className="table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-bottom">
        <div className="table-entries-select d-flex align-items-center gap-2">
          <span className="small text-muted">Show</span>
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
          <span className="small text-muted">requests / page</span>
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
              placeholder="Search by code or title..."
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
              <th>Request Code</th>
              <th>Request Type</th>
              <th>Request Title</th>
              <th>Priority</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
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
                  : "Just submitted";

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
                        {req.title || req.description || "Teaching Assistant Request"}
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
                            title="Edit request (Unreviewed)"
                          >
                            <i className="bi bi-pencil-square" /> Edit
                          </button>
                        ) : (
                          <span
                            className="badge bg-light text-muted border py-1.5 px-2"
                            title="Request has been received and reviewed by Management/Admin Staff, editing is locked"
                          >
                            <i className="bi bi-lock-fill me-1" /> Locked
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <i className="bi bi-eye" /> Details
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
                  No matching requests or proposals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <RequestPagination
        totalItems={filteredRequests.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Edit Request Modal */}
      <EditRequestModal
        isOpen={editingRequest !== null}
        request={editingRequest}
        onClose={() => setEditingRequest(null)}
        onRequestUpdated={(updated) => {
          setEditingRequest(null);
          onRequestUpdated?.(updated);
        }}
        userRoleName="Teaching Assistant"
      />

      {/* View Request Details Modal */}
      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-text text-primary" />
                  Request Details: {selectedRequest.requestCode}
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

                {/* Processing status tip */}
                {((selectedRequest.canEdit || (!selectedRequest.reviewedBy && (selectedRequest.status || "pending").toLowerCase() === "pending"))) ? (
                  <div className="alert alert-info py-2 px-3 small mb-3">
                    <i className="bi bi-info-circle me-1" /> The request is currently <strong>Unreviewed</strong>. You can still edit the request details before management reviews it.
                  </div>
                ) : (selectedRequest.status || "pending").toLowerCase() === "pending" && selectedRequest.reviewedBy ? (
                  <div className="alert alert-warning py-2 px-3 small mb-3">
                    <i className="bi bi-hourglass-split me-1" /> The request has been received by <strong>{selectedRequest.reviewerName || "Management"}</strong> and is currently <strong>Pending</strong> (editing is locked).
                  </div>
                ) : null}

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <label className="form-label small fw-bold text-muted mb-1">Detailed content:</label>
                  <p className="mb-0 text-dark small" style={{ whiteSpace: "pre-wrap" }}>
                    {selectedRequest.description || "No detailed content."}
                  </p>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <small className="text-muted d-block">Sender:</small>
                    <strong className="text-dark small">{selectedRequest.requesterName || "Teaching Assistant"}</strong>
                  </div>
                  <div className="col-6">
                    <small className="text-muted d-block">Submitted date:</small>
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
                        Reviewer: {selectedRequest.reviewerName || "Board of Directors"}
                      </span>
                      <small className="text-muted">
                        {new Date(selectedRequest.reviewedAt).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    {selectedRequest.reviewNotes && (
                      <p className="small mb-0 text-secondary fst-italic">
                        Feedback: "{selectedRequest.reviewNotes}"
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
                    <i className="bi bi-pencil-square" /> Edit this request
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
