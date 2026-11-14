import { useEffect, useRef, useState, type FormEvent } from 'react';
import type {
  ScheduleCapabilities,
  ScheduleGenerationInput,
  ScheduleGenerationPreview,
  ScheduleTemplate,
  ScheduleTemplateInput,
  ScheduleTemplatePreview,
} from '../../../../BLL/models/ScheduleManagement';
import { scheduleManagementDAL as api } from '../../../../DAL/scheduleManagementDAL';
import { addScheduleDays, vietnamClock } from '../../../../BLL/services/scheduleViewService';
import { useSelectedUser } from '../../../hooks/useSelectedUser';

const days = [
  ['Monday', 'Monday'],
  ['Tuesday', 'Tuesday'],
  ['Wednesday', 'Wednesday'],
  ['Thursday', 'Thursday'],
  ['Friday', 'Friday'],
  ['Saturday', 'Saturday'],
  ['Sunday', 'Sunday'],
];

const outcomes: Record<string, string> = {
  eligible: 'Eligible (Will create)',
  existing: 'Already exists (Unchanged)',
  conflict: 'Schedule conflict',
  outside_class: 'Outside course duration',
  created: 'Successfully created',
};

const errorText = (cause: unknown) =>
  cause instanceof Error ? cause.message : 'Failed to process request. Please refresh.';

const emptyForm = () => ({
  dayOfWeek: 'Monday',
  startTime: '18:00',
  endTime: '20:00',
  room: '',
  effectiveFrom: '',
});

const dayLabel = (value: string) => days.find(([key]) => key === value)?.[1] || value;

export function ScheduleManagement({
  onCreated,
  initialClassId,
  onClose,
}: {
  onCreated: () => void;
  initialClassId?: number;
  onClose?: () => void;
}) {
  const { user } = useSelectedUser();
  return (
    <ManagementPanel
      key={`${user?.userId ?? 'anonymous'}:${initialClassId ?? 'all'}`}
      onCreated={onCreated}
      initialClassId={initialClassId}
      onClose={onClose}
    />
  );
}

