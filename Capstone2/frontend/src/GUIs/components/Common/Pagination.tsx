interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <nav>
      <ul className="pagination pagination-sm mb-0">
        {/* Previous */}
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

        {/* Pages */}
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

        {/* Next */}
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
  );
}
