import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../Common/PageHeader';
import Pagination from '../../Common/Pagination';
import { useNotificationInbox } from '../../../hooks/useNotificationInbox';
import { newest, notificationTime } from '../../../../BLL/services/notificationInbox';
import { notificationInboxApi, notificationRequest } from '../../../../api/notificationInboxApi';
import type { NotificationDto } from '../../../../BLL/models/NotificationDto';
import { userApi } from '../../../../api/userApi';
import { classApi } from '../../../../api/classApi';
import type { UserDto } from '../../../../BLL/models/UserDto';
import type { ClassDto } from '../../../../BLL/models/ClassDto';
import './notifications.css';

const roles = ['center_manager', 'admin_staff', 'teacher', 'teaching_assistant', 'student', 'parent'];
const types = ['announcement', 'academic', 'tuition', 'reminder', 'schedule', 'system', 'homework', 'class'];
const EMPTY: NotificationDto[] = [];
const message = (error: unknown) => error instanceof Error ? error.message : 'Thao tác thất bại.';

function ComposeNotification({ onSent, onClose }: { onSent: () => void; onClose: () => void }) {
  const [scope, setScope] = useState('all'); const [target, setTarget] = useState('');
  const [users, setUsers] = useState<UserDto[]>([]); const [classes, setClasses] = useState<ClassDto[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const inFlight = useRef(false);
  useEffect(() => {
    let active = true;
    if (scope === 'user' || scope === 'class') {
      void (scope === 'user' ? userApi.getAll().then(rows => { if (active) setUsers(rows.filter(u => u.status === 'active' && u.roles?.some(r => roles.includes(r)))); })
        : classApi.getAll().then(rows => { if (active) setClasses(rows.filter(c => ['active', 'upcoming'].includes(c.status))); }))
        .catch(e => { if (active) setLookupError(message(e)); });
    }
    return () => { active = false; };
  }, [scope]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (inFlight.current) return;
    const form = new FormData(event.currentTarget);
    inFlight.current = true; setBusy(true); setError(null);
    try {
      await notificationRequest('management/notifications', 'POST', undefined, {
        title: String(form.get('title')).trim(), content: String(form.get('content')).trim(), type: form.get('type'),
        targetScope: scope, targetRole: scope === 'role' ? target : null,
        userId: scope === 'user' ? Number(target) : null, classId: scope === 'class' ? Number(target) : null,
      });
      onSent();
    } catch (e) { setError(message(e)); } finally { inFlight.current = false; setBusy(false); }
  }
  return <section className="card mb-3" aria-label="Gửi thông báo"><form onSubmit={submit}>
    <h5>Gửi thông báo</h5>
    <label>Tiêu đề<input name="title" className="form-control" required maxLength={200} /></label>
    <label>Nội dung<textarea name="content" className="form-control" required maxLength={4000} rows={4} /></label>
    <label>Loại<select name="type" className="form-select">{types.map(t => <option key={t}>{t}</option>)}</select></label>
    <label>Phạm vi<select className="form-select" value={scope} onChange={e => { setScope(e.target.value); setTarget(''); setLookupError(null); setUsers([]); setClasses([]); }}>
      <option value="all">Tất cả</option><option value="role">Theo vai trò</option><option value="class">Theo lớp</option><option value="user">Cá nhân</option>
    </select></label>
    {scope !== 'all' && <label>Người nhận<select className="form-select" required value={target} onChange={e => setTarget(e.target.value)}>
      <option value="">Chọn người nhận</option>
      {scope === 'role' ? roles.map(r => <option key={r}>{r}</option>) : scope === 'user'
        ? users.map(u => <option key={u.userId} value={u.userId}>{u.fullName} ({u.userCode})</option>)
        : classes.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
    </select></label>}
    {lookupError && <p role="alert" className="text-danger">{lookupError}</p>}{error && <p role="alert" className="text-danger">{error}</p>}
    <div className="ntf-actions"><button className="btn btn-primary" disabled={busy || !!lookupError}>Gửi</button>
      <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={onClose}>Đóng</button></div>
  </form></section>;
}

export default function NotificationInboxPage() {
  const inbox = useNotificationInbox();
  // Reset selection, compose and sent history immediately at every identity/role boundary.
  return <NotificationPage key={`${inbox.role}:${inbox.data?.identity.userId ?? 'unverified'}`} inbox={inbox} />;
}
function NotificationPage({ inbox }: { inbox: ReturnType<typeof useNotificationInbox> }) {
  const { data, loading, error, store, busy, manager } = inbox;
  const [params, setParams] = useSearchParams(); const rawId = params.get('notificationId');
  const selectedId = rawId && /^\d+$/.test(rawId) && Number.isSafeInteger(Number(rawId)) ? Number(rawId) : null;
  const [tab, setTab] = useState<'inbox' | 'sent' | 'trash'>('inbox');
  const [sent, setSent] = useState<NotificationDto[]>([]); const [sentLoading, setSentLoading] = useState(false);
  const [sentError, setSentError] = useState<string | null>(null); const [actionError, setActionError] = useState<string | null>(null);
  const [undo, setUndo] = useState<number | null>(null); const [success, setSuccess] = useState<string | null>(null);
  const [compose, setCompose] = useState(false); const [search, setSearch] = useState('');
  const [type, setType] = useState('all'); const [status, setStatus] = useState('all'); const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1); const attempted = useRef('');
  useEffect(() => {
    if (tab !== 'sent' || !data) return;
    const controller = new AbortController();
    void notificationInboxApi.sent(controller.signal).then(rows => { if (!controller.signal.aborted) { setSent(rows); setSentError(null); } }).catch(e => { if (!controller.signal.aborted) { setSent([]); setSentError(message(e)); } })
      .finally(() => { if (!controller.signal.aborted) setSentLoading(false); });
    return () => controller.abort();
  }, [tab, data]);
  const rows = tab === 'sent' ? sent : tab === 'trash' ? data?.trash ?? EMPTY : data?.inbox ?? EMPTY;
  const selected = rows.find(n => n.notificationId === selectedId);
  useEffect(() => {
    const attemptKey = `${tab}:${rawId}`;
    if (tab === 'inbox' && selected && !selected.isRead && !busy && attempted.current !== attemptKey) {
      attempted.current = attemptKey;
      void store.mutate('read', selected.notificationId).catch(e => setActionError(message(e)));
    }
  }, [selected, rawId, tab, busy, store]);
  const filtered = useMemo(() => rows.filter(n => `${n.title} ${n.content}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'))
    && (type === 'all' || n.type === type) && (tab === 'sent' || status === 'all' || n.isRead === (status === 'read')))
    .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title, 'vi') : (sort === 'oldest' ? -1 : 1) * newest(a, b)), [rows, search, type, status, sort, tab]);
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / 5)));
  async function act(operation: 'read' | 'read-all' | 'delete' | 'restore', id?: number) {
    setActionError(null); setSuccess(null);
    try {
      await store.mutate(operation, id);
      if (operation === 'delete') { setUndo(id!); setParams({}); setSuccess('Đã chuyển vào Thùng rác.'); }
      else if (operation === 'restore') { setUndo(null); setSuccess('Đã khôi phục vào Hộp thư đến.'); }
    } catch (e) { setActionError(message(e)); }
  }
  function switchTab(next: typeof tab) { if (next === tab) return; if (next === 'sent') { setSent([]); setSentError(null); setSentLoading(true); } setTab(next); setParams({}); setPage(1); setActionError(null); attempted.current = ''; }
  return <div className="ntf-scope ntf-page">
    <PageHeader title="Thông báo" breadcrumbItems={[{ label: 'Thông báo' }]} action={manager && data && <button className="btn btn-primary" onClick={() => setCompose(!compose)}>Gửi thông báo</button>} />
    {compose && data && <ComposeNotification onClose={() => setCompose(false)} onSent={() => { setCompose(false); setSuccess('Đã gửi thông báo.'); switchTab('sent'); void store.refresh(); }} />}
    {error && <p role="alert" className="alert alert-warning">{error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={store.refresh}>Thử lại</button></p>}
    {actionError && <p role="alert" className="alert alert-danger">{actionError}</p>}
    {success && <p role="status" className="alert alert-success">{success}</p>}
    {undo && <button type="button" className="btn btn-link mb-3" disabled={busy} onClick={() => void act('restore', undo)}>Hoàn tác</button>}
    <div className="ntf-tabs" role="tablist" aria-label="Hộp thư">
      {(['inbox', ...(manager ? ['sent', 'trash'] : [])] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} type="button"
        className={`btn ${tab === t ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => switchTab(t as typeof tab)}>
        {t === 'inbox' ? `Hộp thư đến (${data?.unreadCount ?? '—'} chưa đọc)` : t === 'sent' ? 'Đã gửi' : 'Thùng rác'}
      </button>)}
    </div>
    <div className="ntf-toolbar">
      <input className="form-control" style={{ maxWidth: 300 }} aria-label="Tìm thông báo" placeholder="Tìm tiêu đề, nội dung..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      <select className="form-select w-auto" aria-label="Loại thông báo" value={type} onChange={e => { setType(e.target.value); setPage(1); }}><option value="all">Tất cả loại</option>{types.map(t => <option key={t}>{t}</option>)}</select>
      {tab !== 'sent' && <select className="form-select w-auto" aria-label="Trạng thái đọc" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="all">Tất cả trạng thái</option><option value="unread">Chưa đọc</option><option value="read">Đã đọc</option></select>}
      <select className="form-select w-auto" aria-label="Sắp xếp" value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="title">Tiêu đề A–Z</option></select>
      <button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={store.refresh}>Tải lại</button>
      {tab === 'inbox' && <button type="button" className="btn btn-outline-primary" disabled={busy || !data?.unreadCount} onClick={() => void act('read-all')}>Đọc tất cả</button>}
    </div>
    {(loading && !data) || sentLoading ? <p role="status">Đang tải thông báo...</p> : <div className="ntf-layout">
      <section className="card" aria-label="Danh sách thông báo">
        {sentError ? <p role="alert" className="p-3 text-danger">{sentError}</p> : !filtered.length ? <p className="p-3">Không có thông báo.</p>
          : filtered.slice((safePage - 1) * 5, safePage * 5).map(n => <button type="button" key={n.notificationId} className={`ntf-list-button ${tab !== 'sent' && !n.isRead ? 'ntf-unread' : ''}`}
            aria-pressed={selectedId === n.notificationId} onClick={() => { attempted.current = ''; setParams({ notificationId: String(n.notificationId) }); }}>
            <strong>{n.title}</strong><p className="ntf-clamp my-1">{n.content}</p><small>{notificationTime(n.createdAt)} · {tab === 'sent' ? `${n.recipientCount ?? 0} người nhận` : n.senderName || 'Không có thông tin người gửi'}</small>
            {tab !== 'sent' && <small className="d-block">{n.isRead ? 'Đã đọc' : 'Chưa đọc'}</small>}
          </button>)}
        {!!filtered.length && <div className="p-3"><Pagination currentPage={safePage} totalItems={filtered.length} entriesPerPage={5} itemLabel="thông báo" onPageChange={setPage} /></div>}
      </section>
      <section className="card ntf-detail" aria-label="Chi tiết thông báo">
        {selected ? <><h4>{selected.title}</h4><p className="text-muted">{selected.senderName || 'Không có thông tin người gửi'} · {notificationTime(selected.createdAt)}</p>
          {tab === 'sent' && <p>Phạm vi: {selected.targetScope} {selected.targetRole} · {selected.recipientCount ?? 0} người nhận</p>}
          <div className="ntf-body">{selected.content}</div>
          {selected.readAt && tab !== 'sent' && <small className="d-block mt-3">Đã đọc: {notificationTime(selected.readAt)}</small>}
          {selected.deletedAt && <small className="d-block">Đã xóa: {notificationTime(selected.deletedAt)}</small>}
          <div className="ntf-actions">
            {tab === 'inbox' && !selected.isRead && <button type="button" className="btn btn-outline-primary" disabled={busy} onClick={() => void act('read', selected.notificationId)}>Đánh dấu đã đọc</button>}
            {manager && tab === 'inbox' && <button type="button" className="btn btn-outline-danger" disabled={busy || !selected.isRead} onClick={() => void act('delete', selected.notificationId)}>Chuyển vào Thùng rác</button>}
            {manager && tab === 'trash' && <button type="button" className="btn btn-outline-primary" disabled={busy} onClick={() => void act('restore', selected.notificationId)}>Khôi phục</button>}
          </div></> : <p role={rawId ? 'alert' : 'status'}>{rawId ? 'Không tìm thấy thông báo trong hộp thư này hoặc bạn không có quyền xem.' : 'Chọn một thông báo để xem nội dung.'}</p>}
      </section>
    </div>}
  </div>;
}
