import React, { useState, useMemo } from 'react';
import type { FeedbackApprovalRequest } from './feedbackData';
import FeedbackPagination from './FeedbackPagination';

export interface FeedbackTableProps {
  requests?: FeedbackApprovalRequest[];
  onRequestUpdated?: (updated: FeedbackApprovalRequest) => void;
  onStartEdit?: (item: FeedbackApprovalRequest) => void;
  userRoleName?: string;
}

export function FeedbackTable({
  requests = [],
  onStartEdit,
  userRoleName = 'Student',
}: FeedbackTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<FeedbackApprovalRequest | null>(null);

  const getStatusBadge = (req: FeedbackApprovalRequest) => {
    const s = (req.status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-check-circle-fill me-1" /> Resolved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-x-circle-fill me-1" /> Rejected
        </span>
      );
    }

    // If unreviewed or canEdit -> "Pending Review"
    const isUnreviewed = req.canEdit || (!req.reviewedBy && s === 'pending');
    if (isUnreviewed) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2 fw-semibold">
          <i className="bi bi-clock-history me-1" /> Pending Review
        </span>
      );
    }

    // Admin/Staff claimed -> "Pending"
    return (
      <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1 rounded-2 fw-semibold">
        <i className="bi bi-hourglass-split me-1" /> Pending
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'high') {
      return <span className="badge bg-danger-subtle text-danger border border-danger-subtle">High</span>;
    }
    if (p === 'low') {
      return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle">Low</span>;
    }
    return <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Medium</span>;
  };

  // Filter by search keyword
  const filteredRequests = useMemo(() => {
    if (!searchTerm.trim()) return requests;
    const term = searchTerm.toLowerCase();
    return requests.filter(
      (r) =>
        r.requestCode?.toLowerCase().includes(term) ||
        r.title?.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term) ||
        r.className?.toLowerCase().includes(term) ||
        r.senderName?.toLowerCase().includes(term)
    );
  }, [requests, searchTerm]);

  // Pagination
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, currentPage, rowsPerPage]);

  return (
    <>
      {/* Table Toolbar */}
      <div className="table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-bottom bg-light bg-opacity-50">
        <div className="table-entries-select d-flex align-items-center gap-2">
          <span className="small text-muted">Show</span>
          <select
            className="form-select form-select-sm"
            id="feedbackEntriesSelect"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: 'auto' }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="small text-muted">feedback / page</span>
        </div>

        <div>
          <div className="input-group input-group-sm" style={{ width: 270 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-0"
              id="feedbackSearchInput"
              placeholder="Search by code, title, content..."
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
        <table className="table custom-table table-hover align-middle mb-0" id="feedbackTable">
          <thead className="table-light">
            <tr>
              <th className="th-checkbox text-center" style={{ width: 44 }}>
                <div className="form-check m-0 d-inline-block">
                  <input className="form-check-input" type="checkbox" id="selectAllFeedback" />
                </div>
              </th>
              <th style={{ width: 110 }}>Request Code</th>
              <th style={{ width: 110 }}>Type</th>
              <th>Title & Details</th>
              <th style={{ width: 95 }}>Priority</th>
              <th style={{ width: 140 }}>Submitted Date</th>
              <th style={{ width: 130 }}>Status</th>
              <th className="text-end" style={{ width: 160 }}>Actions</th>
            </tr>
          </thead>
          <tbody id="feedbackTableBody">
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((req) => {
                const isEditable =
                  req.canEdit ||
                  (!req.reviewedBy && (req.status || 'pending').toLowerCase() === 'pending');

                return (
                  <tr key={req.id}>
                    <td className="text-center">
                      <div className="form-check m-0 d-inline-block">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-link p-0 fw-bold text-primary text-decoration-none"
                        onClick={() => setSelectedRequest(req)}
                      >
                        {req.requestCode || `#${req.id}`}
                      </button>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        Feedback
                      </span>
                    </td>
                    <td>
                      <span className="text-dark fw-semibold d-block">
                        {req.title}
                      </span>
                      {req.className && (
                        <small className="text-muted d-block">{req.className}</small>
                      )}
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: 360 }}>
                        {req.description}
                      </small>
                    </td>
                    <td>{getPriorityBadge(req.priority)}</td>
                    <td className="text-muted small">{req.createdAt || 'Just now'}</td>
                    <td>{getStatusBadge(req)}</td>
                    <td className="text-end">
                      <div className="d-inline-flex align-items-center gap-1 justify-content-end">
                        {isEditable ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning d-inline-flex align-items-center gap-1"
                            onClick={() => onStartEdit?.(req)}
                            title="Edit feedback (Pending Review)"
                          >
                            <i className="bi bi-pencil-square" /> Edit
                          </button>
                        ) : (
                          <span
                            className="badge bg-light text-muted border py-1.5 px-2"
                            title="The request has been claimed by Admin Staff for review and is locked from editing"
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
                <td colSpan={8} className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary opacity-75" />
                  <p className="mb-0 fw-semibold">No matching feedback found</p>
                  <small>Try adjusting your search keywords or filter status.</small>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      <FeedbackPagination
        totalItems={filteredRequests.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Modal View Details */}
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
            aria-labelledby="feedbackDetailModalTitle"
            style={{ zIndex: 1055 }}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow rounded-3">
                <div className="modal-header border-bottom py-3 px-4">
                  <h5
                    className="modal-title d-flex align-items-center gap-2 fw-bold text-dark"
                    id="feedbackDetailModalTitle"
                  >
                    <i className="bi bi-file-earmark-text text-primary" />
                    <span>Feedback Details: {selectedRequest.requestCode || `#${selectedRequest.id}`}</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedRequest(null)}
                  />
                </div>

                <div className="modal-body p-4">
                  {/* Title & Badges */}
                  <div className="mb-3">
                    <h6 className="fw-bold mb-2 text-dark fs-5">{selectedRequest.title}</h6>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {getStatusBadge(selectedRequest)}
                      <span className="badge bg-light text-dark border">Feedback</span>
                      {getPriorityBadge(selectedRequest.priority)}
                    </div>
                  </div>

                  {/* Processing Status Hints */}
                  {(selectedRequest.canEdit ||
                    (!selectedRequest.reviewedBy &&
                      (selectedRequest.status || 'pending').toLowerCase() === 'pending')) ? (
                    <div className="alert alert-info py-2 px-3 small mb-3 border-0 rounded-2 bg-info-subtle text-info-emphasis">
                      <i className="bi bi-info-circle me-1" /> The request is currently{' '}
                      <strong>Pending Review</strong>. You can still edit this feedback before Admin Staff claims it.
                    </div>
                  ) : (selectedRequest.status || 'pending').toLowerCase() === 'pending' &&
                    selectedRequest.reviewedBy ? (
                    <div className="alert alert-warning py-2 px-3 small mb-3 border-0 rounded-2 bg-warning-subtle text-warning-emphasis">
                      <i className="bi bi-hourglass-split me-1" /> The request has been received by{' '}
                      <strong>{selectedRequest.reviewedBy || 'Admin Staff'}</strong> and is currently being processed
                      (editing locked).
                    </div>
                  ) : (selectedRequest.status || 'pending').toLowerCase() === 'approved' ? (
                    <div className="alert alert-success py-2 px-3 small mb-3 border-0 rounded-2 bg-success-subtle text-success-emphasis">
                      <i className="bi bi-check-circle me-1" /> This feedback has been{' '}
                      <strong>Resolved</strong> by Admin Staff.
                    </div>
                  ) : (selectedRequest.status || 'pending').toLowerCase() === 'rejected' ? (
                    <div className="alert alert-danger py-2 px-3 small mb-3 border-0 rounded-2 bg-danger-subtle text-danger-emphasis">
                      <i className="bi bi-x-circle me-1" /> This feedback has been{' '}
                      <strong>Rejected</strong> by Admin Staff.
                    </div>
                  ) : null}

                  {/* Detailed Content */}
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <label className="form-label small fw-bold text-muted mb-1">Detailed Content:</label>
                    <p className="mb-0 text-dark small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {selectedRequest.description || 'No detailed content.'}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Requester:</small>
                      <strong className="text-dark small">
                        {selectedRequest.senderName || userRoleName} ({selectedRequest.senderRole || userRoleName})
                      </strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Submitted Date:</small>
                      <span className="text-dark small">
                        {selectedRequest.createdAt || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Review Notes from Admin Staff */}
                  {selectedRequest.reviewedBy && (
                    <div className="p-3 bg-light bg-opacity-75 rounded-3 border">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="small fw-bold text-success d-flex align-items-center gap-1">
                          <i className="bi bi-person-check" />
                          Reviewed by: {selectedRequest.reviewedBy}
                        </span>
                        {selectedRequest.reviewedAt && (
                          <small className="text-muted">{selectedRequest.reviewedAt}</small>
                        )}
                      </div>
                      {selectedRequest.reviewNotes ? (
                        <p className="small mb-0 text-secondary fst-italic mt-1">
                          Staff Response: "{selectedRequest.reviewNotes}"
                        </p>
                      ) : (
                        <small className="text-muted fst-italic">No additional response notes.</small>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top py-2 px-4 bg-light rounded-bottom-3">
                  {(selectedRequest.canEdit ||
                    (!selectedRequest.reviewedBy &&
                      (selectedRequest.status || 'pending').toLowerCase() === 'pending')) && (
                    <button
                      type="button"
                      className="btn btn-warning btn-sm me-auto d-inline-flex align-items-center gap-1 text-dark fw-semibold"
                      onClick={() => {
                        const req = selectedRequest;
                        setSelectedRequest(null);
                        onStartEdit?.(req);
                      }}
                    >
                      <i className="bi bi-pencil-square" /> Edit This Feedback
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
        </>
      )}
    </>
  );
}

export default FeedbackTable;
