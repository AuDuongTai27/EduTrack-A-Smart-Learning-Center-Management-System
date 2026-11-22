import { Link } from "react-router-dom";
import type { UserDto } from "../../../../../BLL/models/UserDto";
import type { TeachingClassStudentItemDto } from "../../../../../BLL/models/teaching/TeachingClassItemDto";

export interface ParticipantsSectionProps {
  classId?: string | number;
  participants?: (TeachingClassStudentItemDto | UserDto | any)[];
  teacherName?: string;
  taName?: string;
  baseRolePath?: string;
}

export default function ParticipantsSection({
  classId = "1",
  participants = [],
  baseRolePath = "/teacher",
}: ParticipantsSectionProps) {
  const getInitials = (name: string) => {
    if (!name) return "ST";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (idx: number) => {
    const bgs = [
      { bg: "#e0e7ff", color: "#3730a3" },
      { bg: "#dcfce7", color: "#166534" },
      { bg: "#fef3c7", color: "#92400e" },
      { bg: "#f3e8ff", color: "#6b21a8" },
      { bg: "#fee2e2", color: "#991b1b" },
    ];
    return bgs[idx % bgs.length];
  };

  return (
    <details className="card class-list-card border-0 mb-4" open>
      <summary className="class-list-header d-flex align-items-center justify-content-between cursor-pointer py-3 px-4">
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-people-fill text-primary fs-5" />
          <h4 className="class-list-title mb-0">Class Participants ({participants.length})</h4>
        </div>
        <i className="bi bi-chevron-down details-chevron text-muted" />
      </summary>
      <div className="table-responsive-container">
        <table className="table custom-table align-middle mb-0">
          <thead>
            <tr>
              <th><span style={{ marginLeft: "36px" }}>Full Name</span></th>
              <th>Role</th>
              <th>Contact Info</th>
              <th>Parent / Guardian</th>
              <th>Attendance Rate</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Enrolled Students */}
            {participants.length > 0 ? (
              participants.map((student: any, idx: number) => {
                const style = getAvatarBg(idx);
                const rate = typeof student.attendanceRate === "number" ? student.attendanceRate : null;

                return (
                  <tr key={student.studentId || student.userId || idx}>
                    <td className="fw-semibold text-dark">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="ta-avatar-initials flex-shrink-0"
                          style={{ backgroundColor: style.bg, color: style.color }}
                        >
                          {getInitials(student.fullName)}
                        </div>
                        <span>{student.fullName}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info fw-medium px-2.5 py-1">Student</span>
                    </td>
                    <td>
                      <small className="text-dark d-block">{student.email || "-"}</small>
                      <small className="text-muted">{student.phone || "-"}</small>
                    </td>
                    <td>
                      <small className="text-dark fw-medium d-block">{student.parentName || "-"}</small>
                      <small className="text-muted">{student.parentPhone || "-"}</small>
                    </td>
                    <td>
                      {rate !== null ? (
                        <span className={`badge ${rate >= 90 ? "bg-success-subtle text-success" : rate >= 75 ? "bg-warning-subtle text-warning" : "bg-danger-subtle text-danger"} fw-medium px-2.5 py-1`}>
                          {rate}% attendance
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-end">
                      <Link
                        to={`${baseRolePath}/classes/${classId}/student/${student.studentId || student.userId || student.id || idx + 1}`}
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                        title="View student learning progress and evaluations"
                      >
                        <i className="bi bi-graph-up" /> Progress
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted">
                  <i className="bi bi-people fs-3 d-block mb-1 text-secondary" />
                  No students currently enrolled in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
