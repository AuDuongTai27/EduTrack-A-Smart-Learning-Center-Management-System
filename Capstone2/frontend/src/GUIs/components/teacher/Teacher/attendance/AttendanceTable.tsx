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

  // If we have attendances, map them
  const hasData = attendances.length > 0 || students.length > 0;

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
                  <td className="fw-semibold text-dark">
                    {att.studentName}
                    {att.studentCode && (
                      <small className="text-muted d-block fw-normal">{att.studentCode}</small>
                    )}
                  </td>
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
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`late_${idx}`}>
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
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`absent_${idx}`}>
                          Absent
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`excuse_${idx}`}
                          defaultChecked={status === "excuse" || status === "excused"}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`excuse_${idx}`}>
                          Excuse
                        </label>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Enter note..."
                      defaultValue={att.note || ""}
                    />
                  </td>
                </tr>
              );
            })
          ) : students.length > 0 ? (
            students.map((stu, idx) => {
              const radioName = `attendance_stu_${stu.userId || idx}`;
              return (
                <tr key={stu.userId || idx}>
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
                  <td className="fw-semibold text-dark">
                    {stu.fullName}
                    {stu.userCode && (
                      <small className="text-muted d-block fw-normal">{stu.userCode}</small>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`stu_present_${idx}`}
                          defaultChecked={true}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`stu_present_${idx}`}>
                          Present
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`stu_late_${idx}`}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`stu_late_${idx}`}>
                          Late
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`stu_absent_${idx}`}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`stu_absent_${idx}`}>
                          Absent
                        </label>
                      </div>
                      <div className="form-check form-check-inline m-0">
                        <input
                          className="form-check-input"
                          type="radio"
                          name={radioName}
                          id={`stu_excuse_${idx}`}
                        />
                        <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor={`stu_excuse_${idx}`}>
                          Excuse
                        </label>
                      </div>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Enter note..."
                      defaultValue=""
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            /* Fallback Rows */
            <>
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td>
                  <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">LA</div>
                </td>
                <td className="fw-semibold text-dark">[FE-Mock] Lê Văn An</td>
                <td>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="mock_p1" defaultChecked />
                      <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="mock_p1">Present</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="mock_l1" />
                      <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="mock_l1">Late</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="mock_a1" />
                      <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="mock_a1">Absent</label>
                    </div>
                    <div className="form-check form-check-inline m-0">
                      <input className="form-check-input" type="radio" name="att_mock_1" id="mock_e1" />
                      <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="mock_e1">Excuse</label>
                    </div>
                  </div>
                </td>
                <td>
                  <input type="text" className="form-control form-control-sm" placeholder="Enter note..." defaultValue="On time and engaged" />
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
