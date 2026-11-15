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
}: ClassListToolbarProps) {
  return (
    <div
      className="table-toolbar p-3 bg-light border-bottom d-flex align-items-center justify-content-end"
      style={{ flexWrap: "nowrap" }}
    >
      <div className="d-flex align-items-center gap-2" style={{ flexWrap: "nowrap" }}>
        {/* Dropdown Trạng thái ở bên trái cạnh thanh tìm kiếm trên cùng một hàng */}
        <select
          className="form-select form-select-sm"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange && onStatusFilterChange(e.target.value)}
          style={{ width: "auto", minWidth: 145, flexShrink: 0 }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        {/* Thanh tìm kiếm */}
        <div className="input-group input-group-sm" style={{ width: 280, flexShrink: 0 }}>
          <span className="input-group-text bg-white border-end-0">
            <i className="bi bi-search text-muted" />
          </span>
          <input
            type="search"
            className="form-control form-control-sm border-start-0 ps-0"
            id="tableSearchInput"
            placeholder="Search class name, subject, room..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
