import React from "react";
import type { TeachingStudentAttendanceItemDto } from "../../../../../BLL/models/teaching/TeachingAttendanceDto";

export interface AttendanceTableProps {
  students?: TeachingStudentAttendanceItemDto[];
  onStatusChange?: (studentId: number, status: string) => void;
  onNoteChange?: (studentId: number, note: string) => void;
  // Backward compatibility
  attendances?: any[];
}

export function AttendanceTable({
  students = [],
  onStatusChange,
  onNoteChange,
}: AttendanceTableProps) {
  const getInitials = (name?: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarClass = (idx: number) => {
    const classes = [
      "avatar-initials-indigo",
      "avatar-initials-emerald",
      "avatar-initials-amber",
      "avatar-initials-rose",
    ];
    return classes[idx % classes.length];
  };

  if (students.length === 0) {
    return (
      <div className="p-5 text-center text-muted">
        <i className="bi bi-inbox fs-2 d-block mb-2 text-secondary" />
        <p className="mb-0">No students found in the class list.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle mb-0" id="taAttendanceTable">
        <thead className="table-light">
          <tr>
            <th style={{ width: "50px" }} className="text-center">No.</th>
            <th style={{ width: "70px" }}>Photo</th>
            <th>Student Name</th>
            <th style={{ minWidth: "320px" }}>Attendance Status</th>
            <th style={{ minWidth: "220px" }}>TA Notes</th>
            <th style={{ width: "120px" }} className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((st, idx) => {
            const radioName = `ta_att_status_${st.studentId}`;
            const currentStatus = st.status?.toLowerCase() || "present";

            return (
              <tr key={st.studentId}>
                {/* STT */}
                <td className="text-center text-muted fw-semibold">{idx + 1}</td>

                {/* Avatar */}
                <td>
                  {st.avatarUrl && st.avatarUrl !== "/assets/img/profiles/avatar-27.jpg" ? (
                    <img
                      src={st.avatarUrl}
                      alt={st.fullName}
                      className="rounded-circle border"
                      style={{ width: "36px", height: "36px", objectFit: "cover" }}
                    />
                  ) : (
                    <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                      {getInitials(st.fullName)}
                    </div>
                  )}
                </td>

                {/* Name & Code */}
                <td>
                  <div className="fw-semibold text-dark">{st.fullName}</div>
                  <small className="badge bg-secondary-subtle text-secondary fw-normal">
                    #{st.studentCode}
                  </small>
                </td>

                {/* Status Radio Buttons */}
                <td>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    {/* Có mặt */}
                    <label
                      className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 ${
                        currentStatus === "present"
                          ? "btn-success text-white shadow-sm fw-bold"
                          : "btn-outline-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="d-none"
                        name={radioName}
                        checked={currentStatus === "present"}
                        onChange={() => onStatusChange && onStatusChange(st.studentId, "present")}
                      />
                      <i className="bi bi-check-circle-fill" />
                      <span>Present</span>
                    </label>

                    {/* Đi muộn */}
                    <label
                      className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 ${
                        currentStatus === "late"
                          ? "btn-warning text-dark shadow-sm fw-bold"
                          : "btn-outline-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="d-none"
                        name={radioName}
                        checked={currentStatus === "late"}
                        onChange={() => onStatusChange && onStatusChange(st.studentId, "late")}
                      />
                      <i className="bi bi-clock-history" />
                      <span>Late</span>
                    </label>

                    {/* Vắng */}
                    <label
                      className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 ${
                        currentStatus === "absent"
                          ? "btn-danger text-white shadow-sm fw-bold"
                          : "btn-outline-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="d-none"
                        name={radioName}
                        checked={currentStatus === "absent"}
                        onChange={() => onStatusChange && onStatusChange(st.studentId, "absent")}
                      />
                      <i className="bi bi-x-circle-fill" />
                      <span>Absent</span>
                    </label>

                    {/* Có phép */}
                    <label
                      className={`btn btn-sm d-inline-flex align-items-center gap-2 px-2.5 py-1 ${
                        currentStatus === "excused" || currentStatus === "excuse"
                          ? "btn-info text-dark shadow-sm fw-bold"
                          : "btn-outline-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        className="d-none"
                        name={radioName}
                        checked={currentStatus === "excused" || currentStatus === "excuse"}
                        onChange={() => onStatusChange && onStatusChange(st.studentId, "excused")}
                      />
                      <i className="bi bi-shield-check" />
                      <span>Excused</span>
                    </label>
                  </div>
                </td>

                {/* Note */}
                <td>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Reason for late/absence, student support..."
                    value={st.note || ""}
                    onChange={(e) => onNoteChange && onNoteChange(st.studentId, e.target.value)}
                  />
                </td>

                {/* Saved Status Indicator */}
                <td className="text-center">
                  {st.isRecorded ? (
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" title={st.recordedAt ? `Saved: ${st.recordedAt}` : "Saved to database"}>
                      <i className="bi bi-check2-all me-1" /> Saved
                    </span>
                  ) : (
                    <span className="badge bg-light text-muted border px-2 py-1">
                      Unsaved
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
