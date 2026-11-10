import {useEffect, useMemo, useState, type FormEvent, type ReactNode} from 'react';
import type {ScheduleRole} from '../../../../BLL/models/ScheduleSession';
import {addScheduleDays, displayScheduleDate, mondayOf, vietnamClock} from '../../../../BLL/services/scheduleViewService';
import {scheduleManagementDAL} from '../../../../DAL/scheduleManagementDAL';
import {useScheduleReadModel} from './useScheduleReadModel';
import {ScheduleCalendar} from './ScheduleCalendar';
import {ScheduleList} from './ScheduleList';
import {ScheduleSessionDetail} from './ScheduleSessionDetail';
import {ScheduleManagement} from './ScheduleManagement';
import {ScheduleLegendStrip} from '../../student/schedule/ScheduleLegendStrip';
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
  const [managementOpen, setManagementOpen] = useState(false);
  const [addSessionOpen, setAddSessionOpen] = useState(false);
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
      setAddError('Vui lòng chọn ngày học và giờ bắt đầu trước giờ kết thúc.');
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
      setAddNotice(`Đã thêm buổi học #${created.sessionId} vào ngày ${displayScheduleDate(created.sessionDate)} (${created.startTime.slice(0, 5)}–${created.endTime.slice(0, 5)}).`);
      model.navigate(mondayOf(created.sessionDate));
      model.retry();
      onSessionMutated?.();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Không thể tạo buổi học mới.');
    } finally {
      setAddBusy(false);
    }
  }
  const options = useMemo(() => {
    const distinct = (pairs: [string, string][]) => Array.from(new Map(pairs)).sort((a,b) => a[1].localeCompare(b[1], 'vi', {numeric:true}));
    return {
      classId: distinct(model.sessions.map(s => [String(s.classId), s.className])),
      subjectId: distinct(model.sessions.filter(s => s.subjectName).map(s => [String(s.subjectId), s.subjectName!])),
      teacherId: distinct(model.sessions.flatMap(s => s.teachers.map(p => [String(p.userId), p.name] as [string,string]))),
      taId: distinct(model.sessions.flatMap(s => s.teachingAssistants.map(p => [String(p.userId), p.name] as [string,string]))),
      room: distinct(model.sessions.filter(s => s.room).map(s => [s.room!, s.room!])),
    };
  }, [model.sessions]);
  const range = displayScheduleDate(model.monday) + ' – ' + displayScheduleDate(addScheduleDays(model.monday, 6));
  // Header actions keep viet's week navigator and compact far-right icon toggle.
  const actions = <div className="d-flex flex-wrap align-items-center gap-2 schedule-header-actions schedule-official-actions">
    {model.view === 'calendar' && <div className="week-navigator-controls d-flex align-items-center gap-2">
      <button type="button" className="btn-week-today" id="btnWeekToday" onClick={() => model.navigate(mondayOf(vietnamClock().date))}>Hôm nay</button>
      <div className="week-nav-group d-flex align-items-center">
        <button type="button" className="btn-week-nav" id="btnWeekPrev" aria-label="Tuần trước"
          onClick={() => model.navigate(addScheduleDays(model.monday, -7))}><i className="bi bi-chevron-left" /></button>
        <span className="week-range-text px-2 et-schedule-range" id="weekRangeText">{range}</span>
        <button type="button" className="btn-week-nav" id="btnWeekNext" aria-label="Tuần sau"
          onClick={() => model.navigate(addScheduleDays(model.monday, 7))}><i className="bi bi-chevron-right" /></button>
      </div>
    </div>}
    <div className="btn-group btn-group-sm ms-auto" role="group" aria-label="Chế độ hiển thị">
      <button type="button" className={'btn ' + (model.view === 'calendar' ? 'btn-primary' : 'btn-outline-secondary')}
        aria-pressed={model.view === 'calendar'} onClick={() => model.setView('calendar')} title="Lịch biểu" aria-label="Calendar">
        <i className="bi bi-calendar3" /><span className="visually-hidden">Calendar</span></button>
      <button type="button" className={'btn ' + (model.view === 'list' ? 'btn-primary' : 'btn-outline-secondary')}
        aria-pressed={model.view === 'list'} onClick={() => model.setView('list')} title="Danh sách" aria-label="List">
        <i className="bi bi-list-ul" /><span className="visually-hidden">List</span></button>
    </div>
  </div>;
  const labels = {classId:'Class', subjectId:'Subject', teacherId:'Teacher', taId:'TA', room:'Room'};
  const toolbar = <ScheduleListToolbar filters={model.filters} statuses={model.sessions.map(s => s.status)}
    onFilter={model.updateFilter} expanded={expanded}>
    <details className="schedule-advanced-filters"><summary>Bộ lọc khác</summary><div className="schedule-advanced-body">
      {(Object.keys(labels) as (keyof typeof labels)[]).map(key => <label key={key}>{labels[key]}
        <select aria-label={labels[key]} className="form-select form-select-sm" value={model.filters[key]} onChange={e => model.updateFilter(key, e.target.value)}>
          <option value="">Tất cả</option>
          {model.filters[key] && !options[key].some(([id]) => id === model.filters[key]) && <option value={model.filters[key]}>Đang chọn: {model.filters[key]}</option>}
          {options[key].map(([id,label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>)}
    </div></details>
    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={model.clear}>Xóa bộ lọc</button>
  </ScheduleListToolbar>;
  const ListHeader = role === 'teaching-assistant' ? TaListHeader : ScheduleListHeader;
  return <>
    {renderHeader?.(actions)}
    <section className="et-schedule schedule-official" aria-label="Lịch phiên học chính thức">
      {!renderHeader && <div className="schedule-inline-actions">{actions}</div>}
      {['center-manager','admin-staff'].includes(role) && <div className="d-flex flex-wrap gap-2 mb-3">
        {lockedClassId && (
          <button
            type="button"
            className={'btn ' + (addSessionOpen ? 'btn-primary' : 'btn-outline-primary')}
            onClick={() => { setAddSessionOpen(v => !v); setAddError(''); setAddNotice(''); }}
          >
            <i className="bi bi-calendar-plus me-1" />
            {addSessionOpen ? 'Đóng thêm buổi học' : 'Thêm buổi học / Học bù (Ngày bất kỳ)'}
          </button>
        )}
        <button type="button" className="btn btn-outline-primary" aria-expanded={managementOpen}
          onClick={() => setManagementOpen(value => !value)}>{managementOpen ? 'Đóng quản lý lịch cố định' : 'Quản lý lịch cố định & Tạo lịch theo tháng'}</button>
      </div>}
      {addSessionOpen && ['center-manager','admin-staff'].includes(role) && lockedClassId && (
        <div className="border rounded-4 bg-white p-3 mb-3 shadow-sm">
          <h3 className="h6 fw-bold mb-2">
            <i className="bi bi-plus-circle text-primary me-2" />
            Tạo phiên học mới / Buổi học bù vào ngày bất kỳ
          </h3>
          <p className="small text-muted mb-3">
            Buổi học được tạo sẽ xuất hiện ngay trên thời khóa biểu của Lớp và tự động cập nhật vào danh sách buổi Điểm danh của Giáo viên & Trợ giảng.
          </p>
          {addError && <div className="alert alert-danger py-2 small" role="alert">{addError}</div>}
          {addNotice && <div className="alert alert-success py-2 small" role="status">{addNotice}</div>}
          <form onSubmit={handleCreateDirectSession} className="row g-2 align-items-end">
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold mb-1">Ngày học (bất kỳ)</label>
              <input type="date" className="form-control form-control-sm" required value={newDate} onChange={e => setNewDate(e.target.value)} disabled={addBusy} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Giờ bắt đầu</label>
              <input type="time" className="form-control form-control-sm" required value={newStart} onChange={e => setNewStart(e.target.value)} disabled={addBusy} />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label small fw-semibold mb-1">Giờ kết thúc</label>
              <input type="time" className="form-control form-control-sm" required value={newEnd} onChange={e => setNewEnd(e.target.value)} disabled={addBusy} />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label small fw-semibold mb-1">Phòng học</label>
              <input type="text" className="form-control form-control-sm" maxLength={50} placeholder="VD: Room 201" value={newRoom} onChange={e => setNewRoom(e.target.value)} disabled={addBusy} />
            </div>
            <div className="col-12 col-md-2">
              <button type="submit" className="btn btn-sm btn-primary w-100" disabled={addBusy}>
                <i className="bi bi-check2 me-1" />
                {addBusy ? 'Đang tạo…' : 'Tạo buổi học'}
              </button>
            </div>
          </form>
        </div>
      )}
      {managementOpen && ['center-manager','admin-staff'].includes(role) && <ScheduleManagement initialClassId={lockedClassId} onCreated={() => { model.retry(); onSessionMutated?.(); }} />}
      <div className="d-flex align-items-center justify-content-between p-3 bg-white rounded-4 border shadow-sm et-schedule-summary">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fw-semibold">
            <i className="bi bi-calendar-week me-1" />{model.view === 'calendar' ? 'Thời khóa biểu tuần' : range}</span>
          <span className="small text-muted">Tổng cộng <strong>{model.filtered.length}</strong> phiên học đã xếp lịch</span>
        </div>
        <span className="small text-muted d-none d-md-inline"><i className="bi bi-clock me-1" />Giờ Việt Nam (GMT+7)</span>
        <button type="button" className="btn btn-sm btn-outline-secondary et-schedule-filter-toggle" aria-controls="et-schedule-filters"
          aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>Bộ lọc{Object.values(model.filters).some(Boolean) ? ' •' : ''}</button>
      </div>
      <div className="schedule-body-card">{model.view === 'list' && <ListHeader />}{toolbar}
        {model.loading ? <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-3 et-schedule-state" role="status">
          <div className="spinner-border text-primary mx-auto mb-2" role="status" /><p className="text-muted mb-0">Đang tải lịch học…</p></div> :
          model.error ? <div className="et-schedule-state et-schedule-error" role="alert"><p>{model.error}</p>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={model.retry}>Thử lại</button></div> : <>
          {model.filtered.length === 0 && <div className="et-schedule-state" role="status"><strong>Chưa có lịch học</strong>
            <p>{model.sessions.length ? 'Không có phiên học phù hợp với bộ lọc.' : 'Chưa có phiên học trong tuần đã chọn.'}</p></div>}
          {model.view === 'calendar' ? <ScheduleCalendar sessions={model.filtered} monday={model.monday} now={model.now} onOpen={model.open}
            partner={role === 'teacher' ? 'ta' : 'teacher'} /> :
            <ScheduleList sessions={model.filtered} now={model.now} role={role} sort={model.sort} onSort={model.handleSort}
              page={model.page} pageSize={model.pageSize} onPage={model.setPage} onOpen={model.open} />}
        </>}
      </div>
      {model.view === 'calendar' && <ScheduleLegendStrip official />}
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
