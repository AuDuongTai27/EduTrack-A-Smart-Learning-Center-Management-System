import React from "react";
import { PaginationNavGroup } from "../../CommonPaginationUtils";

export interface ScheduleListPaginationProps {
  totalItems?: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function ScheduleListPagination({
  totalItems = 0,
  currentPage = 1,
  rowsPerPage = 10,
  onPageChange,
}: ScheduleListPaginationProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  return (
    <div className="table-pagination-footer d-flex align-items-center justify-content-between p-3 border-top flex-wrap gap-2">
      <span className="small text-muted">Hiển thị {totalItems} ca trực</span>

      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          className="pagination-text-btn"
          id="prevPageBtn"
          disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.5 : 1, cursor: currentPage <= 1 ? "not-allowed" : "pointer" }}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
        >
          Prev
        </button>

        <div id="paginationContainer" className="d-inline-flex align-items-center gap-1">
          <PaginationNavGroup currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
        </div>

        <button
          type="button"
          className="pagination-text-btn"
          id="nextPageBtn"
          disabled={currentPage >= totalPages}
          style={{ opacity: currentPage >= totalPages ? 0.5 : 1, cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
