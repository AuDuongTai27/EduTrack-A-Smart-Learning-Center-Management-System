import type { ApprovalRequestDto } from "../../../../../BLL/models/ApprovalRequestDto";

export interface RequestTableProps {
  requests?: ApprovalRequestDto[];
}

export default function RequestTable({ requests = [] }: RequestTableProps) {
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "approved") {
      return (
        <span className="badge-status badge-status-active">
          <i className="bi bi-check-circle-fill me-1" /> Approved
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span className="badge-status badge-status-inactive">
          <i className="bi bi-x-circle-fill me-1" /> Rejected
        </span>
      );
    }
    return (
      <span className="badge-status badge-status-pending">
        <i className="bi bi-hourglass-split me-1" /> Pending
      </span>
    );
  };

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
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllRequests"
                  />
                </div>
              </th>
              <th>Request ID <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Request Type <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Description <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Created Date <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Status <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((r, idx) => (
                <tr key={r.requestId || idx}>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">#{r.requestId || `REQ${idx + 1}`}</span>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                      {r.requestType}
                    </span>
                  </td>
                  <td>
                    <span className="text-dark small">{r.description}</span>
                  </td>
                  <td>
                    <span className="text-muted small">
                      <i className="bi bi-calendar-event me-1" />
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "10 Aug 2026"}
                    </span>
                  </td>
                  <td>{getStatusBadge(r.status)}</td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <>
                {/* Fallback Request 1 */}
                <tr>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">#REQ-001</span>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                      Teaching Material
                    </span>
                  </td>
                  <td>
                    <span className="text-dark small">[FE-Mock] Request supplementary materials for Class I-A Physics</span>
                  </td>
                  <td>
                    <span className="text-muted small">
                      <i className="bi bi-calendar-event me-1" />
                      08 Aug 2026
                    </span>
                  </td>
                  <td>{getStatusBadge("Approved")}</td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
                {/* Fallback Request 2 */}
                <tr>
                  <td>
                    <div className="form-check m-0">
                      <input className="form-check-input row-checkbox" type="checkbox" />
                    </div>
                  </td>
                  <td>
                    <span className="fw-bold text-dark">#REQ-002</span>
                  </td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill">
                      Leave Absence
                    </span>
                  </td>
                  <td>
                    <span className="text-dark small">[FE-Mock] Request half-day leave for academic symposium</span>
                  </td>
                  <td>
                    <span className="text-muted small">
                      <i className="bi bi-calendar-event me-1" />
                      12 Aug 2026
                    </span>
                  </td>
                  <td>{getStatusBadge("Pending")}</td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1">
                      <i className="bi bi-eye" /> View
                    </button>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
