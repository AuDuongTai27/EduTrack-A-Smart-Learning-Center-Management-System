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
    <div className="table-pagination-footer d-flex align-items-center justify-content-between p-3 border-top flex-wrap gap-2">
      <span className="small text-muted">
        Showing {startItem} to {endItem} of {totalItems} feedback requests
      </span>

      <div className="d-flex align-items-center gap-1">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-2.5 py-1"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
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
                className={`btn btn-sm ${
                  p === currentPage ? 'btn-primary' : 'btn-outline-light text-dark border'
                }`}
                style={{ minWidth: 32 }}
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary px-2.5 py-1"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          Next <i className="bi bi-chevron-right ms-1" />
        </button>
      </div>
    </div>
  );
}

export default FeedbackPagination;
