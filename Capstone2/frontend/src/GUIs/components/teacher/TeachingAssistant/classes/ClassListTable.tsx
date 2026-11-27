import React from "react";
import { Link } from "react-router-dom";
import type { ClassDto } from "../../../../../BLL/models/ClassDto";
import type { TeachingClassItemDto } from "../../../../../BLL/models/teaching/TeachingClassItemDto";

export interface ClassListTableProps {
  classes?: (ClassDto | TeachingClassItemDto)[];
}

export function ClassListTable({
  classes = [],
}: ClassListTableProps) {
  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="taClassesTable">
        <thead>
          <tr>
            <th>Class</th>
            <th>Subject</th>
            <th>Room</th>
            <th>Main Teacher</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
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
              const teacherName =
                item.teacherName || item.partnerName || "Not provided";

              return (
                <tr key={cls.classId}>
                  <td>
                    <span className="fw-bold text-dark">{cls.className}</span>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                      {cls.subjectName || "Subject"}
                    </span>
                  </td>
                  <td>
                    <span className="text-secondary small">
                      <i className="bi bi-geo-alt me-1 text-muted" />
                      {cls.room || "Not provided"}
                    </span>
                  </td>
                  <td>
                    <span className="small text-dark">{teacherName}</span>
                  </td>
                  <td>
                    <span
                      className={`badge-status ${
                        isActive ? "badge-status-active" : "badge-status-inactive"
                      }`}
                    >
                      {isActive ? "Assisting" : "Completed"}
                    </span>
                  </td>
                  <td className="text-end">
                    <Link
                      to={`/teaching-assistant/classes/${cls.classId}`}
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
                No classes found matching the keywords or filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClassListTable;
