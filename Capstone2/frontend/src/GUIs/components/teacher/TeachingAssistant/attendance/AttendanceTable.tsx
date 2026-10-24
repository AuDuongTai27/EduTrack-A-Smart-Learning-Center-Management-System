import type { AttendanceDto } from "../../../../../BLL/models/ProgressDto";
import type { UserDto } from "../../../../../BLL/models/UserDto";

export interface AttendanceTableProps {
  attendances?: AttendanceDto[];
  students?: UserDto[];
}

function AttendanceTable({ attendances = [], students = [] }: AttendanceTableProps) {
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

  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle" id="attendanceTable">
        <thead>
          <tr>
            <th className="th-checkbox">
              <div className="form-check m-0">
                <input className="form-check-input" type="checkbox" id="selectAll" />
              </div>
            </th>
            <th>Avatar</th>
            <th>Student Name</th>
            <th>Attendance</th>
            <th className="th-note">Note</th>
          </tr>
        </thead>
        <tbody>
          {attendances.length > 0 ? (
            attendances.map((att, idx) => {
              const radioName = `attendance_${att.studentId || idx}`;
              const status = att.status?.toLowerCase() || "present";
              return (
                <tr key={att.attendanceId || idx}>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                      {getInitials(att.studentName)}
                    </div>
                  </td>
                  <td className="fw-semibold text-dark">{att.studentName || `Học viên #${att.studentId}`}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`present_${idx}`}
                          defaultChecked={status === "present"}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`present_${idx}`}>
                          Present
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`late_${idx}`}
                          defaultChecked={status === "late"}
                        />
                        <label className="form-check-label text-warning-emphasis fw-medium cursor-pointer" htmlFor={`late_${idx}`}>
                          Late
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`absent_${idx}`}
                          defaultChecked={status === "absent"}
                        />
                        <label className="form-check-label text-danger fw-medium cursor-pointer" htmlFor={`absent_${idx}`}>
                          Absent
                        </label>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm table-note-input"
                      placeholder="Add note..."
                      defaultValue={att.note || ""}
                    />
                  </td>
                </tr>
              );
            })
          ) : students.length > 0 ? (
            students.map((stu, idx) => {
              const radioName = `attendance_stu_${stu.userId}`;
              return (
                <tr key={stu.userId}>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <div className={`ta-avatar-initials avatar-initials-sm ${getAvatarClass(idx)}`}>
                      {getInitials(stu.fullName)}
                    </div>
                  </td>
                  <td className="fw-semibold text-dark">{stu.fullName}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`present_s_${idx}`}
                          defaultChecked={idx !== 2}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`present_s_${idx}`}>
                          Present
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`late_s_${idx}`}
                          defaultChecked={idx === 2}
                        />
                        <label className="form-check-label text-warning-emphasis fw-medium cursor-pointer" htmlFor={`late_s_${idx}`}>
                          Late
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`absent_s_${idx}`}
                        />
                        <label className="form-check-label text-danger fw-medium cursor-pointer" htmlFor={`absent_s_${idx}`}>
                          Absent
                        </label>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm table-note-input"
                      placeholder="Add note..."
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            <>
              {/* Fallback Student 1 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td>
                  <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">EM</div>
                </td>
                <td className="fw-semibold text-dark">[FE-Mock] Ethan Miller</td>
                <td>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="p1" defaultChecked />
                      <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="p1">Present</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="l1" />
                      <label className="form-check-label text-warning-emphasis fw-medium cursor-pointer" htmlFor="l1">Late</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="a1" />
                      <label className="form-check-label text-danger fw-medium cursor-pointer" htmlFor="a1">Absent</label>
                    </div>
                  </div>
                </td>
                <td>
                  <input type="text" className="form-control form-control-sm table-note-input" placeholder="Add note..." />
                </td>
              </tr>
              {/* Fallback Student 2 */}
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td>
                  <div className="ta-avatar-initials avatar-initials-sm avatar-initials-emerald">SL</div>
                </td>
                <td className="fw-semibold text-dark">[FE-Mock] Sophia Lee</td>
                <td>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_2" id="p2" defaultChecked />
                      <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="p2">Present</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_2" id="l2" />
                      <label className="form-check-label text-warning-emphasis fw-medium cursor-pointer" htmlFor="l2">Late</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_2" id="a2" />
                      <label className="form-check-label text-danger fw-medium cursor-pointer" htmlFor="a2">Absent</label>
                    </div>
                  </div>
                </td>
                <td>
                  <input type="text" className="form-control form-control-sm table-note-input" placeholder="Add note..." />
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AttendanceTable;
