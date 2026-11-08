import type {ReactNode} from 'react';
import type {ScheduleFilters} from '../../../../../BLL/models/ScheduleSession';

export interface ScheduleListToolbarProps {
  filters: ScheduleFilters; statuses: string[]; onFilter: (key: keyof ScheduleFilters, value: string) => void;
  children?: ReactNode; expanded?: boolean;
}
// Keeps viet's compact, right-aligned day/status/search toolbar in both views.
export default function ScheduleListToolbar({filters, statuses, onFilter, children, expanded}: ScheduleListToolbarProps) {
  const statusLabels: Record<string, string> = {scheduled: 'Đã xếp lịch', completed: 'Đã hoàn thành', cancelled: 'Đã hủy', in_progress: 'Trong giờ học'};
  return <div id="et-schedule-filters" className={'table-toolbar p-3 bg-light border-bottom d-flex align-items-center justify-content-end flex-wrap gap-3 et-schedule-filters' + (expanded ? ' et-filters-expanded' : '')}>
    <label className="d-flex align-items-center gap-1"><span className="small text-muted">Thứ trong tuần:</span>
      <select aria-label="Thứ trong tuần" className="form-select form-select-sm" value={filters.weekday || ''}
        onChange={e => onFilter('weekday', e.target.value)}><option value="">Tất cả các thứ</option>
        {['Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy','Chủ Nhật'].map((day, index) => <option key={index} value={index}>{day}</option>)}
      </select></label>
    <label className="d-flex align-items-center gap-1"><span className="small text-muted">Trạng thái:</span>
      <select aria-label="Status" className="form-select form-select-sm" value={filters.status} onChange={e => onFilter('status', e.target.value)}>
        <option value="">Tất cả trạng thái</option>
        {Array.from(new Set(['scheduled','completed','cancelled',...statuses,...(filters.status ? [filters.status] : [])])).map(value =>
          <option key={value} value={value}>{statusLabels[value] || value}</option>)}
      </select></label>
    <label><span className="visually-hidden">Tìm kiếm</span>
      <input type="search" aria-label="Tìm kiếm" className="form-control form-control-sm table-search-input" id="tableSearchInput"
        placeholder="Tìm tên lớp, môn, phòng học..." value={filters.search} onChange={e => onFilter('search', e.target.value)} /></label>
    {children}
  </div>;
}
