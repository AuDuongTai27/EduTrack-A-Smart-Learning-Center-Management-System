import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../../components/Common/PageHeader';
import { ScheduleWorkspace } from '../../../components/shared/schedule/ScheduleWorkspace';
import { scheduleManagementDAL } from '../../../../DAL/scheduleManagementDAL';
import type { ScheduleCapabilities, ScheduleClassOption } from '../../../../BLL/models/ScheduleManagement';
import { useSelectedUser } from '../../../hooks/useSelectedUser';

export default function ManagementSchedulePage({role}: {role: 'center-manager' | 'admin-staff'}) {
  const { user } = useSelectedUser();
  const [capabilities, setCapabilities] = useState<ScheduleCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError('');
    scheduleManagementDAL
      .capabilities(abort.signal)
      .then((data) => {
        if (!abort.signal.aborted) {
          setCapabilities(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!abort.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to load class list.');
          setLoading(false);
        }
      });
    return () => abort.abort();
  }, [user?.userId, reload]);

  const classes = useMemo(() => capabilities?.classes ?? [], [capabilities]);

  const filteredClasses = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return classes.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      const teacherNames = (c.teachers ?? []).map((t) => t.name).join(' ').toLowerCase();
      const taNames = (c.teachingAssistants ?? []).map((t) => t.name).join(' ').toLowerCase();
      return (
        c.className.toLowerCase().includes(q) ||
        String(c.classId).includes(q) ||
        (c.subjectName ?? '').toLowerCase().includes(q) ||
        (c.room ?? '').toLowerCase().includes(q) ||
        teacherNames.includes(q) ||
        taNames.includes(q)
      );
    });
  }, [classes, searchTerm, statusFilter]);

  const selectedClass: ScheduleClassOption | undefined = useMemo(
    () => classes.find((c) => c.classId === selectedClassId),
    [classes, selectedClassId]
  );

  return (
    <>
      <PageHeader
        title={selectedClass ? `Schedule · ${selectedClass.className}` : 'Class Schedule Management'}
        breadcrumbItems={[
          { label: role === 'center-manager' ? 'Center Manager' : 'Admin Staff', path: `/${role}/dashboard` },
          { label: 'Center Schedule' },
          ...(selectedClass ? [{ label: selectedClass.className }] : []),
        ]}
        action={
          selectedClass ? (
            <div className="d-flex flex-wrap align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary fw-semibold d-inline-flex align-items-center gap-1 shadow-xs"
                onClick={() => setSelectedClassId(null)}
              >
                <i className="bi bi-arrow-left" />
                Back to Class List
              </button>
              <div className="d-flex align-items-center gap-2 bg-white px-2 py-1 rounded-3 border shadow-xs">
                <label className="small text-muted text-nowrap mb-0 fw-semibold" htmlFor="quickClassSwitch">
                  <i className="bi bi-arrow-left-right text-primary me-1" />
                  Quick switch class:
                </label>
                <select
                  id="quickClassSwitch"
                  className="form-select form-select-sm border-0 bg-transparent fw-semibold"
                  style={{ width: 'auto', minWidth: 210 }}
                  value={selectedClass.classId}
                  onChange={(e) => setSelectedClassId(Number(e.target.value))}
                >
                  {classes.map((c) => (
                    <option key={c.classId} value={c.classId}>
                      #{c.classId} · {c.className}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : undefined
        }
      />

      {loading && !capabilities ? (
        <div className="p-5 text-center bg-white rounded-4 border shadow-sm my-3">
          <div className="spinner-border text-primary mb-2" role="status" />
          <p className="text-muted mb-0">Loading center class list…</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 my-3" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setReload((r) => r + 1)}>
            Retry
          </button>
        </div>
      ) : !selectedClass ? (
        /* STEP 1: CLASS NOT SELECTED -> SHOW CLASS LIST TO SELECT, DO NOT SHOW SCHEDULE */
        <section className="bg-white rounded-4 border shadow-sm p-4 mb-4" aria-label="Select class to view schedule">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
            <div>
              <h2 className="h5 fw-bold mb-1">
                <i className="bi bi-journal-bookmark-fill text-primary me-2" />
                Select a class to view & adjust schedule
              </h2>
              <p className="text-muted small mb-0">
                Please select a class below to view detailed schedule, reschedule sessions, remove cancelled sessions, or create make-up sessions.
              </p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ minWidth: 240 }}>
                <span className="input-group-text bg-light">
                  <i className="bi bi-search" />
                </span>
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search by class, subject, teacher, room…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                aria-label="Filter class status"
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'upcoming')}
              >
                <option value="all">All Statuses ({classes.length})</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
              </select>
            </div>
          </div>

          {filteredClasses.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-2 d-block mb-2" />
              No classes match the filter.
            </div>
          ) : (
            <div className="row g-3">
              {filteredClasses.map((c) => {
                const teachers = (c.teachers ?? []).map((t) => t.name).join(', ') || 'Unassigned';
                const tas = (c.teachingAssistants ?? []).map((t) => t.name).join(', ') || 'Unassigned';
                const schedules = c.scheduleSummary ?? [];
                return (
                  <div key={c.classId} className="col-12 col-md-6 col-xl-4">
                    <div className="card h-100 border rounded-4 shadow-xs hover-shadow transition">
                      <div className="card-body d-flex flex-column justify-content-between p-3">
                        <div>
                          <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                            <div>
                              <span className="badge bg-light text-secondary border me-1">#{c.classId}</span>
                              {c.subjectName && (
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                  {c.subjectName}
                                </span>
                              )}
                            </div>
                            <span
                              className={
                                'badge rounded-pill ' +
                                (c.status === 'active'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle')
                              }
                            >
                              {c.status === 'active' ? 'Active' : 'Upcoming'}
                            </span>
                          </div>

                          <h3 className="h6 fw-bold mb-2 text-dark">{c.className}</h3>

                          <div className="small text-muted mb-2">
                            <div className="mb-1">
                              <i className="bi bi-person-workspace me-1 text-primary" />
                              <strong>Teacher:</strong> {teachers}
                            </div>
                            <div className="mb-1">
                              <i className="bi bi-person-badge me-1 text-info" />
                              <strong>TA:</strong> {tas}
                            </div>
                            <div className="mb-1">
                              <i className="bi bi-geo-alt me-1 text-danger" />
                              <strong>Default Room:</strong> {c.room || 'No room assigned'}
                            </div>
                            <div>
                              <i className="bi bi-calendar-range me-1 text-secondary" />
                              <strong>Duration:</strong> {c.startDate} → {c.endDate || 'End date not set'}
                            </div>
                          </div>

                          <div className="bg-light rounded-3 p-2 mb-3 small">
                            <div className="fw-semibold text-secondary mb-1">
                              <i className="bi bi-clock-history me-1" />
                              Weekly Fixed Schedule:
                            </div>
                            {schedules.length > 0 ? (
                              <ul className="list-unstyled mb-0 ps-2">
                                {schedules.map((line, idx) => (
                                  <li key={idx} className="text-dark">
                                    • {line}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-muted fst-italic">No fixed sessions set</span>
                            )}
                          </div>
                        </div>

                        <div className="d-flex align-items-center justify-content-between pt-2 border-top mt-auto">
                          <span className="small text-muted">
                            Scheduled: <strong>{c.totalSessions ?? 0}</strong> sessions
                          </span>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary fw-semibold px-3"
                            onClick={() => setSelectedClassId(c.classId)}
                          >
                            <i className="bi bi-calendar3 me-1" />
                            View & Edit Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* STEP 2: CLASS SELECTED -> SHOW SCHEDULE DIRECTLY */
        <ScheduleWorkspace
          key={`${role}:${selectedClass.classId}`}
          role={role}
          lockedClassId={selectedClass.classId}
          defaultRoom={selectedClass.room}
          onSessionMutated={() => setReload((r) => r + 1)}
        />
      )}
    </>
  );
}
