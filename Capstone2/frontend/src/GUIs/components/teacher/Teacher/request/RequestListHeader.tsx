import React, { useState } from "react";
import NewRequestModal from "./NewRequestModal";
import type { ApprovalRequestDto } from "../../../../../BLL/models/ApprovalRequestDto";

export interface RequestListHeaderProps {
  filterStatus?: "all" | "pending" | "approved" | "rejected";
  onFilterStatusChange?: (status: "all" | "pending" | "approved" | "rejected") => void;
  sortOrder?: "desc" | "asc";
  onSortOrderChange?: (order: "desc" | "asc") => void;
  onRequestCreated?: (newRequest: ApprovalRequestDto) => void;
  defaultRequestedBy?: number;
  userRoleName?: string;
}

export default function RequestListHeader({
  filterStatus = "all",
  onFilterStatusChange,
  sortOrder = "desc",
  onSortOrderChange,
  onRequestCreated,
  defaultRequestedBy = 3,
  userRoleName = "Giáo viên",
}: RequestListHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <>
      <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 border-bottom">
        <div>
          <h4 className="class-list-title mb-1">Danh Sách Đơn Từ &amp; Yêu Cầu</h4>
          <small className="text-muted">Theo dõi tình trạng phê duyệt đơn xin nghỉ, đổi lịch, đề xuất thiết bị</small>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap position-relative">
          {/* Status Filter */}
          <div className="dropdown position-relative">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              id="filterDropdownBtn"
              onClick={() => {
                setFilterOpen(!filterOpen);
                setSortOpen(false);
              }}
            >
              <i className="bi bi-funnel" />
              <span>
                {filterStatus === "all"
                  ? "Tất cả trạng thái"
                  : filterStatus === "pending"
                  ? "Chờ duyệt"
                  : filterStatus === "approved"
                  ? "Đã duyệt"
                  : "Từ chối"}
              </span>
              <i className="bi bi-chevron-down ms-1" />
            </button>

            {filterOpen && (
              <div
                className="dropdown-menu dropdown-menu-end show p-3 shadow border-0"
                style={{ minWidth: 200, zIndex: 1050, position: "absolute", right: 0 }}
              >
                <label className="form-label small fw-bold mb-2">Lọc trạng thái:</label>
                <div className="d-flex flex-column gap-1">
                  <button
                    type="button"
                    className={`btn btn-sm text-start ${filterStatus === "all" ? "btn-primary" : "btn-light"}`}
                    onClick={() => {
                      onFilterStatusChange?.("all");
                      setFilterOpen(false);
                    }}
                  >
                    Tất cả đơn
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm text-start ${filterStatus === "pending" ? "btn-primary" : "btn-light"}`}
                    onClick={() => {
                      onFilterStatusChange?.("pending");
                      setFilterOpen(false);
                    }}
                  >
                    Chờ duyệt (Pending)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm text-start ${filterStatus === "approved" ? "btn-primary" : "btn-light"}`}
                    onClick={() => {
                      onFilterStatusChange?.("approved");
                      setFilterOpen(false);
                    }}
                  >
                    Đã duyệt (Approved)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm text-start ${filterStatus === "rejected" ? "btn-primary" : "btn-light"}`}
                    onClick={() => {
                      onFilterStatusChange?.("rejected");
                      setFilterOpen(false);
                    }}
                  >
                    Đã từ chối (Rejected)
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
              id="sortDropdownBtn"
              onClick={() => {
                setSortOpen(!sortOpen);
                setFilterOpen(false);
              }}
            >
              <i className="bi bi-arrow-down-up" />
              <span>{sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}</span>
              <i className="bi bi-chevron-down ms-1" />
            </button>

            {sortOpen && (
              <ul
                className="dropdown-menu dropdown-menu-end show shadow border-0"
                style={{ zIndex: 1050, position: "absolute", right: 0 }}
              >
                <li>
                  <button
                    type="button"
                    className={`dropdown-item ${sortOrder === "desc" ? "active" : ""}`}
                    onClick={() => {
                      onSortOrderChange?.("desc");
                      setSortOpen(false);
                    }}
                  >
                    <i className="bi bi-arrow-down me-1" /> Mới nhất trước
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={`dropdown-item ${sortOrder === "asc" ? "active" : ""}`}
                    onClick={() => {
                      onSortOrderChange?.("asc");
                      setSortOpen(false);
                    }}
                  >
                    <i className="bi bi-arrow-up me-1" /> Cũ nhất trước
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* New Request Button */}
          <button
            type="button"
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="bi bi-plus-lg" />
            <span>Tạo đơn mới</span>
          </button>
        </div>
      </div>

      {/* Modal Dialog */}
      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRequestCreated={onRequestCreated}
        defaultRequestedBy={defaultRequestedBy}
        userRoleName={userRoleName}
      />
    </>
  );
}
