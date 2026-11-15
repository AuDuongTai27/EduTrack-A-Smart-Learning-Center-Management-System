import React from "react";
import { Link } from "react-router-dom";
import type { ClassDto } from "../../../../../BLL/models/ClassDto";
import type { TeachingClassItemDto } from "../../../../../BLL/models/teaching/TeachingClassItemDto";

export interface ClassListTableProps {
  classes?: (ClassDto | TeachingClassItemDto)[];
  sortOrder?: "asc" | "desc";
  onToggleSort?: () => void;
}

export function ClassListTable({
  classes = [],
  sortOrder = "asc",
  onToggleSort,
}: ClassListTableProps) {
  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="classesTable">
        <thead>
          <tr>
            <th>
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none text-dark fw-bold d-inline-flex align-items-center gap-1 border-0 shadow-none"
                onClick={onToggleSort}
                title={`Sorting by class: ${sortOrder === "asc" ? "Ascending (Class 8 < Class 9)" : "Descending"}. Click to toggle.`}
              >
                <span>Class Code &amp; Name</span>
                <i className="bi bi-arrow-down-up small text-primary fw-bold" />
                <small className="text-primary fw-semibold" style={{ fontSize: "11px" }}>
                  ({sortOrder === "asc" ? "Ascending" : "Descending"})
                </small>
              </button>
            </th>
            <th>Subject</th>
            <th>Room</th>
            <th>Teaching Assistant (TA)</th>
            <th>Status</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {classes.length > 0 ? (
            classes.map((cls) => {
              const item = cls as any;
              const isActive =
                cls.status?.toLowerCase() === "active" ||
                cls.status === "Đang học" ||
                cls.status === "open";
              const taName = item.taName || item.partnerName || "Au Duong Tai";
              const taInitials =
                taName
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(-2) || "TA";

              return (
                <tr key={cls.classId}>
                  <td>
                    <Link
                      to={`/teacher/classes/${cls.classId}`}
                      className="fw-bold text-dark text-decoration-none"
                    >
                      {cls.className}
                    </Link>
                    <small className="text-muted d-block">Class code: #{cls.classId}</small>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                      {cls.subjectName || "Subject"}
                    </span>
                  </td>
                  <td>
                    <span className="text-secondary small">
                      <i className="bi bi-geo-alt me-1 text-muted" />
                      {cls.room || "Room 201"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center"
                        style={{
                          width: "28px",
                          height: "28px",
                          fontSize: "12px",
                          border: "1px solid #dee2e6",
                        }}
                      >
                        {taInitials}
                      </div>
                      <span className="small">{taName}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        isActive ? "badge-status-active" : "badge-status-inactive"
                      }`}
                    >
                      {isActive ? "Active" : "Completed"}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link
                      to={`/teacher/classes/${cls.classId}`}
                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                    >
                      <i className="bi bi-eye" /> Details
                    </Link>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-4 text-muted">
                <i className="bi bi-search fs-3 d-block mb-1 text-secondary" />
                No classes found matching the search keyword or filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClassListTable;
