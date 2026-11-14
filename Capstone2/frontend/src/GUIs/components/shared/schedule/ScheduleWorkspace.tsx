import {useEffect, useMemo, useState, type FormEvent, type ReactNode} from 'react';
import type {ScheduleRole} from '../../../../BLL/models/ScheduleSession';
import {addScheduleDays, buildSemesterWeeks, displayScheduleDate, mondayOf, vietnamClock} from '../../../../BLL/services/scheduleViewService';
import {scheduleManagementDAL} from '../../../../DAL/scheduleManagementDAL';
import {useScheduleReadModel} from './useScheduleReadModel';
import {ScheduleCalendar} from './ScheduleCalendar';
import {ScheduleList} from './ScheduleList';
import {ScheduleSessionDetail} from './ScheduleSessionDetail';
import {ScheduleManagement} from './ScheduleManagement';
import ScheduleListHeader from '../../teacher/Teacher/schedule/ScheduleListHeader';
import TaListHeader from '../../teacher/TeachingAssistant/schedule/ScheduleListHeader';
import ScheduleListToolbar from '../../teacher/Teacher/schedule/ScheduleListToolbar';
import '../../../../assets/css/schedule-calendar.css';
import './schedule.css';

export function ScheduleWorkspace({
  role = 'student',
  userId,
  lockedClassId,
  defaultRoom,
  onSessionMutated,
  renderHeader,
}: {
  role?: ScheduleRole;
  userId?: number;
  lockedClassId?: number;
  defaultRoom?: string | null;
  onSessionMutated?: () => void;
  renderHeader?: (actions: ReactNode) => ReactNode;
}) {
  const model = useScheduleReadModel(role, userId, lockedClassId);
  const refreshSchedule = model.retry;
  useEffect(() => {const refresh = () => refreshSchedule(); window.addEventListener('edutrack:schedule-applied', refresh);
    return () => window.removeEventListener('edutrack:schedule-applied', refresh);}, [refreshSchedule]);
  const [expanded, setExpanded] = useState(false);
  const [managementModalOpen, setManagementModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newDate, setNewDate] = useState(() => vietnamClock().date);
  const [newStart, setNewStart] = useState('18:00');
  const [newEnd, setNewEnd] = useState('20:00');
  const [newRoom, setNewRoom] = useState(defaultRoom || '');
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState('');
  const [addNotice, setAddNotice] = useState('');

  async function handleCreateDirectSession(e: FormEvent) {
    e.preventDefault();
    if (!lockedClassId || addBusy) return;
    if (!newDate || !newStart || !newEnd || newStart >= newEnd) {
      setAddError('Please select a date and ensure the start time is before the end time.');
      return;
    }
    setAddBusy(true);
    setAddError('');
    setAddNotice('');
    try {
      const created = await scheduleManagementDAL.createSessionDirect({
        classId: lockedClassId,
        sessionDate: newDate,
        startTime: newStart,
        endTime: newEnd,
        room: newRoom.trim() || null,
      });
      setAddNotice(`Added session #${created.sessionId} on ${displayScheduleDate(created.sessionDate)} (${created.startTime.slice(0, 5)}–${created.endTime.slice(0, 5)}).`);
      model.navigate(mondayOf(created.sessionDate));
      model.retry();
      onSessionMutated?.();
      setTimeout(() => {
        setAddModalOpen(false);
        setAddNotice('');
      }, 1200);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Cannot create new session.');
    } finally {
      setAddBusy(false);
    }
  }
  const todayDate = vietnamClock(model.now).date;
  const currentMonday = mondayOf(todayDate);

  const weeks = useMemo(() => {
    if (!model.classesLoaded || model.classes.length === 0) {
      return [{
        monday: model.monday,
        weekNumber: 1,
        label: `[Week 1] ${displayScheduleDate(model.monday)} - ${displayScheduleDate(addScheduleDays(model.monday, 6))}`,
      }];
    }
    return buildSemesterWeeks(model.classes, model.filters.classId, todayDate);
  }, [model.classesLoaded, model.classes, model.monday, model.filters.classId, todayDate]);

  const classOptions = useMemo<[string, string][]>(() => {
    if (model.classesLoaded) {
      return [...model.classes]
        .sort((a, b) => a.className.localeCompare(b.className, 'vi', {numeric: true}))
        .map((c) => [String(c.classId), c.className]);
    }
    const pairs = model.sessions.map((s) => [String(s.classId), s.className] as [string, string]);
    return Array.from(new Map(pairs)).sort((a, b) => a[1].localeCompare(b[1], 'vi', {numeric: true}));
  }, [model.classesLoaded, model.classes, model.sessions]);

  const displayedSessions = model.filtered;

  function handleClassFilter(key: keyof typeof model.filters, value: string) {
    model.updateFilter(key, value);
    if (key === 'classId' && model.classesLoaded) {
      const nextWeeks = buildSemesterWeeks(model.classes, value, todayDate);
      if (nextWeeks.length > 0 && !nextWeeks.some((w) => w.monday === model.monday)) {
        if (nextWeeks.some((w) => w.monday === currentMonday)) {
          model.navigate(currentMonday);
        } else {
          model.navigate(nextWeeks[0].monday);
        }
      }
    }
  }

  function handleToday() {
    model.navigate(currentMonday);
  }

  const range = displayScheduleDate(model.monday) + ' – ' + displayScheduleDate(addScheduleDays(model.monday, 6));
  const weekControls = (
    <div className="week-navigator-controls d-flex align-items-center flex-wrap gap-2">
      <button type="button" className="btn-week-today" id="btnWeekToday" onClick={handleToday}>
        Today
      </button>
      <select
        id="scheduleWeekSelect"
        aria-label="Select week"
        className="form-select form-select-sm schedule-week-select"
        value={weeks.some((w) => w.monday === model.monday) ? model.monday : ''}
        disabled={weeks.length === 0}
        onChange={(e) => {
          if (e.target.value) model.navigate(e.target.value);
        }}
      >
        {weeks.length === 0 ? (
          <option value="">No weeks available</option>
        ) : (
          weeks.map((w) => (
            <option key={w.monday} value={w.monday}>
              {w.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
  const toolbar = (
    <ScheduleListToolbar
      filters={model.filters}
      classOptions={classOptions}
      onFilter={handleClassFilter}
      onClear={model.clear}
      expanded={expanded}
    >
      {weekControls}
    </ScheduleListToolbar>
  );
  const ListHeader = role === 'teaching-assistant' ? TaListHeader : ScheduleListHeader;
  return <>
    {renderHeader?.(null)}
    <section className="et-schedule schedule-official" aria-label="Official session schedule">
      {['center-manager','admin-staff'].includes(role) && <div className="d-flex flex-wrap gap-2 mb-3">
        {lockedClassId && (
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-1 shadow-sm"
            onClick={() => {
              setAddModalOpen(true);
              setAddError('');
              setAddNotice('');
            }}
          >
            <i className="bi bi-calendar-plus" />
            Add Session / Makeup Session
          </button>
        )}
        <button
          type="button"
          className="btn btn-outline-primary d-inline-flex align-items-center gap-1"
          onClick={() => setManagementModalOpen(true)}
        >
          <i className="bi bi-gear-wide-connected" />
          Manage Recurring Schedule &amp; Generate Monthly Schedule
        </button>
      </div>}

      {/* MODAL 1: ADD DIRECT SESSION / MAKEUP SESSION */}
      {addModalOpen && ['center-manager','admin-staff'].includes(role) && lockedClassId && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-calendar-plus text-primary" />
                  Add New Session / Makeup Session
                </h5>
                <button type="button" className="btn-close" onClick={() => setAddModalOpen(false)} />
              </div>
              <form onSubmit={handleCreateDirectSession}>
                <div className="modal-body p-4">
                  <p className="small text-muted mb-3">
                    The created session will appear immediately on the Class schedule and automatically update in the Attendance session list for Teachers &amp; Teaching Assistants.
                  </p>
                  {addError && <div className="alert alert-danger py-2 small" role="alert">{addError}</div>}
                  {addNotice && <div className="alert alert-success py-2 small" role="status">{addNotice}</div>}
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold mb-1">Session date (any date)</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        disabled={addBusy}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold mb-1">Start time</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={newStart}
                        onChange={(e) => setNewStart(e.target.value)}
                        disabled={addBusy}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold mb-1">End time</label>
                      <input
                        type="time"
                        className="form-control"
                        required
                        value={newEnd}
                        onChange={(e) => setNewEnd(e.target.value)}
                        disabled={addBusy}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold mb-1">Room (optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        maxLength={50}
                        placeholder="e.g. Room 201"
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                        disabled={addBusy}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setAddModalOpen(false)}
                    disabled={addBusy}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4" disabled={addBusy}>
                    {addBusy ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1" />
                        Create Session
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RECURRING SCHEDULE MANAGEMENT & MONTHLY GENERATION */}
      {managementModalOpen && ['center-manager','admin-staff'].includes(role) && (
        <ScheduleManagement
          initialClassId={lockedClassId}
          onClose={() => setManagementModalOpen(false)}
          onCreated={() => {
            model.retry();
            onSessionMutated?.();
          }}
        />
      )}
      <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-4 border shadow-sm et-schedule-summary">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-calendar-week me-1" />{model.view === 'calendar' ? 'Weekly Schedule' : range}</span>
          <span className="small text-muted">Total <strong>{displayedSessions.length}</strong> scheduled sessions</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm" role="group" aria-label="View mode">
            <button type="button" className={'btn ' + (model.view === 'calendar' ? 'btn-primary' : 'btn-outline-secondary')}
              aria-pressed={model.view === 'calendar'} onClick={() => model.setView('calendar')} title="Calendar" aria-label="Calendar">
              <i className="bi bi-calendar3" /><span className="visually-hidden">Calendar</span></button>
            <button type="button" className={'btn ' + (model.view === 'list' ? 'btn-primary' : 'btn-outline-secondary')}
              aria-pressed={model.view === 'list'} onClick={() => model.setView('list')} title="List" aria-label="List">
              <i className="bi bi-list-ul" /><span className="visually-hidden">List</span></button>
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary et-schedule-filter-toggle" aria-controls="et-schedule-filters"
            aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>Filters{Object.values(model.filters).some(Boolean) ? ' •' : ''}</button>
        </div>
      </div>
      <div className="schedule-body-card">{model.view === 'list' && <ListHeader />}{toolbar}
        {model.loading ? <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-3 et-schedule-state" role="status">
          <div className="spinner-border text-primary mx-auto mb-2" role="status" /><p className="text-muted mb-0">Loading schedule…</p></div> :
          model.error ? <div className="et-schedule-state et-schedule-error" role="alert"><p>{model.error}</p>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={model.retry}>Retry</button></div> : <>
          {displayedSessions.length === 0 && <div className="et-schedule-state" role="status"><strong>No schedule available</strong>
            <p>{model.sessions.length ? 'No sessions match the filters.' : 'No sessions scheduled for the selected week.'}</p></div>}
          {model.view === 'calendar' ? <ScheduleCalendar sessions={displayedSessions} monday={model.monday} now={model.now} onOpen={model.open}
            partner={role === 'teacher' ? 'ta' : 'teacher'} /> :
            <ScheduleList sessions={displayedSessions} now={model.now} role={role} sort={model.sort} onSort={model.handleSort}
              page={model.page} pageSize={model.pageSize} onPage={model.setPage} onOpen={model.open} />}
        </>}
      </div>
      {model.selected && (
        <ScheduleSessionDetail
          session={model.selected}
          now={model.now}
          role={role}
          onClose={model.close}
          onMutated={(targetDate) => {
            model.close();
            if (targetDate) model.navigate(mondayOf(targetDate));
            model.retry();
            onSessionMutated?.();
          }}
        />
      )}
    </section>
  </>;
}
