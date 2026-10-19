export default function ScheduleTable() {
  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle" id="scheduleTable">
        <thead>
          <tr>
            <th className="th-checkbox">
              <div className="form-check m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAllSchedule"
                />
              </div>
            </th>
            <th>
              Class <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Subject <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Location <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Date <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Start Time <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              End Time <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Students <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Teacher{" "}
              <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Status <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr data-class="Class I" data-status="Active">
            <td>
              <div className="form-check m-0">
                <input
                  className="form-check-input row-checkbox"
                  type="checkbox"
                />
              </div>
            </td>
            <td>
              <a href="#" className="class-id-link">
                Class I-A
              </a>
            </td>
            <td>Physics</td>
            <td>Room 101</td>
            <td>16 Aug 2026</td>
            <td>08:00 AM</td>
            <td>09:30 AM</td>
            <td>30</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/img/profiles/avatar-02.jpg"
                  className="ta-avatar-img"
                  alt="Dr. Alex Morgan"
                />
                <span>Dr. Alex Morgan</span>
              </div>
            </td>
            <td>
              <span className="badge-status badge-status-active">Active</span>
            </td>
            <td>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-eye" /> View
              </button>
            </td>
          </tr>
          <tr data-class="Class I" data-status="Active">
            <td>
              <div className="form-check m-0">
                <input
                  className="form-check-input row-checkbox"
                  type="checkbox"
                />
              </div>
            </td>
            <td>
              <a href="#" className="class-id-link">
                Class I-A
              </a>
            </td>
            <td>Physics</td>
            <td>Lab 2</td>
            <td>16 Aug 2026</td>
            <td>10:00 AM</td>
            <td>11:30 AM</td>
            <td>30</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <span className="ta-avatar-initials bg-primary-subtle text-primary">
                  MR
                </span>
                <span>Michael Reed</span>
              </div>
            </td>
            <td>
              <span className="badge-status badge-status-active">Active</span>
            </td>
            <td>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-eye" /> View
              </button>
            </td>
          </tr>
          <tr data-class="Class I" data-status="Active">
            <td>
              <div className="form-check m-0">
                <input
                  className="form-check-input row-checkbox"
                  type="checkbox"
                />
              </div>
            </td>
            <td>
              <a href="#" className="class-id-link">
                Class I-A
              </a>
            </td>
            <td>Physics</td>
            <td>Room 101</td>
            <td>16 Aug 2026</td>
            <td>01:00 PM</td>
            <td>02:30 PM</td>
            <td>30</td>
            <td>
              <span className="text-muted small fst-italic">Unassigned</span>
            </td>
            <td>
              <span className="badge-status badge-status-active">Active</span>
            </td>
            <td>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-eye" /> View
              </button>
            </td>
          </tr>
          <tr data-class="Class I" data-status="Active">
            <td>
              <div className="form-check m-0">
                <input
                  className="form-check-input row-checkbox"
                  type="checkbox"
                />
              </div>
            </td>
            <td>
              <a href="#" className="class-id-link">
                Class I-A
              </a>
            </td>
            <td>Physics</td>
            <td>Lab 2</td>
            <td>16 Aug 2026</td>
            <td>03:00 PM</td>
            <td>04:30 PM</td>
            <td>30</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <img
                  src="/assets/img/profiles/avatar-02.jpg"
                  className="ta-avatar-img"
                  alt="Dr. Alex Morgan"
                />
                <span>Dr. Alex Morgan</span>
              </div>
            </td>
            <td>
              <span className="badge-status badge-status-active">Active</span>
            </td>
            <td>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-eye" /> View
              </button>
            </td>
          </tr>
          <tr data-class="Class I" data-status="Inactive">
            <td>
              <div className="form-check m-0">
                <input
                  className="form-check-input row-checkbox"
                  type="checkbox"
                />
              </div>
            </td>
            <td>
              <a href="#" className="class-id-link">
                Class I-A
              </a>
            </td>
            <td>Physics</td>
            <td>Room 101</td>
            <td>16 Aug 2026</td>
            <td>05:00 PM</td>
            <td>06:30 PM</td>
            <td>30</td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <span className="ta-avatar-initials bg-success-subtle text-success">
                  EL
                </span>
                <span>Emily Lawson</span>
              </div>
            </td>
            <td>
              <span className="badge-status badge-status-inactive">
                Inactive
              </span>
            </td>
            <td>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-eye" /> View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
