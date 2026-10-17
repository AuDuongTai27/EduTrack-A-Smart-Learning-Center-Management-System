export default function ProgressPagination() {
  return (
    <div className="table-pagination-footer">
      <button type="button" className="pagination-text-btn" id="prevPageBtn">
        Prev
      </button>
      <div
        id="paginationContainer"
        className="d-inline-flex align-items-center gap-1"
      >
        <span className="pagination-num-btn">1</span>
      </div>
      <button type="button" className="pagination-text-btn" id="nextPageBtn">
        Next
      </button>
    </div>
  );
}
