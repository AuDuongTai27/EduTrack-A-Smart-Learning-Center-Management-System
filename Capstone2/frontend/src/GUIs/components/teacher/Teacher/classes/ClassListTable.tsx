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
  const hasMixedClassRoles =
    classes.some((c: any) => c.myRoleInClass === "teaching_assistant") &&
    classes.some((c: any) => !c.myRoleInClass || c.myRoleInClass === "teacher");

  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="classesTable">
        <thead>
          <tr>
            <th>Class</th>
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
              const taName = item.taName || item.partnerName || "Not provided";
              const isTaRoleInClass = item.myRoleInClass === "teaching_assistant";

              return (
                <tr key={cls.classId}>
                  <td>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <span className="fw-bold text-dark">{cls.className}</span>
                      {(isTaRoleInClass || hasMixedClassRoles) && (
                        <span
                          className={`badge rounded-pill border fw-semibold ${
                            isTaRoleInClass
                              ? "bg-info-subtle text-info-emphasis border-info-subtle"
                              : "bg-primary-subtle text-primary border-primary-subtle"
                          }`}
                          style={{ fontSize: "11px" }}
                        >
                          {isTaRoleInClass ? "TA" : "Teacher"}
                        </span>
                      )}
                    </div>
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
                    <span className="small text-dark">{taName}</span>
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
