import React, { useState } from "react";

export interface NotificationsHeaderProps {
  filterStatus?: "all" | "unread" | "read";
  onFilterStatusChange?: (status: "all" | "unread" | "read") => void;
  sortOrder?: "desc" | "asc";
  onSortOrderChange?: (order: "desc" | "asc") => void;
  onMarkAllAsRead?: () => void;
  unreadCount?: number;
}

export default function NotificationsHeader({
  filterStatus = "all",
  onFilterStatusChange,
  sortOrder = "desc",
  onSortOrderChange,
  onMarkAllAsRead,
  unreadCount = 0,
}: NotificationsHeaderProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3 p-3 border-bottom">
      <div>
        <h4 className="class-list-title mb-1 d-flex align-items-center gap-2">
          Notifications
          {unreadCount > 0 && (
            <span className="badge bg-danger rounded-pill fs-6">{unreadCount} new</span>
          )}
        </h4>
        <small className="text-muted">View and manage work notifications from EduTrack Center</small>
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap position-relative">
        {/* Filter Dropdown */}
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
                ? "All"
                : filterStatus === "unread"
                ? "Unread"
                : "Read"}
            </span>
            <i className="bi bi-chevron-down ms-1" />
          </button>

          {filterOpen && (
            <div
              className="dropdown-menu dropdown-menu-end show p-3 shadow border-0"
              style={{ minWidth: 200, zIndex: 1050, position: "absolute", right: 0 }}
            >
              <label className="form-label small fw-bold mb-2">Read status:</label>
              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === "all" ? "btn-primary" : "btn-light"}`}
                  onClick={() => {
                    onFilterStatusChange?.("all");
                    setFilterOpen(false);
                  }}
                >
                  All notifications
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === "unread" ? "btn-primary" : "btn-light"}`}
                  onClick={() => {
                    onFilterStatusChange?.("unread");
                    setFilterOpen(false);
                  }}
                >
                  Unread
                </button>
                <button
                  type="button"
                  className={`btn btn-sm text-start ${filterStatus === "read" ? "btn-primary" : "btn-light"}`}
                  onClick={() => {
                    onFilterStatusChange?.("read");
                    setFilterOpen(false);
                  }}
                >
                  Read
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
            <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
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
                  <i className="bi bi-arrow-down me-1" /> Newest first
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
                  <i className="bi bi-arrow-up me-1" /> Oldest first
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* Mark all as read */}
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          id="markAllReadBtn"
          onClick={onMarkAllAsRead}
        >
          <i className="bi bi-check2-all" />
          <span>Mark all as read</span>
        </button>
      </div>
    </div>
  );
}
