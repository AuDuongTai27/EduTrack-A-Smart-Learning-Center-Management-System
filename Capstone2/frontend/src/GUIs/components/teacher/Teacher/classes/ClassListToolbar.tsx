export default function ClassListToolbar() {
  return (
    <div className="table-toolbar">
      <div className="table-entries-select">
        <span>Row Per Page</span>
        <select className="form-select form-select-sm" id="entriesSelect" defaultValue="10">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
        <span>Entries</span>
      </div>
      <div>
        <input
          type="search"
          className="table-search-input"
          id="tableSearchInput"
          placeholder="Search..."
        />
      </div>
    </div>
  );
}
