export default function LearningProgressHeader() {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div>
        <h4 className="class-list-title mb-1">Student Progress List</h4>
        <small className="text-muted">Track attendance and assignment status by class</small>
      </div>
      <div className="d-flex align-items-center gap-3 flex-wrap">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="filterClassSelect" className="form-label mb-0 small fw-bold text-nowrap">
            Select Class:
          </label>
          <select
            className="form-select form-select-sm"
            id="filterClassSelect"
            style={{ minWidth: 150 }}
            defaultValue="Class I-A"
          >
            <option value="Class I-A">Class I-A</option>
            <option value="Class I-B">Class I-B</option>
            <option value="Class II-C">Class II-C</option>
            <option value="Class V-B">Class V-B</option>
          </select>
        </div>
      </div>
    </div>
  );
}
