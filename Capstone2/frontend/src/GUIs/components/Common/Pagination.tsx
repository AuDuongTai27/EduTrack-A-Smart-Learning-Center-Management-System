interface PaginationProps {
  currentPage: number;
  totalItems: number;
  entriesPerPage: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  entriesPerPage,
  itemLabel,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / entriesPerPage);

  return (
    <div className="user-table-footer d-flex align-items-center justify-content-between flex-wrap gap-3">
      <span className="text-muted small">
        Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
        {Math.min(currentPage * entriesPerPage, totalItems)} of {totalItems}{" "}
        {itemLabel}
      </span>

      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left" />
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <li
                key={page}
                className={`page-item ${currentPage === page ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  type="button"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            );
          })}

          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
