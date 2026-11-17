import React, { useState } from 'react';

export interface FeedbackListHeaderProps {
  filterStatus?: 'all' | 'pending' | 'approved' | 'rejected';
  onFilterStatusChange?: (status: 'all' | 'pending' | 'approved' | 'rejected') => void;
  sortOrder?: 'desc' | 'asc';
  onSortOrderChange?: (order: 'desc' | 'asc') => void;
  onOpenCreateModal: () => void;
  userRoleName?: string;
}

export function FeedbackListHeader({
  filterStatus = 'all',
  onFilterStatusChange,
  sortOrder = 'desc',
  onSortOrderChange,
  onOpenCreateModal,
  userRoleName = 'Student',
}: FeedbackListHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 border-bottom">
      <div>
        <h4 className="class-list-title mb-1 fw-bold text-dark">Feedback & Requests List</h4>
        <small className="text-muted">
          Track resolution status of inquiries, feedback, and support requests sent to Admin Staff
        </small>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap position-relative">
        {/* Status Filter */}
        <div className="dropdown position-relative">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            id="feedbackFilterDropdownBtn"
            onClick={() => {
              setFilterOpen(!filterOpen);
              setSortOpen(false);
            }}
          >
            <i className="bi bi-funnel" />
            <span>
              {filterStatus === 'all'
                ? 'All Statuses'
                : filterStatus === 'pending'
                ? 'Pending'
                : filterStatus === 'approved'
                ? 'Resolved'
                : 'Rejected'}
            </span>
            <i className="bi bi-chevron-down ms-1" />
          </button>

          {filterOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show p-3 shadow border-0"
              style={{ minWidth: 200, zIndex: 1050, position: 'absolute', right: 0 }}
            >
              <label className="form-label small fw-bold mb-2">Filter by Status:</label>
              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === 'all' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => {
                    onFilterStatusChange?.('all');
                    setFilterOpen(false);
                  }}
                >
                  All Requests
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === 'pending' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => {
                    onFilterStatusChange?.('pending');
                    setFilterOpen(false);
                  }}
                >
                  Pending
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === 'approved' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => {
                    onFilterStatusChange?.('approved');
                    setFilterOpen(false);
                  }}
                >
                  Resolved
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === 'rejected' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => {
                    onFilterStatusChange?.('rejected');
                    setFilterOpen(false);
                  }}
                >
                  Rejected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="dropdown position-relative">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            id="feedbackSortDropdownBtn"
            onClick={() => {
              setSortOpen(!sortOpen);
              setFilterOpen(false);
            }}
          >
            <i className="bi bi-arrow-down-up" />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            <i className="bi bi-chevron-down ms-1" />
          </button>

          {sortOpen && (
            <ul
              className="dropdown-menu dropdown-menu-end show shadow border-0"
              style={{ zIndex: 1050, position: 'absolute', right: 0 }}
            >
              <li>
                <button
                  type="button"
                  className={`dropdown-item ${sortOrder === 'desc' ? 'active' : ''}`}
                  onClick={() => {
                    onSortOrderChange?.('desc');
                    setSortOpen(false);
                  }}
                >
                  <i className="bi bi-arrow-down me-1" /> Newest first
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`dropdown-item ${sortOrder === 'asc' ? 'active' : ''}`}
                  onClick={() => {
                    onSortOrderChange?.('asc');
                    setSortOpen(false);
                  }}
                >
                  <i className="bi bi-arrow-up me-1" /> Oldest first
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* Create New Feedback Button */}
        <button
          type="button"
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
          onClick={onOpenCreateModal}
        >
          <i className="bi bi-plus-lg" />
          <span>Create New Feedback</span>
        </button>
      </div>
    </div>
  );
}

export default FeedbackListHeader;
