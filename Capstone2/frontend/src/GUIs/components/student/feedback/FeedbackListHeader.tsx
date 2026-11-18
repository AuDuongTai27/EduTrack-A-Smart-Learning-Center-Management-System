import React, { useState, useEffect, useRef } from 'react';

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

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 px-4 py-3 border-bottom bg-white">
      <div className="d-flex align-items-center gap-2.5">
        <div
          className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 40, height: 40 }}
        >
          <i className="bi bi-chat-left-text-fill fs-5" />
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '-0.01em' }}>
            Feedback & Requests
          </h5>
          <small className="text-muted" style={{ fontSize: '13px' }}>
            Track resolution status of your inquiries and support tickets sent to Staff
          </small>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap">
        {/* Status Filter Dropdown */}
        <div className="dropdown position-relative" ref={filterRef}>
          <button
            type="button"
            className={`btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 ${
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
            <i className="bi bi-chevron-down ms-0.5" style={{ fontSize: '11px' }} />
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
                    className={`btn btn-sm text-start rounded-2 px-2.5 py-1.5 ${
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
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
            id="feedbackSortDropdownBtn"
            onClick={() => {
              setSortOpen(!sortOpen);
              setFilterOpen(false);
            }}
          >
            <i className="bi bi-arrow-down-up" />
            <span style={{ fontSize: '13px' }}>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
            <i className="bi bi-chevron-down ms-0.5" style={{ fontSize: '11px' }} />
          </button>

          {sortOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show p-1 shadow-sm border rounded-3 mt-1"
              style={{ minWidth: 160, zIndex: 1050, position: 'absolute', right: 0 }}
            >
              <button
                type="button"
                className={`dropdown-item rounded-2 py-1.5 px-2.5 d-flex align-items-center gap-2 ${
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
                className={`dropdown-item rounded-2 py-1.5 px-2.5 d-flex align-items-center gap-2 ${
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
        <button
          type="button"
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium shadow-sm"
          onClick={onOpenCreateModal}
          style={{ fontSize: '13px' }}
        >
          <i className="bi bi-plus-circle" />
          <span>New Feedback</span>
        </button>
      </div>
    </div>
  );
}

export default FeedbackListHeader;
