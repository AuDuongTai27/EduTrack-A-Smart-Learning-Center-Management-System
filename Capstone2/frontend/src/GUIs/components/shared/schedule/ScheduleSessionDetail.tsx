import { useEffect, useRef } from 'react';
import type { ScheduleSession } from '../../../../BLL/models/ScheduleSession';
import { displayScheduleDate, scheduleStatus } from '../../../../BLL/services/scheduleViewService';
import {ScheduleChangeRequests} from './ScheduleChangeRequests';

export function ScheduleSessionDetail({session, now, onClose}: {session: ScheduleSession; now: Date; onClose: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => { dialog.close(); previous?.focus(); };
  }, []);
  const status = scheduleStatus(session, now);
  const fields = [
    ['Class', session.className], ['Subject', session.subjectName || 'Chưa có môn học'],
    ['Ngày', displayScheduleDate(session.sessionDate)], ['Giờ (Việt Nam, UTC+7)', `${session.startTime} – ${session.endTime}`],
    ['Teacher', session.teachers.map(p => p.name).join(', ') || 'Chưa phân công'],
    ['TA', session.teachingAssistants.map(p => p.name).join(', ') || 'Chưa phân công'], ['Room', session.room || 'Chưa xếp phòng'],
    ['Điểm danh', session.hasAttendance ? 'Đã có bản ghi điểm danh' : 'Chưa có bản ghi điểm danh'],
    ...(session.plannedOccurrenceDate ? [['Ngày dự kiến gốc', displayScheduleDate(session.plannedOccurrenceDate)]] : []),
    ...(session.scheduleVersionId ? [['Version nguồn', String(session.scheduleVersionId)]] : []),
  ];
  return <dialog ref={ref} className="et-schedule-detail" aria-labelledby="et-session-detail-title" onCancel={onClose}
    onClick={e => {if (e.target === ref.current) onClose();}}>
    <div className="et-schedule-detail-body">
      <div className="et-schedule-detail-heading"><h2 id="et-session-detail-title">Chi tiết phiên học #{session.sessionId}</h2>
        <button type="button" onClick={onClose} aria-label="Đóng chi tiết phiên học">Đóng</button></div>
      <p><span className={`et-schedule-badge et-status-${status.key}`}>{status.label}</span></p>
      <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="et-schedule-note">Teacher và TA hiển thị theo phân công hiện tại của lớp.</p>
      <ScheduleChangeRequests mode="teacher" session={session} />
    </div>
  </dialog>;
}
