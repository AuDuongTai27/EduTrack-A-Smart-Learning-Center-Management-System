import React from "react";

export interface ScheduleListToolbarProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  dayFilter?: string;
  onDayFilterChange?: (val: string) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (val: number) => void;
  totalFiltered?: number;
  totalAll?: number;
}

export default function ScheduleListToolbar({
  searchTerm = "",
  onSearchChange,
  dayFilter = "all",
  onDayFilterChange,
  rowsPerPage = 10,
  onRowsPerPageChange,
  totalFiltered,
  totalAll,
}: ScheduleListToolbarProps) {
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
          <span className="small text-muted">ca</span>
        </div>

        <div className="d-flex align-items-center gap-1">
          <span className="small text-muted">Thứ trong tuần:</span>
          <select
            className="form-select form-select-sm"
            value={dayFilter}
            onChange={(e) => onDayFilterChange && onDayFilterChange(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="all">Tất cả các thứ</option>
            <option value="Monday">Thứ Hai</option>
            <option value="Tuesday">Thứ Ba</option>
            <option value="Wednesday">Thứ Tư</option>
            <option value="Thursday">Thứ Năm</option>
            <option value="Friday">Thứ Sáu</option>
            <option value="Saturday">Thứ Bảy</option>
            <option value="Sunday">Chủ Nhật</option>
          </select>
        </div>

        {totalFiltered !== undefined && totalAll !== undefined && (
          <span className="text-muted small">
            (Tìm thấy <strong>{totalFiltered}</strong> / {totalAll} ca trực)
          </span>
        )}
      </div>

      <div>
        <input
          type="search"
          className="form-control form-control-sm table-search-input"
          id="tableSearchInput"
          placeholder="Tìm tên lớp, môn, phòng học..."
          value={searchTerm}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>
    </div>
  );
}
