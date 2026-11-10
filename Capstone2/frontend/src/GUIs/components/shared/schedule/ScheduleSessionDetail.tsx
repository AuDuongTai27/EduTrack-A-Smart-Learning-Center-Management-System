import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ScheduleRole, ScheduleSession } from '../../../../BLL/models/ScheduleSession';
import { displayScheduleDate, scheduleStatus } from '../../../../BLL/services/scheduleViewService';
import { scheduleManagementDAL } from '../../../../DAL/scheduleManagementDAL';

export function ScheduleSessionDetail({
  session,
  now,
  role = 'student',
  onClose,
  onMutated,
}: {
  session: ScheduleSession;
  now: Date;
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
    return () => { dialog.close(); previous?.focus(); };
  }, []);

  const status = scheduleStatus(session, now);
  const fields = [
    ['Class', session.className], ['Subject', session.subjectName || 'Chưa có môn học'],
    ['Ngày', displayScheduleDate(session.sessionDate)], ['Giờ (Việt Nam, UTC+7)', `${session.startTime.slice(0, 5)} – ${session.endTime.slice(0, 5)}`],
    ['Teacher', session.teachers.map(p => p.name).join(', ') || 'Chưa phân công'],
    ['TA', session.teachingAssistants.map(p => p.name).join(', ') || 'Chưa phân công'], ['Room', session.room || 'Chưa xếp phòng'],
    ['Điểm danh', session.hasAttendance ? 'Đã có bản ghi điểm danh (Đã khóa)' : 'Chưa điểm danh (Có thể điều chỉnh)'],
    ...(session.plannedOccurrenceDate ? [['Ngày dự kiến gốc', displayScheduleDate(session.plannedOccurrenceDate)]] : []),
  ];

  async function handleReschedule(e: FormEvent) {
    e.preventDefault();
    if (busy || isLocked) return;
    if (!sessionDate || !startTime || !endTime || startTime >= endTime) {
      setError('Vui lòng chọn ngày học hợp lệ và giờ bắt đầu trước giờ kết thúc.');
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
      setError(err instanceof Error ? err.message : 'Không thể dời lịch phiên học.');
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
      setError(err instanceof Error ? err.message : 'Không thể xóa phiên học.');
    } finally {
      setBusy(false);
    }
  }

  return <dialog ref={ref} className="et-schedule-detail" aria-labelledby="et-session-detail-title" onCancel={onClose}
    onClick={e => {if (e.target === ref.current) onClose();}}>
    <div className="et-schedule-detail-body">
      <div className="et-schedule-detail-heading"><h2 id="et-session-detail-title">Chi tiết phiên học #{session.sessionId}</h2>
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose} aria-label="Đóng chi tiết phiên học">Đóng</button></div>
      <p><span className={`et-schedule-badge et-status-${status.key}`}>{status.label}</span></p>
      <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="et-schedule-note">Khi phiên học được dời ngày/giờ hoặc xóa, danh sách buổi điểm danh của Giáo viên & Trợ giảng sẽ tự động cập nhật theo.</p>

      {isManager && (
        <section className="border rounded-3 p-3 mt-3 bg-light">
          <h3 className="h6 fw-bold mb-2">
            <i className="bi bi-calendar2-range me-2 text-primary" />
            Điều chỉnh phiên học (Rời lịch / Đổi ngày bù / Xóa buổi)
          </h3>
          {isLocked ? (
            <div className="alert alert-warning mb-0 py-2 small">
              <i className="bi bi-lock-fill me-1" />
              Phiên học này đã được Giáo viên/TA điểm danh hoặc đã hoàn thành nên không thể dời hoặc xóa.
            </div>
          ) : (
            <>
              {error && <div className="alert alert-danger py-2 small mb-2" role="alert">{error}</div>}
              <form onSubmit={handleReschedule}>
                <p className="small text-muted mb-2">
                  Nếu giáo viên bận hoặc cần đổi sang buổi học bù vào <strong>bất kỳ ngày/giờ nào</strong>, hãy chọn ngày giờ mới bên dưới (buổi học ở ngày cũ sẽ tự động chuyển sang ngày mới):
                </p>
                <div className="row g-2">
                  <div className="col-12 col-sm-6">
                    <label className="form-label small fw-semibold mb-1">Ngày học mới (bất kỳ)</label>
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
                    <label className="form-label small fw-semibold mb-1">Phòng học</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={50}
                      disabled={busy}
                      placeholder="VD: Room 201"
                      value={room}
                      onChange={e => setRoom(e.target.value)}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold mb-1">Giờ bắt đầu</label>
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
                    <label className="form-label small fw-semibold mb-1">Giờ kết thúc</label>
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
                    <label className="form-label small fw-semibold mb-1">Lý do điều chỉnh (tùy chọn)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      maxLength={500}
                      disabled={busy}
                      placeholder="VD: Thầy bận đột xuất chiều nay, chuyển sang dạy bù..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-2 border-top">
                  <button type="submit" className="btn btn-sm btn-primary" disabled={busy}>
                    <i className="bi bi-check2-circle me-1" />
                    {busy ? 'Đang lưu…' : 'Lưu & Chuyển sang ngày này'}
                  </button>

                  {!confirmDelete ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled={busy}
                      onClick={() => setConfirmDelete(true)}
                    >
                      <i className="bi bi-trash3 me-1" />
                      Xóa buổi học này
                    </button>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-danger fw-semibold">Xác nhận xóa buổi này?</span>
                      <button type="button" className="btn btn-sm btn-danger" disabled={busy} onClick={handleDelete}>
                        {busy ? 'Đang xóa…' : 'Đồng ý xóa'}
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => setConfirmDelete(false)}>
                        Hủy
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
