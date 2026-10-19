import { Link } from "react-router-dom";

function AttendanceSaveBar() {
  return (
    <div className="p-3 border-top bg-white d-flex align-items-center justify-content-end gap-2 rounded-bottom">
      <Link
        to="/teaching-assistant/classes/class-1-a"
        className="btn btn-outline-secondary btn-sm"
      >
        Cancel
      </Link>
      <button
        type="button"
        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
      >
        <i className="bi bi-check-lg" /> Save Attendance
      </button>
    </div>
  );
}

export default AttendanceSaveBar;
