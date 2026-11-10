import type {ReactNode} from 'react';
import type {ScheduleFilters} from '../../../../../BLL/models/ScheduleSession';

export interface ScheduleListToolbarProps {
  filters: ScheduleFilters;
  statuses?: string[];
  classOptions?: [string, string][];
  onFilter: (key: keyof ScheduleFilters, value: string) => void;
  onClear?: () => void;
  children?: ReactNode;
  expanded?: boolean;
}

// Global Schedule Toolbar: Only keeps Class filter for all roles
export default function ScheduleListToolbar({
  filters,
  classOptions = [],
  onFilter,
  onClear,
  children,
  expanded,
}: ScheduleListToolbarProps) {
  return (
    <div
      id="et-schedule-filters"
      className={
        'table-toolbar p-3 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 et-schedule-filters' +
        (expanded ? ' et-filters-expanded' : '')
      }
    >
      <div className="d-flex align-items-center flex-wrap gap-2">
        <label className="d-flex align-items-center gap-2 mb-0">
          <i className="bi bi-funnel-fill text-primary" />
          <span className="small fw-semibold text-secondary">Lọc theo Lớp học:</span>
          <select
            aria-label="Lọc theo Lớp học"
            className="form-select form-select-sm"
            style={{ minWidth: 220, width: 'auto' }}
            value={filters.classId || ''}
            onChange={(e) => onFilter('classId', e.target.value)}
          >
            <option value="">Tất cả các lớp ({classOptions.length})</option>
            {classOptions.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {filters.classId && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
            onClick={() => {
              onFilter('classId', '');
              onClear?.();
            }}
          >
            <i className="bi bi-x-circle" /> Xem tất cả lớp
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