function ManagementPanel({
  onCreated,
  initialClassId,
  onClose,
}: {
  onCreated: () => void;
  initialClassId?: number;
  onClose?: () => void;
}) {
  const [capabilities, setCapabilities] = useState<ScheduleCapabilities | null>(null);
  const [classId, setClassId] = useState(initialClassId ? String(initialClassId) : '');
  const [templates, setTemplates] = useState<ScheduleTemplate[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);

  // Tab state: 'templates' | 'month'
  const [activeTab, setActiveTab] = useState<'templates' | 'month'>('templates');

  // Template Form State
  const [editing, setEditing] = useState<ScheduleTemplate | null>(null);
  const [operation, setOperation] = useState<ScheduleTemplateInput['operation']>('create');
  const [form, setForm] = useState(emptyForm);
  const [templatePreview, setTemplatePreview] = useState<{
    input: ScheduleTemplateInput;
    result: ScheduleTemplatePreview;
  } | null>(null);

  // Month Generation State
  const [month, setMonth] = useState(() => vietnamClock().date.slice(0, 7));
  const [preview, setPreview] = useState<{
    input: ScheduleGenerationInput;
    result: ScheduleGenerationPreview;
    keys: string[];
  } | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    api
      .capabilities(abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) setCapabilities(data);
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setError(errorText(cause));
      });
    return () => abort.abort();
  }, [reload]);

  useEffect(() => {
    if (!classId) return;
    const abort = new AbortController();
    api
      .templates(Number(classId), abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) setTemplates(data);
      })
      .catch((cause) => {
        if (!abort.signal.aborted) setError(errorText(cause));
      });
    return () => abort.abort();
  }, [classId, reload]);

  function invalidate() {
    setPreview(null);
    setTemplatePreview(null);
    setConfirmed(false);
    setNotice('');
    setError('');
  }

  function selectClass(value: string) {
    setClassId(value);
    setTemplates(null);
    setEditing(null);
    setOperation('create');
    setForm(emptyForm());
    invalidate();
  }

  function changeForm(key: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
    invalidate();
  }

  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
    } catch (cause) {
      if (mounted.current) setError(errorText(cause));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function refreshTemplates() {
    setTemplates(null);
    setEditing(null);
    setOperation('create');
    setForm(emptyForm());
    setTemplatePreview(null);
    setPreview(null);
    setReload((value) => value + 1);
  }

  function beginChange(root: ScheduleTemplate, action: 'replace' | 'retire') {
    const last = root.versions.at(-1)!;
    const from = [
      capabilities!.earliestEffectiveFrom,
      last.effectiveTo || addScheduleDays(last.effectiveFrom, 7),
    ]
      .sort()
      .at(-1)!;
    setEditing(root);
    setOperation(action);
    setForm({
      dayOfWeek: last.dayOfWeek,
      startTime: last.startTime.slice(0, 5),
      endTime: last.endTime.slice(0, 5),
      room: last.room || '',
      effectiveFrom: from,
    });
    invalidate();
  }

  async function handlePreviewTemplate(event: FormEvent) {
    event.preventDefault();
    setTemplatePreview(null);
    if (operation !== 'retire' && (!form.startTime || !form.endTime || form.startTime >= form.endTime)) {
      setError('Start time must be before end time.');
      return;
    }
    const input: ScheduleTemplateInput = {
      classId: Number(classId),
      operation,
      ...form,
      effectiveFrom: form.effectiveFrom || capabilities!.earliestEffectiveFrom,
      room: form.room.trim() || null,
      ...(editing ? { scheduleId: editing.scheduleId, version: editing.version } : {}),
    };
    await run(async () => {
      const result = await api.previewTemplate(input);
      if (mounted.current) setTemplatePreview({ input, result });
    });
  }

  async function handleBuildMonthPreview(event: FormEvent) {
    event.preventDefault();
    setPreview(null);
    setConfirmed(false);
    const input: ScheduleGenerationInput = {
      classId: Number(classId),
      mode: 'month',
      year: Number(month.slice(0, 4)),
      month: Number(month.slice(5, 7)),
    };
    await run(async () => {
      const result = await api.preview(input);
      if (mounted.current) {
        setPreview({
          input,
          result,
          keys: result.rows.filter((r) => r.outcome === 'eligible').map((r) => r.key),
        });
      }
    });
  }

  const selectedClass = capabilities?.classes.find((c) => String(c.classId) === classId);
  const canManage = capabilities?.canManageTemplates === true;
  const canCreate = capabilities?.canCreateSessions === true;

  const content = (
    <div className="schedule-management-inner">
      {/* Notifications / Alerts */}
      {error && (
        <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="alert alert-success py-2 small d-flex align-items-center gap-2 mb-3" role="status">
          <i className="bi bi-check-circle-fill flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {!capabilities ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          Loading class data and system permissions…
        </div>
      ) : (
        <>
          {/* Quick class switch if not locked */}
          {!initialClassId && (
            <div className="mb-3 p-3 bg-light rounded-3 border">
              <label className="form-label small fw-semibold text-secondary mb-1">
                <i className="bi bi-mortarboard me-1" />
                Select Class to Manage:
              </label>
              <select
                aria-label="Select Class"
                className="form-select form-select-sm"
                value={classId}
                disabled={busy}
                onChange={(e) => selectClass(e.target.value)}
              >
                <option value="">-- Please select a class --</option>
                {capabilities.classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    #{c.classId} · {c.className}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!selectedClass ? (
            <div className="text-center py-4 text-muted border rounded-3 bg-light">
              <i className="bi bi-arrow-up-circle fs-3 d-block mb-1 text-primary" />
              Please select a class above to manage recurring sessions and automatic scheduling.
            </div>
          ) : (
            <>
              {/* Class Header Banner */}
              <div className="p-3 bg-primary-subtle text-primary-emphasis rounded-3 border border-primary-subtle mb-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                  <h6 className="fw-bold mb-1 text-dark">
                    <i className="bi bi-journal-check me-2 text-primary" />
                    Class: {selectedClass.className}
                  </h6>
                  <small className="text-muted">
                    Course duration: <strong>{selectedClass.startDate}</strong> →{' '}
                    <strong>{selectedClass.endDate || 'No end date'}</strong>
                  </small>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  disabled={busy}
                  onClick={() => {
                    invalidate();
                    refreshTemplates();
                  }}
                >
                  <i className="bi bi-arrow-clockwise me-1" />
                  Refresh
                </button>
              </div>

              {/* TABS NAVIGATION */}
              <ul className="nav nav-pills nav-fill mb-3 p-1 bg-light rounded-3 border">
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                      activeTab === 'templates' ? 'active shadow-sm' : 'text-secondary'
                    }`}
                    onClick={() => {
                      setActiveTab('templates');
                      invalidate();
                    }}
                  >
                    <i className="bi bi-calendar-week" />
                    1. Weekly Recurring Sessions
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    type="button"
                    className={`nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 ${
                      activeTab === 'month' ? 'active shadow-sm' : 'text-secondary'
                    }`}
                    onClick={() => {
                      setActiveTab('month');
                      invalidate();
                    }}
                  >
                    <i className="bi bi-calendar-check" />
                    2. Auto-Generate Monthly Schedule
                  </button>
                </li>
              </ul>

              {/* TAB 1: WEEKLY RECURRING SESSIONS */}
              {activeTab === 'templates' && (
                <div className="schedule-tab-templates">
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-1">Current Recurring Sessions:</h6>
                    <small className="text-muted d-block mb-3">
                      These are weekly recurring time slots. When you generate a monthly schedule in Tab 2, the system will automatically schedule sessions matching these slots.
                    </small>

                    {!templates ? (
                      <div className="text-center py-3 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                        Loading session list…
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="p-3 text-center border rounded-3 bg-light text-muted mb-3">
                        <i className="bi bi-calendar-x fs-3 d-block mb-1 text-secondary" />
                        This class does not have any recurring sessions yet. Please set them up in the form below.
                      </div>
                    ) : (
                      <div className="row g-2 mb-3">
                        {templates.map((s) => {
                          const isRetiring = s.versions.at(-1)?.effectiveTo !== null;
                          return (
                            <div key={s.scheduleId} className="col-12 col-md-6">
                              <div className="border rounded-3 p-3 bg-white h-100 shadow-xs">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <span className="badge bg-primary fs-6 px-2 py-1">
                                    {dayLabel(s.dayOfWeek)}
                                  </span>
                                  {isRetiring ? (
                                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                      Discontinued from {s.versions.at(-1)?.effectiveTo}
                                    </span>
                                  ) : (
                                    <span className="badge bg-success-subtle text-success border border-success-subtle">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="fs-5 fw-bold text-dark mb-1">
                                  <i className="bi bi-clock me-2 text-primary" />
                                  {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                                </div>
                                <div className="text-muted small mb-2">
                                  <i className="bi bi-geo-alt me-1 text-danger" />
                                  Room: <strong>{s.room || 'Unassigned'}</strong>
                                </div>
                                <div className="small text-muted mb-2">
                                  Effective from: <strong>{s.versions.at(-1)?.effectiveFrom}</strong>
                                </div>

                                {canManage && !isRetiring && (
                                  <div className="d-flex gap-2 pt-2 border-top mt-2">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                                      disabled={busy}
                                      onClick={() => beginChange(s, 'replace')}
                                    >
                                      <i className="bi bi-pencil-square" />
                                      Change time / room
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                                      disabled={busy}
                                      onClick={() => beginChange(s, 'retire')}
                                    >
                                      <i className="bi bi-slash-circle" />
                                      Discontinue slot
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* FORM ADD / UPDATE RECURRING SESSION */}
                  {canManage && (
                    <div className="card border rounded-3 p-3 bg-light shadow-xs">
                      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
                        <h6 className="fw-bold mb-0 text-dark">
                          {operation === 'retire'
                            ? `Discontinue Session Slot #${editing?.scheduleId}`
                            : editing
                            ? `Update Time Slot for Session #${editing.scheduleId}`
                            : 'Add New Recurring Session'}
                        </h6>
                        {editing && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => {
                              setEditing(null);
                              setOperation('create');
                              setForm(emptyForm());
                              invalidate();
                            }}
                          >
                            Cancel edit, create new slot
                          </button>
                        )}
                      </div>

                      <form onSubmit={handlePreviewTemplate}>
                        <fieldset disabled={busy}>
                          <div className="row g-2 mb-3">
                            {operation !== 'retire' && (
                              <>
                                <div className="col-12 col-md-3">
                                  <label className="form-label small fw-semibold mb-1">Day of week</label>
                                  <select
                                    aria-label="Day of week"
                                    className="form-select form-select-sm"
                                    value={form.dayOfWeek}
                                    onChange={(e) => changeForm('dayOfWeek', e.target.value)}
                                  >
                                    {days.map(([key, label]) => (
                                      <option key={key} value={key}>
                                        {label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-6 col-md-2">
                                  <label className="form-label small fw-semibold mb-1">Start</label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    required
                                    value={form.startTime}
                                    onChange={(e) => changeForm('startTime', e.target.value)}
                                  />
                                </div>
                                <div className="col-6 col-md-2">
                                  <label className="form-label small fw-semibold mb-1">End</label>
                                  <input
                                    type="time"
                                    className="form-control form-control-sm"
                                    required
                                    value={form.endTime}
                                    onChange={(e) => changeForm('endTime', e.target.value)}
                                  />
                                </div>
                                <div className="col-12 col-md-2">
                                  <label className="form-label small fw-semibold mb-1">Room</label>
                                  <input
                                    type="text"
                                    className="form-control form-control-sm"
                                    maxLength={50}
                                    placeholder="e.g. Room 201"
                                    value={form.room}
                                    onChange={(e) => changeForm('room', e.target.value)}
                                  />
                                </div>
                              </>
                            )}

                            <div className="col-12 col-md-3">
                              <label className="form-label small fw-semibold mb-1">
                                Effective from Monday of week:
                              </label>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                required
                                min={capabilities.earliestEffectiveFrom}
                                step={7}
                                value={form.effectiveFrom || capabilities.earliestEffectiveFrom}
                                onChange={(e) => changeForm('effectiveFrom', e.target.value)}
                              />
                            </div>
                          </div>

                          <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>
                            <i className="bi bi-eye me-1" />
                            {busy ? 'Checking…' : 'Preview & Apply'}
                          </button>
                        </fieldset>
                      </form>

                      {/* TEMPLATE PREVIEW BOX */}
                      {templatePreview && (
                        <div className="mt-3 p-3 bg-white border border-primary rounded-3 shadow-xs">
                          <h6 className="fw-bold text-dark mb-1">
                            <i className="bi bi-check2-circle text-primary me-2" />
                            Confirm applying {templatePreview.result.operation === 'retire' ? 'slot discontinuation' : 'recurring session slot'} from {templatePreview.result.effectiveFrom}
                          </h6>
                          <p className="small text-muted mb-2">{templatePreview.result.message}</p>
                          {templatePreview.result.retainedSessions.length > 0 && (
                            <div className="alert alert-info py-2 small mb-2">
                              <i className="bi bi-shield-check me-1" />
                              Retaining <strong>{templatePreview.result.retainedSessions.length}</strong> past sessions unaffected.
                            </div>
                          )}
                          <div className="d-flex gap-2 mt-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              disabled={busy}
                              onClick={() =>
                                run(async () => {
                                  const result = await api.confirmTemplate({
                                    ...templatePreview.input,
                                    previewToken: templatePreview.result.previewToken,
                                  });
                                  if (!mounted.current) return;
                                  refreshTemplates();
                                  setNotice(
                                    `Successfully saved ${
                                      result.operation === 'retire' ? 'slot discontinuation' : 'new recurring session'
                                    }!`
                                  );
                                  onCreated();
                                })
                              }
                            >
                              <i className="bi bi-check-lg me-1" />
                              {busy ? 'Saving…' : 'Confirm Save Slot'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setTemplatePreview(null)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AUTO-GENERATE MONTHLY SCHEDULE */}
              {activeTab === 'month' && (
                <div className="schedule-tab-month">
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <h6 className="fw-bold text-dark mb-1">
                      <i className="bi bi-magic me-2 text-primary" />
                      Auto-Generate Monthly Schedule
                    </h6>
                    <p className="small text-muted mb-3">
                      The system will scan recurring session slots in Tab 1 and automatically schedule all sessions for the selected month. Existing or rescheduled sessions will be preserved safely.
                    </p>

                    {templates && templates.length === 0 ? (
                      <div className="alert alert-warning py-2 small" role="alert">
                        <i className="bi bi-exclamation-circle me-1" />
                        The class has no recurring session slots yet. Please switch to Tab 1 to set up slots before auto-generating the schedule.
                      </div>
                    ) : (
                      <form onSubmit={handleBuildMonthPreview} className="row g-2 align-items-end">
                        <div className="col-12 col-md-4">
                          <label className="form-label small fw-semibold mb-1">Select Month &amp; Year to Schedule</label>
                          <input
                            type="month"
                            className="form-control form-control-sm"
                            required
                            min="2020-01"
                            max="2035-12"
                            value={month}
                            onChange={(e) => {
                              setMonth(e.target.value);
                              invalidate();
                            }}
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <button type="submit" className="btn btn-sm btn-primary w-100" disabled={busy}>
                            <i className="bi bi-search me-1" />
                            {busy ? 'Checking schedule…' : 'Check & Preview Monthly Schedule'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* MONTHLY SCHEDULE PREVIEW RESULTS */}
                  {preview && (
                    <div className="card border rounded-3 p-3 bg-white shadow-xs mb-3">
                      <h6 className="fw-bold text-dark mb-2">
                        {confirmed ? 'Schedule Confirmation Results:' : `Preview Schedule for Month ${month}:`}
                      </h6>

                      {/* Summary Cards */}
                      <div className="row g-2 mb-3">
                        <div className="col-4">
                          <div className="p-2 border rounded-3 text-center bg-success-subtle border-success-subtle">
                            <span className="small text-success d-block fw-semibold">To Be Created</span>
                            <strong className="fs-5 text-success">
                              {preview.result.rows.filter((r) => r.outcome === 'eligible').length} sessions
                            </strong>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 border rounded-3 text-center bg-info-subtle border-info-subtle">
                            <span className="small text-info-emphasis d-block fw-semibold">Already Exists</span>
                            <strong className="fs-5 text-info-emphasis">
                              {preview.result.rows.filter((r) => r.outcome === 'existing').length} sessions
                            </strong>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="p-2 border rounded-3 text-center bg-light border">
                            <span className="small text-muted d-block fw-semibold">Other/Conflict</span>
                            <strong className="fs-5 text-muted">
                              {
                                preview.result.rows.filter((r) => !['eligible', 'existing'].includes(r.outcome))
                                  .length
                              }
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Expected sessions list */}
                      <div className="mb-3">
                        <small className="text-muted fw-semibold d-block mb-1">
                          Expected sessions list for the month:
                        </small>
                        <div className="d-flex flex-wrap gap-1" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                          {preview.result.rows.map((r) => {
                            const isNew = r.outcome === 'eligible';
                            const isOld = r.outcome === 'existing';
                            const badgeBg = isNew
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : isOld
                              ? 'bg-info-subtle text-info-emphasis border border-info-subtle'
                              : 'bg-light text-muted border';
                            return (
                              <span key={r.key} className={`badge px-2 py-1 ${badgeBg} small`}>
                                <i className={`bi ${isNew ? 'bi-plus-circle' : isOld ? 'bi-check2' : 'bi-dash'} me-1`} />
                                {r.sessionDate} ({r.startTime.slice(0, 5)}–{r.endTime.slice(0, 5)})
                                {' · '}
                                {outcomes[r.outcome] || r.outcome}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {!confirmed && (
                        <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-success fw-semibold px-4"
                            disabled={busy || preview.keys.length === 0}
                            onClick={() =>
                              run(async () => {
                                const result = await api.confirm({
                                  ...preview.input,
                                  previewToken: preview.result.previewToken,
                                  selectedKeys: preview.keys,
                                });
                                if (!mounted.current) return;
                                setPreview({ ...preview, result });
                                setConfirmed(true);
                                setNotice(
                                  `Successfully created ${result.created} sessions for month ${month}!`
                                );
                                onCreated();
                              })
                            }
                          >
                            <i className="bi bi-calendar-check me-2" />
                            {busy
                              ? 'Creating sessions…'
                              : `Confirm creating ${preview.keys.length} sessions`}
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            disabled={busy}
                            onClick={() => setPreview(null)}
                          >
                            Close Preview
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );

  // If onClose is provided, render inside a modal dialog
  if (onClose) {
    return (
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-light border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary fs-6">
                  <i className="bi bi-gear-fill me-1" />
                  Schedule Configuration
                </span>
                <h5 className="modal-title fw-bold mb-0 text-dark">
                  Manage Recurring Schedule &amp; Monthly Generation
                </h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body p-4">{content}</div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standalone panel
  return (
    <div className="schedule-management border rounded-4 bg-white p-3 mb-3" aria-label="Schedule Management">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
        <h2 className="h5 mb-0">Recurring Schedule &amp; Sessions</h2>
      </div>
      {content}
    </div>
  );
}
