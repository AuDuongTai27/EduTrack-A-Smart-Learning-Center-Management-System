import type { UserDto } from "../../../../../BLL/models/UserDto";

export interface ParticipantsSectionProps {
  participants?: UserDto[];
  teacherName?: string;
  taName?: string;
}

export default function ParticipantsSection({
  participants = [],
  teacherName = "ThS. Hoàng Quốc Việt",
  taName = "Âu Dương Tài",
}: ParticipantsSectionProps) {
  const getInitials = (name: string) => {
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
              <th>Full Name</th>
              <th>Role</th>
              <th>Overall Grade (Out of 10)</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="ta-avatar-initials bg-primary text-white">
                  {getInitials(teacherName)}
                </div>
              </td>
              <td className="fw-semibold text-dark">{teacherName}</td>
              <td>
                <span className="badge bg-primary-subtle text-primary fw-medium px-2.5 py-1">Teacher</span>
              </td>
              <td className="text-muted">-</td>
              <td className="text-end"><span className="text-muted small">-</span></td>
            </tr>
            <tr>
              <td>
                <div className="ta-avatar-initials bg-warning text-dark">
                  {getInitials(taName)}
                </div>
              </td>
              <td className="fw-semibold text-dark">{taName}</td>
              <td>
                <span className="badge bg-warning-subtle text-warning-emphasis fw-medium px-2.5 py-1">Teaching Assistant</span>
              </td>
              <td className="text-muted">-</td>
              <td className="text-end"><span className="text-muted small">-</span></td>
            </tr>
            {participants.length > 0 ? (
              participants.map((student, idx) => {
                const style = getAvatarBg(idx);
                // Sample realistic grades for presentation
                const sampleGrades = ["9.2", "8.5", "7.8", "8.9", "9.0"];
                const grade = sampleGrades[idx % sampleGrades.length];

                return (
                  <tr key={student.userId || idx}>
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
                      {student.userCode && (
                        <small className="text-muted d-block fw-normal">{student.userCode}</small>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">Student</span>
                    </td>
                    <td>
                      <span className="fw-bold text-dark">{grade}</span>{" "}
                      <small className="text-muted">/ 10</small>
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                        <i className="bi bi-eye" /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td>
                  <div className="ta-avatar-initials" style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}>LA</div>
                </td>
                <td className="fw-semibold text-dark">[FE-Mock] Lê Văn An</td>
                <td>
                  <span className="badge bg-info-subtle text-info-emphasis fw-medium px-2.5 py-1">Student</span>
                </td>
                <td>
                  <span className="fw-bold text-dark">8.5</span>{" "}
                  <small className="text-muted">/ 10</small>
                </td>
                <td className="text-end">
                  <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                    <i className="bi bi-eye" /> View
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
