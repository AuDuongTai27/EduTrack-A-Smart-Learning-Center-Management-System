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
                  <input className="form-check-input" type="checkbox" id="selectAllRequests" />
                </div>
              </th>
              <th>Request ID <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Title <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Sent Date &amp; Time <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Status <i className="bi bi-arrow-down-up table-sort-icon" /></th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="requestTableBody">
            {requests.length > 0 ? (
              requests.map((req, idx) => {
                const dateStr = req.createdAt
                  ? new Date(req.createdAt).toLocaleString()
                  : "16 Aug 2026, 15:45";
                const isPending = req.status.toLowerCase() === "pending";

                return (
                  <tr key={req.requestId || idx}>
                    <td>
                      <div className="form-check m-0">
                        <input className="form-check-input row-checkbox" type="checkbox" />
                      </div>
                    </td>
                    <td>
                      <a href="#" className="class-id-link fw-bold">
                        {req.requestCode || `#${req.requestId}`}
                      </a>
                    </td>
                    <td>
                      <span className="text-dark fw-semibold">
                        {req.title || req.description || "Yêu cầu từ giáo viên"}
                      </span>
                      {req.className && (
                        <small className="text-muted d-block">{req.className}</small>
                      )}
                    </td>
                    <td className="text-muted small">{dateStr}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          disabled={!isPending}
                        >
                          <i className="bi bi-pencil" /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                          disabled={!isPending}
                        >
                          <i className="bi bi-trash" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Fallback Mock Rows */
              <tr>
                <td>
                  <div className="form-check m-0">
                    <input className="form-check-input row-checkbox" type="checkbox" />
                  </div>
                </td>
                <td><a href="#" className="class-id-link">#AR0001</a></td>
                <td>
                  <span className="text-dark fw-semibold">
                    Schedule Change Request for Physics Class I-A
                  </span>
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
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
