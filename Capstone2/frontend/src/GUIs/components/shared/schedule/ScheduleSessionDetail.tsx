import ModalIcon from '../../Common/ModalIcon';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ScheduleRole, ScheduleSession } from '../../../../BLL/models/ScheduleSession';
import { displayScheduleDate } from '../../../../BLL/services/scheduleViewService';
import { scheduleManagementDAL } from '../../../../DAL/scheduleManagementDAL';

export function ScheduleSessionDetail({
  session,
  role = 'student',
  onClose,
  onMutated,
}: {
  session: ScheduleSession;
  now?: Date;
  role?: ScheduleRole;
  onClose: () => void;
  onMutated?: (targetDate?: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const isManager = role === 'center-manager' || role === 'admin-staff';
  const isLocked = session.hasAttendance || session.status === 'completed';

  const [sessionDate, setSessionDate] = useState(session.sessionDate);
  const [startTime, setStartTime] = useState(session.startTime.slice(0, 5));
  const [endTime, setEndTime] = useState(session.endTime.slice(0, 5));
  const [room, setRoom] = useState(session.room || '');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    dialog.focus({ preventScroll: true });
    return () => { dialog.close(); previous?.focus(); };
  }, []);

  const fields = [
    ['Class', session.className], ['Subject', session.subjectName || 'No subject'],
    ['Date', displayScheduleDate(session.sessionDate)], ['Time', `${session.startTime.slice(0, 5)} – ${session.endTime.slice(0, 5)}`],
    ['Teacher', session.teachers.map(p => p.name).join(', ') || 'Unassigned'],
    ['TA', session.teachingAssistants.map(p => p.name).join(', ') || 'Unassigned'], ['Room', session.room || 'Unassigned'],
  ];

  async function handleReschedule(e: FormEvent) {
    e.preventDefault();
    if (busy || isLocked) return;
    if (!sessionDate || !startTime || !endTime || startTime >= endTime) {
      setError('Please select a valid date and ensure the start time is before the end time.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await scheduleManagementDAL.updateSessionDirect(session.sessionId, {
        sessionDate,
        startTime,
        endTime,
        room: room.trim() || null,
        reason: reason.trim() || null,
      });
      window.dispatchEvent(new CustomEvent('edutrack:schedule-applied', { detail: { sessionId: session.sessionId } }));
      onMutated?.(sessionDate);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot reschedule session.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (busy || isLocked) return;
    setBusy(true);
    setError('');
    try {
      await scheduleManagementDAL.deleteSessionDirect(session.sessionId);
      window.dispatchEvent(new CustomEvent('edutrack:schedule-applied', { detail: { sessionId: session.sessionId } }));
      onMutated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot delete session.');
    } finally {
      setBusy(false);
    }
  }

  return <dialog ref={ref} tabIndex={-1} className="edu-modal edu-modal-native et-schedule-detail" aria-labelledby="et-session-detail-title" onCancel={onClose}
    onClick={e => {if (e.target === ref.current) onClose();}}>
    <div className="et-schedule-detail-body">
      <div className="et-schedule-detail-heading"><h2 id="et-session-detail-title"><ModalIcon name="schedule" />Session Details</h2>
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close session details" /></div>
      <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>

      {isManager && (
        <section className="border rounded-3 p-3 mt-3 bg-light">
          <h3 className="h6 fw-bold mb-2">
            <i className="bi bi-calendar2-range me-2 text-primary" />
            Adjust Session (Reschedule / Makeup Date / Delete)
          </h3>
          {isLocked ? (
            <div className="alert alert-warning mb-0 py-2 small">
              <i className="bi bi-lock-fill me-1" />
              This session has already been marked for attendance by the Teacher/TA or is completed, so it cannot be rescheduled or deleted.
            </div>
          ) : (
            <>
              {error && <div className="alert alert-danger py-2 small mb-2" role="alert">{error}</div>}
              <form onSubmit={handleReschedule}>
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold mb-1">New session date (any)</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      disabled={busy}
                      value={sessionDate}
                      onChange={e => setSessionDate(e.target.value)}
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold mb-1">Room</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={50}
                      disabled={busy}
                      placeholder="e.g. Room 201"
                      value={room}
                      onChange={e => setRoom(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold mb-1">Start time</label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      required
                      disabled={busy}
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold mb-1">End time</label>
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      required
                      disabled={busy}
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold mb-1">Adjustment reason (optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={500}
                      disabled={busy}
                      placeholder="e.g. Teacher had an unexpected conflict, moving to makeup session..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 border-top">
                  <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>
                    <i className="bi bi-check2-circle me-1" />
                    {busy ? 'Saving…' : 'Save & Move to This Date'}
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled={busy}
                      onClick={() => setConfirmDelete(true)}
                    >
                      <i className="bi bi-trash3 me-1" />
                      Delete this session
                    </button>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-danger fw-semibold">Confirm deleting this session?</span>
                      <button type="button" className="btn btn-sm btn-danger" disabled={busy} onClick={handleDelete}>
                        {busy ? 'Deleting…' : 'Yes, delete'}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => setConfirmDelete(false)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </form>
            </>
          )}
        </section>
      )}
    </div>
  </dialog>;
}
