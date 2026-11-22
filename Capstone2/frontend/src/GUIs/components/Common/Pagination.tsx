import { PaginationNavGroup } from "./CommonPaginationUtils";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  entriesPerPage: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  showSummary?: boolean;
}

export default function Pagination({
  currentPage,
  totalItems,
  entriesPerPage,
  itemLabel,
  onPageChange,
  showSummary = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / entriesPerPage));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  return (
    <div
      className={`user-table-footer d-flex align-items-center ${
        showSummary ? "justify-content-between" : "justify-content-end"
      } flex-wrap gap-3`}
    >
      {showSummary && (
        <span className="text-muted small">
          {totalItems === 0
            ? `Showing 0 ${itemLabel}`
            : `Showing ${(safePage - 1) * entriesPerPage + 1} to ${Math.min(
                safePage * entriesPerPage,
                totalItems
              )} of ${totalItems} ${itemLabel}`}
        </span>
      )}

      <nav aria-label="Pagination">
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="pagination-text-btn"
            disabled={safePage <= 1}
            style={{
              opacity: safePage <= 1 ? 0.5 : 1,
              cursor: safePage <= 1 ? "not-allowed" : "pointer",
            }}
            onClick={() => onPageChange(safePage - 1)}
          >
            Prev
          </button>

          <div className="d-inline-flex align-items-center gap-1">
            <PaginationNavGroup
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>

          <button
            type="button"
            className="pagination-text-btn"
            disabled={safePage >= totalPages}
            style={{
              opacity: safePage >= totalPages ? 0.5 : 1,
              cursor: safePage >= totalPages ? "not-allowed" : "pointer",
            }}
            onClick={() => onPageChange(safePage + 1)}
          >
            Next
          </button>
        </div>
      </nav>
    </div>
  );
}
