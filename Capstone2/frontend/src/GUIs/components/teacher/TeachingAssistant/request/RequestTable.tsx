import ModalIcon from '../../../Common/ModalIcon';
import ModalSurface from '../../../Common/ModalSurface';
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
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequestDto | null>(null);
  const [editingRequest, setEditingRequest] = useState<ApprovalRequestDto | null>(null);

  const getStatusLabel = (req: ApprovalRequestDto) => {
    if (req.statusLabel === "Chưa xem xét giải quyết") return "Pending Review";
    if (req.statusLabel === "Chờ duyệt") return "Pending";
    if (req.statusLabel === "Đã duyệt") return "Approved";
    if (req.statusLabel === "Từ chối" || req.statusLabel === "Đã từ chối") return "Rejected";
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

    // If reviewer has not received or canEdit = true -> Pending Review
    const isUnreviewed = req.canEdit || (!req.reviewedBy && s === "pending");
    if (isUnreviewed) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-clock-history me-1" /> {getStatusLabel(req) || "Pending Review"}
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
    return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Medium</span>;
  };

  const getRequestTypeLabel = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "leave_request":
        return "Leave Request";
      case "schedule_change":
        return "Schedule Change";
      case "facility_request":
        return "Facility / Equipment";
      case "teaching_support":
        return "Teaching Support";
      case "other":
        return "Other";
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
      <div className="table-toolbar d-flex align-items-center justify-content-end flex-wrap gap-2 px-3 py-2 border-bottom">
        <div>
          <div className="input-group input-group-sm" style={{ width: 260 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-0"
              id="tableSearchInput"
              placeholder="Search by title or type..."
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
              <th className="ps-4 pe-3" style={{ width: "32%", minWidth: 200 }}>Request Title</th>
              <th className="px-3 text-nowrap" style={{ width: "16%" }}>Request Type</th>
              <th className="px-3 text-center text-nowrap" style={{ width: "12%" }}>Priority</th>
              <th className="px-3 text-nowrap" style={{ width: "16%" }}>Submitted Date</th>
              <th className="px-3 text-nowrap" style={{ width: "14%" }}>Status</th>
              <th className="ps-3 pe-4 text-end text-nowrap" style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody id="requestTableBody">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((req, idx) => {
                const dateStr = req.createdAt
                  ? new Date(req.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Just now";

                return (
                  <tr key={req.requestId || idx}>
                    <td className="ps-4 pe-3">
                      <span className="text-dark fw-semibold d-block">
                        {req.title || req.description || "Teaching Assistant Request"}
                      </span>
                      {req.className && (
                        <small className="text-muted d-block">{req.className}</small>
                      )}
                    </td>
                    <td className="px-3 text-nowrap">
                      <span className="badge bg-light text-dark border">
                        {getRequestTypeLabel(req.requestType)}
                      </span>
                    </td>
                    <td className="px-3 text-center">{getPriorityBadge(req.priority)}</td>
                    <td className="px-3 text-muted small text-nowrap">{dateStr}</td>
                    <td className="px-3 text-nowrap">{getStatusBadge(req)}</td>
                    <td className="ps-3 pe-4 text-end text-nowrap">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                        onClick={() => setSelectedRequest(req)}
                      >
                        <i className="bi bi-eye" /> Details
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-1" />
                  No matching requests found.
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
        onCancel={() => {
          const req = editingRequest;
          setEditingRequest(null);
          if (req) setSelectedRequest(req);
        }}
        onRequestUpdated={(updated) => {
          setEditingRequest(null);
          onRequestUpdated?.(updated);
        }}
      />

      {/* View Request Details Modal */}
      {selectedRequest && (
        <>
          <div
            className="modal-backdrop fade show"
            onClick={() => setSelectedRequest(null)}
            style={{ zIndex: 1050 }}
          />
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <ModalSurface className="modal-content border-0 shadow rounded-3">
                <div className="modal-header border-bottom py-3 px-4">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <ModalIcon name="file" />
                    <span>Request Details: {selectedRequest.requestCode || `#${selectedRequest.requestId}`}</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedRequest(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <h6 className="fw-bold mb-2">{selectedRequest.title}</h6>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      {getStatusBadge(selectedRequest)}
                      <span className="badge bg-light text-dark border">
                        {getRequestTypeLabel(selectedRequest.requestType)}
                      </span>
                      {getPriorityBadge(selectedRequest.priority)}
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <label className="form-label small fw-bold text-muted mb-1">Detailed Content:</label>
                    <p className="mb-0 text-dark small" style={{ whiteSpace: "pre-wrap" }}>
                      {selectedRequest.description || "No detailed content."}
                    </p>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted d-block">Submitted Date:</small>
                    <span className="text-dark small fw-medium">
                      {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString("en-US") : "N/A"}
                    </span>
                  </div>

                  {selectedRequest.reviewedAt && (
                    <div className="p-3 bg-white rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="small fw-bold text-success">
                          <i className="bi bi-person-check me-1" />
                          Reviewer: {selectedRequest.reviewerName || "Management Board"}
                        </span>
                        <small className="text-muted">
                          {new Date(selectedRequest.reviewedAt).toLocaleString("en-US")}
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
                <div className="modal-footer border-top py-2 px-4 d-flex justify-content-end gap-2 bg-light rounded-bottom-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-3"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Close
                  </button>
                  {(selectedRequest.canEdit || (!selectedRequest.reviewedBy && (selectedRequest.status || "pending").toLowerCase() === "pending")) && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm px-3 d-inline-flex align-items-center gap-1"
                      onClick={() => {
                        const req = selectedRequest;
                        setSelectedRequest(null);
                        setEditingRequest(req);
                      }}
                    >
                      <i className="bi bi-pencil-square" /> Edit Request
                    </button>
                  )}
                </div>
              </ModalSurface>
            </div>
          </div>
        </>
      )}
    </>
  );
}
