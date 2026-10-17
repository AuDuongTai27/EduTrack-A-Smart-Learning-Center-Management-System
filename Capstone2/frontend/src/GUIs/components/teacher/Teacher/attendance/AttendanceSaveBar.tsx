function AttendanceSaveBar() {
  return (
    <div className="p-3 border-top bg-white d-flex align-items-center justify-content-end gap-2 rounded-bottom">
      <a href="/teacher/class-details" className="btn btn-outline-secondary btn-sm">
        Cancel
      </a>
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
