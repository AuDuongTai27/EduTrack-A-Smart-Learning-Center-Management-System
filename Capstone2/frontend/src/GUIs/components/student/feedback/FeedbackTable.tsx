import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { FeedbackApprovalRequest } from './feedbackData';
import Pagination from '../../Common/Pagination';

export interface FeedbackTableProps {
  requests?: FeedbackApprovalRequest[];
  onRequestUpdated?: (updated: FeedbackApprovalRequest) => void;
  onStartEdit?: (item: FeedbackApprovalRequest) => void;
  userRoleName?: string;
  filterStatus?: 'all' | 'pending' | 'approved' | 'rejected';
  onFilterStatusChange?: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  sortOrder?: 'desc' | 'asc';
  onSortOrderChange?: (order: 'desc' | 'asc') => void;
  onOpenCreateModal?: () => void;
}

export function FeedbackTable({
  requests = [],
  onStartEdit,
  userRoleName = 'Student',
  filterStatus = 'all',
  onFilterStatusChange,
  sortOrder = 'desc',
  onSortOrderChange,
  onOpenCreateModal,
}: FeedbackTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<FeedbackApprovalRequest | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getFilterLabel = () => {
    switch (filterStatus) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'All Statuses';
    }
  };

  const getStatusBadge = (req: FeedbackApprovalRequest) => {
    const s = (req.status || 'pending').toLowerCase();
    if (s === 'approved') {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-check-circle-fill" /> Resolved
        </span>
      );
    }
    if (s === 'rejected') {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-x-circle-fill" /> Rejected
        </span>
      );
    }

    // If unreviewed or canEdit -> "Pending Review"
    const isUnreviewed = req.canEdit || (!req.reviewedBy && s === 'pending');
    if (isUnreviewed) {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-pill fw-semibold d-inline-flex align-items-center gap-1">
          <i className="bi bi-clock-history" /> Pending Review
        </span>
      );
    }

    // Admin/Staff claimed -> "Pending (Processing)"
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 rounded-pill fw-semibold d-inline-flex align-items-center gap-1">
        <i className="bi bi-hourglass-split" /> Processing
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const p = (priority || 'medium').toLowerCase();
    if (p === 'high') {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 rounded-pill fw-medium">
          High
        </span>
      );
    }
    if (p === 'low') {
      return (
        <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-pill fw-medium">
          Low
        </span>
      );
    }
    return (
      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 rounded-pill fw-medium">
        Medium
      </span>
    );
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
      {/* Unified Table Toolbar: Search on the left, Filter & Actions on the right */}
      <div className="table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-2 px-4 py-3 border-bottom bg-white">
        {/* Search Input */}
        <div>
          <div className="input-group input-group-sm" style={{ width: 290 }}>
            <span className="input-group-text bg-white border-end-0 text-muted rounded-start-2">
              <i className="bi bi-search" style={{ fontSize: '12px' }} />
            </span>
            <input
              type="search"
              className="form-control form-control-sm border-start-0 ps-1 rounded-end-2"
              id="feedbackSearchInput"
              placeholder="Search by code, title, details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Filter, Sort and Create Action */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Status Filter Dropdown */}
          <div className="dropdown position-relative" ref={filterRef}>
            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1 px-3 py-1 rounded-2 ${
                filterStatus !== 'all' ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              id="feedbackFilterDropdownBtn"
              onClick={() => {
                setFilterOpen(!filterOpen);
                setSortOpen(false);
              }}
            >
              <i className="bi bi-funnel" />
              <span style={{ fontSize: '13px' }}>{getFilterLabel()}</span>
              <i className="bi bi-chevron-down ms-1" style={{ fontSize: '11px' }} />
            </button>

            {filterOpen && (
              <div
                className="dropdown-menu dropdown-menu-end show p-2 shadow-sm border rounded-3 mt-1"
                style={{ minWidth: 190, zIndex: 1050, position: 'absolute', right: 0 }}
              >
                <div className="px-2 py-1 text-muted small fw-semibold">Filter by Status:</div>
                <div className="d-flex flex-column gap-1">
                  {[
                    { key: 'all', label: 'All Requests' },
                    { key: 'pending', label: 'Pending' },
                    { key: 'approved', label: 'Resolved' },
                    { key: 'rejected', label: 'Rejected' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`btn btn-sm text-start rounded-2 px-2 py-1 ${
                        filterStatus === item.key ? 'btn-primary' : 'btn-light text-dark'
                      }`}
                      style={{ fontSize: '13px' }}
                      onClick={() => {
                        onFilterStatusChange?.(item.key as any);
                        setFilterOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="dropdown position-relative" ref={sortRef}>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 px-3 py-1 rounded-2"
              id="feedbackSortDropdownBtn"
              onClick={() => {
                setSortOpen(!sortOpen);
                setFilterOpen(false);
              }}
            >
              <i className="bi bi-arrow-down-up" />
              <span style={{ fontSize: '13px' }}>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
              <i className="bi bi-chevron-down ms-1" style={{ fontSize: '11px' }} />
            </button>

            {sortOpen && (
              <div
                className="dropdown-menu dropdown-menu-end show p-1 shadow-sm border rounded-3 mt-1"
                style={{ minWidth: 160, zIndex: 1050, position: 'absolute', right: 0 }}
              >
                <button
                  type="button"
                  className={`dropdown-item rounded-2 py-1 px-2 d-flex align-items-center gap-2 ${
                    sortOrder === 'desc' ? 'active' : ''
                  }`}
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    onSortOrderChange?.('desc');
                    setSortOpen(false);
                  }}
                >
                  <i className="bi bi-arrow-down" /> Newest first
                </button>
                <button
                  type="button"
                  className={`dropdown-item rounded-2 py-1 px-2 d-flex align-items-center gap-2 ${
                    sortOrder === 'asc' ? 'active' : ''
                  }`}
                  style={{ fontSize: '13px' }}
                  onClick={() => {
                    onSortOrderChange?.('asc');
                    setSortOpen(false);
                  }}
                >
                  <i className="bi bi-arrow-up" /> Oldest first
                </button>
              </div>
            )}
          </div>

          {/* Create New Feedback Button */}
          {onOpenCreateModal && (
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 px-3 py-1 rounded-2 fw-medium shadow-sm"
              onClick={onOpenCreateModal}
              style={{ fontSize: '13px' }}
            >
              <i className="bi bi-plus-circle" />
              <span>New Feedback</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table align-middle mb-0 table-hover" id="feedbackTable">
          <thead className="table-light border-bottom">
            <tr>
              <th className="py-3 px-4 text-secondary fw-semibold text-nowrap" style={{ width: 155, fontSize: '12px', letterSpacing: '0.03em' }}>
                REQUEST CODE
              </th>
              <th className="py-3 ps-4 pe-3 text-secondary fw-semibold" style={{ fontSize: '12px', letterSpacing: '0.03em' }}>
                TITLE & DETAILS
              </th>
              <th className="py-3 px-3 text-center text-secondary fw-semibold" style={{ width: 105, fontSize: '12px', letterSpacing: '0.03em' }}>
                PRIORITY
              </th>
              <th className="py-3 px-3 text-secondary fw-semibold" style={{ width: 145, fontSize: '12px', letterSpacing: '0.03em' }}>
                SUBMITTED DATE
              </th>
              <th className="py-3 px-3 text-secondary fw-semibold" style={{ width: 155, fontSize: '12px', letterSpacing: '0.03em' }}>
                STATUS
              </th>
              <th className="py-3 px-4 text-end text-secondary fw-semibold" style={{ width: 165, fontSize: '12px', letterSpacing: '0.03em' }}>
                ACTIONS
              </th>
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
                    <td className="py-3 px-4 text-nowrap">
                      <button
                        type="button"
                        className="btn btn-link p-0 fw-bold text-primary text-decoration-none font-monospace"
                        onClick={() => setSelectedRequest(req)}
                        title="View details"
                        style={{ fontSize: '13px' }}
                      >
                        {req.requestCode || `#${req.id}`}
                      </button>
                    </td>
                    <td className="py-3 ps-4 pe-3">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span className="text-dark fw-semibold" style={{ fontSize: '14px' }}>
                          {req.title}
                        </span>
                        {req.className && (
                          <span className="badge bg-primary-subtle text-primary border-0 rounded-1 px-2 py-1" style={{ fontSize: '11px' }}>
                            {req.className}
                          </span>
                        )}
                      </div>
                      <small
                        className="text-muted text-truncate d-block mt-1"
                        style={{ maxWidth: 440, fontSize: '12.5px' }}
                      >
                        {req.description}
                      </small>
                    </td>
                    <td className="py-3 px-3 text-center">{getPriorityBadge(req.priority)}</td>
                    <td className="py-3 px-3 text-muted small" style={{ fontSize: '12.5px' }}>
                      {req.createdAt || 'Just now'}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(req)}</td>
                    <td className="py-3 px-4 text-end">
                      <div className="d-inline-flex align-items-center gap-2 justify-content-end">
                        {isEditable ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1"
                            onClick={() => onStartEdit?.(req)}
                            title="Edit feedback (Pending Review)"
                            style={{ fontSize: '12.5px' }}
                          >
                            <i className="bi bi-pencil" /> Edit
                          </button>
                        ) : (
                          <span
                            className="badge bg-light text-muted border py-1 px-2 rounded-2"
                            title="The request has been claimed by Staff and is locked from editing"
                            style={{ fontSize: '11.5px' }}
                          >
                            <i className="bi bi-lock-fill me-1" /> Locked
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded-2 px-2 py-1"
                          onClick={() => setSelectedRequest(req)}
                          style={{ fontSize: '12.5px' }}
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
                <td colSpan={6} className="text-center py-5 text-muted">
                  <div className="py-3">
                    <i className="bi bi-chat-square-dots fs-1 d-block mb-2 text-secondary opacity-50" />
                    <h6 className="fw-semibold text-dark mb-1">No feedback requests found</h6>
                    <small className="text-muted">
                      {searchTerm
                        ? 'Try adjusting your search keywords or clear the filter.'
                        : 'You haven’t submitted any feedback yet. Click "New Feedback" to get started.'}
                    </small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      {filteredRequests.length > 0 && (
        <div className="px-4 py-3 border-top bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            entriesPerPage={rowsPerPage}
            itemLabel="feedback requests"
            onPageChange={(page) => setCurrentPage(page)}
            showSummary={false}
          />
        </div>
      )}

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
              <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
                <div className="modal-header border-bottom py-3 px-4 bg-white">
                  <h5
                    className="modal-title d-flex align-items-center gap-2 fw-bold text-dark"
                    id="feedbackDetailModalTitle"
                    style={{ fontSize: '17px' }}
                  >
                    <i className="bi bi-journal-text text-primary fs-5" />
                    <span>Feedback Details: {selectedRequest.requestCode || `#${selectedRequest.id}`}</span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedRequest(null)}
                    aria-label="Close"
                  />
                </div>

                <div className="modal-body p-4">
                  {/* Title & Badges */}
                  <div className="mb-3">
                    <h6 className="fw-bold mb-2 text-dark fs-5">{selectedRequest.title}</h6>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {getStatusBadge(selectedRequest)}
                      {getPriorityBadge(selectedRequest.priority)}
                      <small className="text-muted ms-1">
                        <i className="bi bi-calendar3 me-1" />
                        {selectedRequest.createdAt || 'N/A'}
                      </small>
                    </div>
                  </div>

                  {/* Detailed Content */}
                  <div className="p-3 bg-light rounded-3 mb-3 border">
                    <label className="form-label small fw-bold text-muted mb-1 text-uppercase" style={{ fontSize: '11.5px', letterSpacing: '0.03em' }}>
                      Detailed Content
                    </label>
                    <p className="mb-0 text-dark small" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '13.5px' }}>
                      {selectedRequest.description || 'No detailed content.'}
                    </p>
                  </div>

                  {/* Review Notes from Staff */}
                  {selectedRequest.reviewedBy && (
                    <div className="p-3 bg-success-subtle bg-opacity-25 rounded-3 border border-success-subtle border-start border-start-4 border-start-success">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="small fw-bold text-success d-flex align-items-center gap-1">
                          <i className="bi bi-person-check-fill" />
                          Reviewed by: {selectedRequest.reviewedBy}
                        </span>
                        {selectedRequest.reviewedAt && (
                          <small className="text-muted" style={{ fontSize: '12px' }}>{selectedRequest.reviewedAt}</small>
                        )}
                      </div>
                      {selectedRequest.reviewNotes ? (
                        <p className="small mb-0 text-dark mt-1" style={{ fontSize: '13px', lineHeight: 1.5 }}>
                          <strong>Staff Response:</strong> "{selectedRequest.reviewNotes}"
                        </p>
                      ) : (
                        <small className="text-muted fst-italic">No additional response notes.</small>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer border-top py-2 px-4 d-flex justify-content-end gap-2 bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-2 px-3 py-1"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Close
                  </button>
                  {(selectedRequest.canEdit ||
                    (!selectedRequest.reviewedBy &&
                      (selectedRequest.status || 'pending').toLowerCase() === 'pending')) && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 fw-medium rounded-2 px-3 py-1"
                      onClick={() => {
                        const req = selectedRequest;
                        setSelectedRequest(null);
                        onStartEdit?.(req);
                      }}
                    >
                      <i className="bi bi-pencil-square" /> Edit Feedback
                    </button>
                  )}
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
