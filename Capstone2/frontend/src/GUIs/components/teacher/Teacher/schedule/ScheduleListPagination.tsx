import {PaginationNavGroup} from '../../CommonPaginationUtils';
export interface ScheduleListPaginationProps {
  totalItems?: number; currentPage?: number; rowsPerPage?: number; onPageChange?: (page: number) => void; itemLabel?: string;
}
export default function ScheduleListPagination({totalItems = 0, currentPage = 1, rowsPerPage = 10, onPageChange, itemLabel = 'ca học'}: ScheduleListPaginationProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const page = Math.max(1, Math.min(currentPage, totalPages));
  return <div className="table-pagination-footer d-flex align-items-center justify-content-between p-3 border-top flex-wrap gap-2 et-schedule-pagination">
    <span className="small text-muted">Hiển thị {totalItems} {itemLabel}</span>
    <div className="d-flex align-items-center gap-2">
      <button type="button" className="pagination-text-btn" id="prevPageBtn" disabled={page <= 1}
        style={{opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer'}}
        onClick={() => onPageChange?.(page - 1)}>Prev</button>
      <div id="paginationContainer" className="d-inline-flex align-items-center gap-1">
        <PaginationNavGroup currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
      <button type="button" className="pagination-text-btn" id="nextPageBtn" disabled={page >= totalPages}
        style={{opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer'}}
        onClick={() => onPageChange?.(page + 1)}>Next</button>
      <span className="visually-hidden" aria-live="polite">Trang {page}/{totalPages}</span>
    </div>
  </div>;
}
