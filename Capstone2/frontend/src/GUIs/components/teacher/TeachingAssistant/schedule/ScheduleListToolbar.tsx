import React from "react";

export interface ScheduleListToolbarProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  dayFilter?: string;
  onDayFilterChange?: (val: string) => void;
  statusFilter?: string;
  onStatusFilterChange?: (val: string) => void;
}

export default function ScheduleListToolbar({
  searchTerm = "",
  onSearchChange,
  dayFilter = "all",
  onDayFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
}: ScheduleListToolbarProps) {
  return (
    <div className="table-toolbar p-3 bg-light border-bottom d-flex align-items-center justify-content-end flex-wrap gap-3">
      {/* Dropdown Thứ trong tuần */}
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

      {/* Dropdown Trạng thái */}
      <div className="d-flex align-items-center gap-1">
        <span className="small text-muted">Trạng thái:</span>
        <select
          className="form-select form-select-sm"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Search Input */}
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
