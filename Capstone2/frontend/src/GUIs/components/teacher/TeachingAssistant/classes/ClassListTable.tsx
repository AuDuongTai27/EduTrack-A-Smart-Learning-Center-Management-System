import { Link } from "react-router-dom";

export default function ClassListTable() {
  return (
    <div className="table-responsive-container">
      <table className="table custom-table align-middle" id="classesTable">
        <thead>
          <tr>
            <th className="th-checkbox">
              <div className="form-check m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="selectAllClasses"
                />
              </div>
            </th>
            <th>
              Class Name <i className="bi bi-arrow-down-up table-sort-icon" />
            </th>
            <th>
              Subject <i className="bi bi-arrow-down-up table-sort-icon" />
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
            <td>Class I-A</td>
            <td>Physics</td>
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
              <Link
                to="/teaching-assistant/classes/class-1-a"
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
              >
                <i className="bi bi-eye" /> View
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
