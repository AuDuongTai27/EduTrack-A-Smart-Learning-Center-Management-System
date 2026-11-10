import { useEffect, useRef, useState, type FormEvent } from 'react';
import { classApi } from '../../../../api/classApi';
import { notificationRequest, type NotificationRecipientOption } from '../../../../api/notificationInboxApi';
import type { ClassDto } from '../../../../BLL/models/ClassDto';
import { notificationDraftErrors, notificationRecipientRoles, studentParentNotificationHint, notificationScopes, notificationTypes, type NotificationScope } from '../../../../BLL/services/notificationPresentation';
import RecipientCombobox from './RecipientCombobox';

// Kept mounted while closed: Cancel, close and Escape all retain the same draft
// for the selected sender. A successful send clears it; identity switch unmounts it.
export default function ComposeNotificationModal({ open, onSent, onClose }: { open: boolean; onSent: () => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null); const titleInput = useRef<HTMLInputElement>(null); const inFlight = useRef(false);
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [type, setType] = useState('announcement'); const [scope, setScope] = useState<NotificationScope>('all');
  const [target, setTarget] = useState(''); const [recipient, setRecipient] = useState<NotificationRecipientOption | null>(null);
  const [classes, setClasses] = useState<ClassDto[]>([]); const [lookupBusy, setLookupBusy] = useState(false);
  const [lookupError, setLookupError] = useState(''); const [retry, setRetry] = useState(0);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState({ title: false, content: false, target: false });
  const errors = notificationDraftErrors(title, content, scope, scope === 'user' ? String(recipient?.userId ?? '') : target);
  const valid = !Object.values(errors).some(Boolean) && !!type && !(scope === 'class' && (lookupBusy || !!lookupError));
  useEffect(() => {
    const element = dialog.current;
    if (!open) { element?.close(); return; }
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal(); titleInput.current?.focus(); document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus(); };
  }, [open]);
  useEffect(() => {
    if (scope !== 'class') return;
    let active = true;
    void classApi.getAll().then(rows => { if (active) setClasses(rows.filter(c => ['active', 'upcoming'].includes(c.status))); })
      .catch(() => { if (active) setLookupError('Không tải được lớp học. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLookupBusy(false); });
    return () => { active = false; };
  }, [scope, retry]);
  function close() { if (!inFlight.current) onClose(); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (inFlight.current || !valid) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      await notificationRequest('management/notifications', 'POST', undefined, {
        title: title.trim(), content: content.trim(), type, targetScope: scope,
        targetRole: scope === 'role' ? target : null, userId: scope === 'user' ? recipient?.userId : null,
        classId: scope === 'class' ? Number(target) : null,
      });
      setTitle(''); setContent(''); setType('announcement'); setScope('all'); setTarget(''); setRecipient(null);
      setTouched({ title: false, content: false, target: false }); onSent();
    } catch (e) { setError(e instanceof Error && !e.message.startsWith('Failed to fetch') ? e.message : 'Không kết nối được máy chủ. Vui lòng thử lại.'); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const required = <span className="ntf-required" aria-hidden="true">*</span>;
  return <dialog ref={dialog} tabIndex={-1} className="ntf-scope ntf-compose" aria-modal="true" aria-label="Gửi thông báo" aria-labelledby="ntf-compose-title" aria-describedby="ntf-compose-hint"
    onCancel={e => { e.preventDefault(); close(); }} onKeyDown={e => {
      if (e.key !== 'Tab') return;
      const controls = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]'))
        .filter(control => control.getClientRects().length > 0);
      const first = controls[0]; const last = controls[controls.length - 1];
      if (!first) { e.preventDefault(); dialog.current?.focus(); }
      else if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }}>
    <form onSubmit={submit} noValidate aria-busy={busy}>
      <header className="ntf-compose-header"><div><h2 id="ntf-compose-title">Gửi thông báo</h2>
        <p id="ntf-compose-hint">Bản nháp được giữ khi đóng, đến khi gửi hoặc đổi tài khoản.</p></div>
        <button type="button" className="btn btn-outline-secondary" aria-label="Đóng form gửi thông báo" disabled={busy} onClick={close}>×</button></header>
      <div className="ntf-compose-body">
        <fieldset disabled={busy}><legend>Nội dung thông báo</legend>
          <div className="ntf-field"><label htmlFor="ntf-title">Tiêu đề {required}</label>
            <input ref={titleInput} id="ntf-title" name="title" className="form-control" required maxLength={200} value={title}
              aria-invalid={touched.title && !!errors.title} aria-describedby="ntf-title-help" onChange={e => setTitle(e.target.value)} onBlur={() => setTouched(t => ({ ...t, title: true }))} />
            <small id="ntf-title-help" className={touched.title && errors.title ? 'text-danger' : 'text-muted'}>{touched.title && errors.title || `${title.length}/200 ký tự`}</small></div>
          <div className="ntf-field"><label htmlFor="ntf-content">Nội dung {required}</label>
            <textarea id="ntf-content" name="content" className="form-control" required maxLength={4000} rows={5} value={content}
              aria-invalid={touched.content && !!errors.content} aria-describedby="ntf-content-help" onChange={e => setContent(e.target.value)} onBlur={() => setTouched(t => ({ ...t, content: true }))} />
            <small id="ntf-content-help" className={touched.content && errors.content ? 'text-danger' : 'text-muted'}>{touched.content && errors.content || `${content.length}/4000 ký tự`}</small></div>
          <div className="ntf-field"><label htmlFor="ntf-type">Loại thông báo {required}</label><select id="ntf-type" name="type" className="form-select" required value={type} onChange={e => setType(e.target.value)}>
            {Object.entries(notificationTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        </fieldset>
        <fieldset disabled={busy}><legend>Đối tượng nhận</legend>
          <div className="ntf-field"><label htmlFor="ntf-scope">Phạm vi</label><select id="ntf-scope" className="form-select" value={scope} onChange={e => {
            setScope(e.target.value as NotificationScope); setTarget(''); setRecipient(null); setLookupBusy(e.target.value === 'class'); setLookupError(''); setError(''); setTouched(t => ({ ...t, target: false }));
          }}>{Object.entries(notificationScopes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          {(scope === 'role' || scope === 'class') && <div className="ntf-field"><label htmlFor="ntf-target">{scope === 'role' ? 'Vai trò nhận' : 'Lớp học'} {required}</label>
            <select id="ntf-target" className="form-select" required value={target} aria-describedby={scope === 'role' && target === 'student' ? 'ntf-target-help ntf-student-parent-help' : 'ntf-target-help'} aria-invalid={touched.target && !!errors.target}
              disabled={busy || scope === 'class' && lookupBusy} onChange={e => { setTarget(e.target.value); setError(''); }} onBlur={() => setTouched(t => ({ ...t, target: true }))}>
              <option value="">{scope === 'role' ? 'Chọn vai trò nhận' : 'Chọn lớp học'}</option>
              {scope === 'role' ? Object.entries(notificationRecipientRoles).map(([value, label]) => <option key={value} value={value}>{label}</option>)
                : classes.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
            </select><small id="ntf-target-help" className="text-danger">{touched.target && errors.target}</small></div>}
          {scope === 'role' && target === 'student' && <p id="ntf-student-parent-help" className="ntf-role-hint">
            <strong>{notificationRecipientRoles.student}</strong><br />{studentParentNotificationHint}
          </p>}
          {scope === 'user' && <RecipientCombobox value={recipient} onChange={row => { setRecipient(row); setError(''); }} disabled={busy} />}
          {scope === 'class' && (lookupBusy ? <p role="status">Đang tải lớp học...</p> : lookupError ? <p role="alert" className="text-danger">{lookupError} <button type="button" className="btn btn-link" onClick={() => { setLookupBusy(true); setLookupError(''); setRetry(n => n + 1); }}>Thử lại</button></p>
            : !classes.length && <p role="status">Không có lớp học đang hoạt động hoặc sắp mở.</p>)}
          <p className="ntf-audience-hint">Học viên nhận thông báo thì phụ huynh có tài khoản hoạt động và liên kết hợp lệ cũng nhận. Người gửi chỉ theo dõi trong Đã gửi.</p>
        </fieldset>
        {error && <p role="alert" className="alert alert-danger">{error}</p>}
      </div>
      <footer className="ntf-compose-footer"><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={close}>Hủy</button>
        <button type="submit" className="btn btn-primary" disabled={busy || !valid}>{busy ? 'Đang gửi...' : 'Gửi thông báo'}</button></footer>
    </form>
  </dialog>;
}
