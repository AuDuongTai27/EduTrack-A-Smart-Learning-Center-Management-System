export default function RequestTable() {
  return (
    <>
      {/* Toolbar */}
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
            placeholder="Search requests..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive-container">
        <table className="table custom-table align-middle" id="requestsTable">
          <thead>
            <tr>
              <th className="th-checkbox">
                <div className="form-check m-0">
                  <input className="form-check-input" type="checkbox" id="selectAllRequests" />
                </div>
              </th>
              <th>Request ID <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Title <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Sent Date &amp; Time{" "}<i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Status <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="requestTableBody">
            <tr>
              <td>
                <div className="form-check m-0">
                  <input className="form-check-input row-checkbox" type="checkbox" defaultValue="#4" />
                </div>
              </td>
              <td><a href="#" className="class-id-link">#4</a></td>
              <td>
                <a href="#" className="text-dark fw-semibold text-decoration-none">
                  Schedule Change Request for Physics Class I-A
                </a>
              </td>
              <td className="text-muted small">16 Aug 2026, 15:45</td>
              <td>
                <span className="badge-status badge-status-pending">
                  <i className="bi bi-hourglass-split" /> Pending
                </span>
              </td>
              <td>
                <div className="d-flex align-items-center gap-1">
                  <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1">
                    <i className="bi bi-trash" /> Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="form-check m-0">
                  <input className="form-check-input row-checkbox" type="checkbox" defaultValue="#3" />
                </div>
              </td>
              <td><a href="#" className="class-id-link">#3</a></td>
              <td>
                <a href="#" className="text-dark fw-semibold text-decoration-none">
                  Additional Teaching Materials Request for English Class II-C
                </a>
              </td>
              <td className="text-muted small">15 Aug 2026, 09:30</td>
              <td>
                <span className="badge-status badge-status-pending">
                  <i className="bi bi-hourglass-split" /> Pending
                </span>
              </td>
              <td>
                <div className="d-flex align-items-center gap-1">
                  <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1">
                    <i className="bi bi-trash" /> Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="form-check m-0">
                  <input className="form-check-input row-checkbox" type="checkbox" defaultValue="#2" />
                </div>
              </td>
              <td><a href="#" className="class-id-link">#2</a></td>
              <td>
                <a href="#" className="text-dark fw-semibold text-decoration-none">
                  Assistant Teacher Allocation for Mathematics Class IV
                </a>
              </td>
              <td className="text-muted small">10 Aug 2026, 14:15</td>
              <td>
                <span className="badge-status badge-status-active">
                  <i className="bi bi-check-circle-fill" /> Approved
                </span>
              </td>
              <td>
                <div className="d-flex align-items-center gap-1">
                  <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" disabled title="Cannot edit a processed request">
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" disabled title="Cannot delete a processed request">
                    <i className="bi bi-trash" /> Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="form-check m-0">
                  <input className="form-check-input row-checkbox" type="checkbox" defaultValue="#1" />
                </div>
              </td>
              <td><a href="#" className="class-id-link">#1</a></td>
              <td>
                <a href="#" className="text-dark fw-semibold text-decoration-none">
                  Leave Request for 2 Days (August 5 - 6)
                </a>
              </td>
              <td className="text-muted small">02 Aug 2026, 08:00</td>
              <td>
                <span className="badge-status badge-status-inactive">
                  <i className="bi bi-x-circle-fill" /> Rejected
                </span>
              </td>
              <td>
                <div className="d-flex align-items-center gap-1">
                  <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" disabled title="Cannot edit a processed request">
                    <i className="bi bi-pencil" /> Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1" disabled title="Cannot delete a processed request">
                    <i className="bi bi-trash" /> Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
