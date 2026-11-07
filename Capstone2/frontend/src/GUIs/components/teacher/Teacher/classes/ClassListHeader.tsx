export default function ClassListHeader() {
  return (
    <div className="class-list-header d-flex align-items-center justify-content-between flex-wrap gap-3">
      <h4 className="class-list-title mb-0">Classes List</h4>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        <button type="button" className="btn-header-action" id="dateRangeBtn">
          <i className="bi bi-calendar3" />
          <span id="dateRangeText">08/09/2026 - 08/15/2026</span>
          <i className="bi bi-chevron-down ms-1" />
        </button>
      </div>
    </div>
  );
}
