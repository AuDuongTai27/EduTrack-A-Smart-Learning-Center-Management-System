interface TableToolbarProps {
  totalItems: number;
  totalLabel: string;
  entriesPerPage: number;
  onEntriesPerPageChange: (value: number) => void;
}

export default function TableToolbar({
  totalItems,
  totalLabel,
  entriesPerPage,
  onEntriesPerPageChange,
}: TableToolbarProps) {
  return (
    <div className="user-table-toolbar d-flex align-items-center justify-content-between flex-wrap gap-3">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">Show</span>

        <select
          className="form-select form-select-sm user-page-size"
          value={entriesPerPage}
          onChange={(e) => onEntriesPerPageChange(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <span className="text-muted">entries</span>
      </div>

      <span className="text-muted small">
        {totalLabel}: <strong className="text-dark">{totalItems}</strong>
      </span>
    </div>
  );
}
