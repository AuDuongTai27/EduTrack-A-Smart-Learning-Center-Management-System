interface TableToolbarProps {
  totalItems: number;
  totalLabel: string;
  entriesPerPage?: number;
  onEntriesPerPageChange?: (value: number) => void;
}

export default function TableToolbar({
  totalItems,
  totalLabel,
}: TableToolbarProps) {
  return (
    <div className="user-table-toolbar d-flex align-items-center justify-content-end flex-wrap gap-3">
      <span className="text-muted small">
        {totalLabel}: <strong className="text-dark">{totalItems}</strong>
      </span>
    </div>
  );
}
