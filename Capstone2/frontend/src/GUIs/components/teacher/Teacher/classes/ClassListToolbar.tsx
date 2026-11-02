import React from "react";

export interface ClassListToolbarProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (val: number) => void;
  totalFiltered?: number;
  totalAll?: number;
}

export default function ClassListToolbar({
  searchTerm = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  totalFiltered,
  totalAll,
}: ClassListToolbarProps) {
  return (
    <div className="table-toolbar p-3 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div className="table-entries-select d-flex align-items-center gap-1">
          <span className="small text-muted">Hiển thị</span>
          <select
            className="form-select form-select-sm"
            id="entriesSelect"
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange && onRowsPerPageChange(Number(e.target.value))}
            style={{ width: "auto" }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="small text-muted">dòng</span>
        </div>

        <div className="d-flex align-items-center gap-1">
          <span className="small text-muted">Trạng thái:</span>
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Tất cả lớp</option>
            <option value="active">Đang giảng dạy</option>
            <option value="completed">Đã kết thúc</option>
          </select>
        </div>

        {totalFiltered !== undefined && totalAll !== undefined && (
          <span className="text-muted small">
            (Tìm thấy <strong>{totalFiltered}</strong> / {totalAll} lớp)
          </span>
        )}
      </div>

      <div>
        <input
          type="search"
          className="form-control form-control-sm table-search-input"
          id="tableSearchInput"
          placeholder="Tìm tên lớp, môn học, phòng..."
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>
    </div>
  );
}
