function AttendanceTable() {
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
          {/* Student 1 */}
          <tr>
            <td>
              <div className="form-check m-0">
                <input className="form-check-input row-checkbox" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="ta-avatar-initials avatar-initials-sm avatar-initials-indigo">JD</div>
            </td>
            <td className="fw-semibold text-dark">John Doe</td>
            <td>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_john_doe" id="present_jd" defaultChecked />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="present_jd">Present</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_john_doe" id="late_jd" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="late_jd">Late</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_john_doe" id="absent_jd" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="absent_jd">Absent</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_john_doe" id="excuse_jd" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="excuse_jd">Excuse</label>
                </div>
              </div>
            </td>
            <td>
              <input type="text" className="form-control form-control-sm" placeholder="Enter note..." />
            </td>
          </tr>
          {/* Student 2 */}
          <tr>
            <td>
              <div className="form-check m-0">
                <input className="form-check-input row-checkbox" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="ta-avatar-initials avatar-initials-sm avatar-initials-emerald">AS</div>
            </td>
            <td className="fw-semibold text-dark">Alice Smith</td>
            <td>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_alice_smith" id="present_as" defaultChecked />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="present_as">Present</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_alice_smith" id="late_as" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="late_as">Late</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_alice_smith" id="absent_as" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="absent_as">Absent</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_alice_smith" id="excuse_as" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="excuse_as">Excuse</label>
                </div>
              </div>
            </td>
            <td>
              <input type="text" className="form-control form-control-sm" placeholder="Enter note..." />
            </td>
          </tr>
          {/* Student 3 */}
          <tr>
            <td>
              <div className="form-check m-0">
                <input className="form-check-input row-checkbox" type="checkbox" />
              </div>
            </td>
            <td>
              <div className="ta-avatar-initials avatar-initials-sm avatar-initials-amber">ER</div>
            </td>
            <td className="fw-semibold text-dark">Ethan Roberts</td>
            <td>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_ethan_roberts" id="present_er" defaultChecked />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="present_er">Present</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_ethan_roberts" id="late_er" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="late_er">Late</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_ethan_roberts" id="absent_er" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="absent_er">Absent</label>
                </div>
                <div className="form-check form-check-inline m-0">
                  <input className="form-check-input" type="radio" name="attendance_ethan_roberts" id="excuse_er" />
                  <label className="form-check-label text-dark fw-medium cursor-pointer" htmlFor="excuse_er">Excuse</label>
                </div>
              </div>
            </td>
            <td>
              <input type="text" className="form-control form-control-sm" placeholder="Enter note..." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
export default AttendanceTable;
