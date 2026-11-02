import React from "react";

export interface ClassListPaginationProps {
  totalItems?: number;
  currentPage?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function ClassListPagination({
  totalItems = 0,
  currentPage = 1,
  rowsPerPage = 10,
  onPageChange,
}: ClassListPaginationProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  if (totalPages <= 1) {
    return (
      <div className="table-pagination-footer d-flex align-items-center justify-content-between p-3 border-top">
        <span className="small text-muted">Hiển thị {totalItems} lớp học</span>
        <span className="small text-muted">Trang 1 / 1</span>
      </div>
    );
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="table-pagination-footer d-flex align-items-center justify-content-between p-3 border-top flex-wrap gap-2">
      <span className="small text-muted">
        Hiển thị {Math.min((currentPage - 1) * rowsPerPage + 1, totalItems)} - {Math.min(currentPage * rowsPerPage, totalItems)} trong {totalItems} lớp
      </span>

      <div className="d-flex align-items-center gap-1">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
        >
          Trước
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => onPageChange && onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
