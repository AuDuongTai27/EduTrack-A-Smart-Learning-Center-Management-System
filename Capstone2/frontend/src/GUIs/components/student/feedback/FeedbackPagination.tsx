import React from 'react';

export interface FeedbackPaginationProps {
  totalItems?: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export function FeedbackPagination({
  totalItems = 0,
  currentPage = 1,
  rowsPerPage = 10,
  onPageChange,
}: FeedbackPaginationProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="table-pagination-footer d-flex align-items-center justify-content-between px-4 py-2.5 border-top bg-light bg-opacity-30 flex-wrap gap-2">
      <span className="small text-muted" style={{ fontSize: '13px' }}>
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> feedback requests
      </span>

      <div className="d-flex align-items-center gap-1.5">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-2"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
          style={{ fontSize: '12.5px' }}
        >
          <i className="bi bi-chevron-left me-1" /> Prev
        </button>

        <div className="d-inline-flex align-items-center gap-1 mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            if (
              totalPages > 6 &&
              p !== 1 &&
              p !== totalPages &&
              Math.abs(p - currentPage) > 1
            ) {
              if (p === 2 || p === totalPages - 1) {
                return (
                  <span key={p} className="text-muted px-1 small">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={p}
                type="button"
                className={`btn btn-sm rounded-2 ${
                  p === currentPage ? 'btn-primary' : 'btn-outline-light text-dark border'
                }`}
                style={{ minWidth: 32, height: 32, padding: '0 6px', fontSize: '12.5px' }}
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-2.5 py-1 rounded-2"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
          style={{ fontSize: '12.5px' }}
        >
          Next <i className="bi bi-chevron-right ms-1" />
        </button>
      </div>
    </div>
  );
}

export default FeedbackPagination;
