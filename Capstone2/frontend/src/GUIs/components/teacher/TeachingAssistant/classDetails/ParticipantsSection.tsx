import { Link } from "react-router-dom";
import type { UserDto } from "../../../../../BLL/models/UserDto";
import type { TeachingClassStudentItemDto } from "../../../../../BLL/models/teaching/TeachingClassItemDto";

export interface ParticipantsSectionProps {
  participants?: (TeachingClassStudentItemDto | UserDto | any)[];
  teacherName?: string;
  taName?: string;
}

export default function ParticipantsSection({
  participants = [],
  teacherName = "ThS. Hoàng Quốc Việt",
  taName = "Âu Dương Tài",
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
          <h4 className="class-list-title mb-0">Class Participants ({participants.length + 2})</h4>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Toggle Section</span>
          <i className="bi bi-chevron-down details-chevron text-muted" />
        </div>
      </summary>
      <div className="table-responsive-container">
        <table className="table custom-table align-middle mb-0">
          <thead>
            <tr>
              <th>Avatar</th>
              <th>Full Name &amp; Code</th>
              <th>Role</th>
              <th>Contact Info</th>
              <th>Parent / Guardian</th>
              <th>Attendance Rate</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Main Teacher */}
            <tr>
              <td>
                <div className="ta-avatar-initials bg-primary text-white">
                  {getInitials(teacherName)}
                </div>
              </td>
              <td className="fw-semibold text-dark">
                {teacherName}
                <small className="text-muted d-block fw-normal">Main Teacher</small>
              </td>
              <td>
                <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1">Teacher</span>
              </td>
              <td>
                <small className="text-dark d-block">viet.hoang@edutrack.edu.vn</small>
                <small className="text-muted">0903 111 222</small>
              </td>
              <td className="text-muted">-</td>
              <td><span className="badge bg-success-subtle text-success fw-medium">100% Present</span></td>
              <td className="text-end"><span className="text-muted small">-</span></td>
            </tr>

            {/* Teaching Assistant */}
            <tr>
              <td>
                <div className="ta-avatar-initials bg-warning text-dark">
                  {getInitials(taName)}
                </div>
              </td>
              <td className="fw-semibold text-dark">
                {taName}
                <small className="text-muted d-block fw-normal">Teaching Assistant</small>
              </td>
              <td>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">Teaching Assistant</span>
              </td>
              <td>
                <small className="text-dark d-block">tai.auduong@edutrack.edu.vn</small>
                <small className="text-muted">0904 222 333</small>
              </td>
              <td className="text-muted">-</td>
              <td><span className="badge bg-success-subtle text-success fw-medium">100% Present</span></td>
              <td className="text-end"><span className="text-muted small">-</span></td>
            </tr>

            {/* Enrolled Students */}
            {participants.length > 0 ? (
              participants.map((student: any, idx: number) => {
                const style = getAvatarBg(idx);
                const rate = student.attendanceRate ?? (95 - (idx * 5));
                const studentCode = student.studentCode || student.userCode || `STU${student.studentId || idx + 1}`;

                return (
                  <tr key={student.studentId || student.userId || idx}>
                    <td>
                      <div
                        className="ta-avatar-initials"
                        style={{ backgroundColor: style.bg, color: style.color }}
                      >
                        {getInitials(student.fullName)}
                      </div>
                    </td>
                    <td className="fw-semibold text-dark">
                      {student.fullName}
                      <small className="text-muted d-block fw-normal">{studentCode}</small>
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info fw-medium px-2.5 py-1">Student</span>
                    </td>
                    <td>
                      <small className="text-dark d-block">{student.email || `${studentCode.toLowerCase()}@student.edutrack.edu.vn`}</small>
                      <small className="text-muted">{student.phone || "0901 234 567"}</small>
                    </td>
                    <td>
                      <small className="text-dark fw-medium d-block">{student.parentName || "Nguyễn Văn Phụ Huynh"}</small>
                      <small className="text-muted">{student.parentPhone || "0912 345 678"}</small>
                    </td>
                    <td>
                      <span className={`badge ${rate >= 90 ? "bg-success-subtle text-success" : rate >= 75 ? "bg-warning-subtle text-warning" : "bg-danger-subtle text-danger"} fw-medium px-2.5 py-1`}>
                        {rate}% attendance
                      </span>
                    </td>
                    <td className="text-end">
                      <Link
                        to="/teaching-assistant/learning-progress"
                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                        title="View learning progress"
                      >
                        <i className="bi bi-graph-up" /> Progress
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-muted">
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
