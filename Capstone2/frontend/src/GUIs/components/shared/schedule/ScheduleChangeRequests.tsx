import {useEffect,useRef,useState} from 'react';
import {useSelectedUser} from '../../../hooks/useSelectedUser';
import type {ScheduleSession} from '../../../../BLL/models/ScheduleSession';
import type {ScheduleChangeCapabilities,ScheduleChangeInput,ScheduleChangePreview,ScheduleChangeRequest,ScheduleDecisionInput} from '../../../../BLL/models/ScheduleChangeRequest';
import {ScheduleChangeApiError,scheduleChangeRequestApi as api} from '../../../../api/scheduleChangeRequestApi';
import './schedule-change-requests.css';

const message = (x: unknown) => x instanceof Error ? x.message : 'Không thực hiện được yêu cầu.';
const kinds = {reschedule:'Dời buổi',cancel:'Hủy buổi',makeup:'Học bù buổi đã hủy'};
const booking = (x: ScheduleChangeRequest['original'] | null) => x ? `${x.sessionDate} ${x.startTime}–${x.endTime}, ${x.room || 'Chưa xếp phòng'} (${x.status})` : 'Không có destination';
const phase = (r: ScheduleChangeRequest) => r.status === 'pending' && r.reviewedBy !== null ? 'claimed' : r.status;
const statusLabels = {all:'Tất cả',pending:'Pending · Chưa nhận',claimed:'Claimed · Đã nhận',approved:'Approved',rejected:'Rejected'};
const auditTime = (value: string) => new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Bangkok',dateStyle:'short',timeStyle:'medium'}).format(new Date(value)) + ' (UTC+7)';
const requestsChanged = () => window.dispatchEvent(new Event('edutrack:schedule-requests-changed'));
export function ScheduleChangeRequests(props: {mode: 'teacher' | 'reviewer'; session?: ScheduleSession}) {
  const {user,permission} = useSelectedUser();
  return <Panel key={`${user?.userId ?? 'anonymous'}:${permission?.join(',')}:${props.mode}:${props.session?.sessionId ?? 'list'}`} {...props} />;
}
function Panel({mode,session}: {mode: 'teacher' | 'reviewer';session?: ScheduleSession}) {
  const [capState,setCapState] = useState<{value: ScheduleChangeCapabilities | null;error: string | null;status?: number} | null>(null);
  const [capReload,setCapReload] = useState(0);
  const caps = capState?.value ?? null;
  const [listState,setListState] = useState<{key: string;rows: ScheduleChangeRequest[];error: string | null} | null>(null);
  const [selected,setSelected] = useState<ScheduleChangeRequest | null>(null), [error,setError] = useState(''), [notice,setNotice] = useState('');
  const [open,setOpen] = useState(!session), [busy,setBusy] = useState(false), pending = useRef(false), mounted = useRef(true);
  const [reload,setReload] = useState(0), [filter,setFilter] = useState('all');
  const listKey = `${caps?.currentUserId}:${mode}:${session?.sessionId ?? 'all'}:${reload}`;
  const rows = listState?.key === listKey ? listState.rows : [];
  const listLoading = listState?.key !== listKey;
  const listError = listState?.key === listKey ? listState.error : null;
  const visibleRows = rows.filter(r => (!session || r.session.sessionId === session.sessionId) && (filter === 'all' || phase(r) === filter));
  // Keep server precision until a time field is explicitly edited. Native pickers
  // display seconds; changing only date/room must retain the original TIME(6).
  const [form,setForm] = useState({changeKind:(session?.status === 'cancelled' ? 'makeup' : 'reschedule') as ScheduleChangeInput['changeKind'],proposedSessionDate:session?.sessionDate ?? '',proposedStartTime:session?.startTime ?? '',proposedEndTime:session?.endTime ?? '',proposedRoom:session?.room ?? '',reason:''});
  const [submission,setSubmission] = useState<{input: ScheduleChangeInput;preview: ScheduleChangePreview} | null>(null);
  const [decision,setDecision] = useState<ScheduleDecisionInput>({decision:'approved',reviewNotes:''}), [decisionPreview,setDecisionPreview] = useState<ScheduleChangePreview | null>(null);
  const clientKey = useRef(crypto.randomUUID());
  useEffect(() => {mounted.current = true;return () => {mounted.current = false;};},[]);
  useEffect(() => {const refresh = () => setReload(x => x+1);window.addEventListener('edutrack:schedule-requests-changed',refresh);
    return () => window.removeEventListener('edutrack:schedule-requests-changed',refresh);},[]);
  useEffect(() => {
    const abort = new AbortController(); api.capabilities(abort.signal).then(x => {if (!abort.signal.aborted) setCapState({value:x,error:null});})
      .catch(e => {if (!abort.signal.aborted) setCapState({value:null,error:message(e),status:e instanceof ScheduleChangeApiError ? e.status : undefined});});
    return () => abort.abort();
  },[session,capReload]);
  useEffect(() => {
    if (!caps || session && !open) return;
    const abort = new AbortController();api.list(abort.signal).then(x => {if (!abort.signal.aborted) setListState({key:listKey,rows:x,error:null});})
      .catch(e => {if (!abort.signal.aborted) setListState({key:listKey,rows:[],error:message(e)});});
    return () => abort.abort();
  },[caps,session,open,listKey]);
  async function run(action: () => Promise<void>) {
    if (pending.current) return;pending.current = true;setBusy(true);setError('');setNotice('');
    try {await action();} catch(e) {if (mounted.current) {
      setError(message(e));
      if (e instanceof ScheduleChangeApiError && e.status === 409) {setSubmission(null);setDecisionPreview(null);setReload(x => x+1);}
    }} finally {pending.current = false;if (mounted.current) setBusy(false);}
  }
  function update(key: keyof typeof form,value: string) {setForm(f => ({...f,[key]:value}));setSubmission(null);clientKey.current = crypto.randomUUID();}
  async function previewSubmit() {
    const input: ScheduleChangeInput = {sessionId:session!.sessionId,...form,clientRequestKey:clientKey.current,proposedRoom:form.proposedRoom.trim() || null};
    if (input.changeKind === 'cancel') {input.proposedSessionDate = null;input.proposedStartTime = null;input.proposedEndTime = null;input.proposedRoom = null;}
    const preview = await api.preview(input);if (mounted.current) setSubmission({input,preview});
  }
  async function submit() {
    if (!submission) return;
    const result = await api.submit({...submission.input,previewToken:submission.preview.previewToken});
    if (mounted.current) {setSelected(result);setSubmission(null);setNotice(`Đã gửi ${result.requestCode}; lịch chính thức giữ nguyên.`);}
    requestsChanged();
  }
  async function select(row: ScheduleChangeRequest) {const fresh = await api.get(row.requestId);if (mounted.current) {setSelected(fresh);setDecisionPreview(null);setDecision({decision:'approved',reviewNotes:''});}}
  async function confirmDecision() {
    if (!selected || !decisionPreview) return;
    const result = await api.decide(selected.requestId,{...decision,previewToken:decisionPreview.previewToken});
    if (mounted.current) {setSelected(result);setDecisionPreview(null);setNotice(result.appliedAt ? 'Đã duyệt và áp dụng lịch trên cùng Session.' : 'Đã từ chối; lịch chính thức giữ nguyên.');}
    requestsChanged();
    if (result.appliedAt) window.dispatchEvent(new CustomEvent('edutrack:schedule-applied',{detail:{sessionId:result.session.sessionId}}));
  }
  if (!caps) {
    if (session && capState?.status && [401,403,404].includes(capState.status)) return null;
    return <section className="schedule-change-requests border rounded-3 p-3 mb-3 bg-white" aria-label="Yêu cầu đổi lịch phiên học">
      {capState?.error ? <><p role="alert">{capState.error}</p><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {setCapState(null);setCapReload(x => x+1);}}>Thử lại quyền đổi lịch</button></> : <p role="status">Đang tải quyền đổi lịch…</p>}
    </section>;
  }
  if (mode === 'teacher' && !caps.canPreview || mode === 'reviewer' && !caps.canViewAll) return null;
  const selfReview = selected?.requestedBy === caps.currentUserId;
  const claimedByMe = selected?.reviewedBy === caps.currentUserId;
  const claimedByOther = selected?.reviewedBy !== null && selected?.reviewedBy !== undefined && !claimedByMe;
  return <section className="schedule-change-requests border rounded-3 p-3 mb-3 bg-white" aria-label="Yêu cầu đổi lịch phiên học">
    <div className="d-flex gap-2 align-items-center flex-wrap"><h3 className="h6 mb-0">Yêu cầu đổi lịch phiên học</h3>
      {session && <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setOpen(x => !x)}>{open ? 'Đóng yêu cầu đổi lịch' : 'Dời / Hủy / Học bù'}</button>}</div>
    {caps.blocker && <p className="text-warning small mt-2" role="status">{caps.blocker}</p>}
    {open && <>
      {error && <p role="alert" className="text-danger">{error}</p>}{notice && <p role="status" className="text-success">{notice}</p>}
      {busy && <p role="status" aria-live="polite">Đang xử lý yêu cầu…</p>}
      {session && <form onSubmit={e => {e.preventDefault();void run(previewSubmit);}} className="mt-3">
        <p>Session #{session.sessionId} · {session.className} · Planned {session.plannedOccurrenceDate || 'chưa mapping'}</p>
        <fieldset disabled={busy || session.hasAttendance || session.status === 'completed'}>
          <div className="schedule-management-fields">
            <label>Loại yêu cầu<select aria-label="Loại yêu cầu" className="form-select" value={form.changeKind} onChange={e => update('changeKind',e.target.value)}>{Object.entries(kinds).filter(([key]) => session.status === 'cancelled' ? key === 'makeup' : key !== 'makeup').map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            {form.changeKind !== 'cancel' && <>
              <label>Ngày đề xuất<input aria-label="Ngày đề xuất" className="form-control" type="date" required value={form.proposedSessionDate} onChange={e => update('proposedSessionDate',e.target.value)} /></label>
              <label>Giờ bắt đầu đề xuất<input aria-label="Giờ bắt đầu đề xuất" className="form-control" type="time" step="1" required value={form.proposedStartTime.slice(0,8)} onChange={e => update('proposedStartTime',e.target.value)} /></label>
              <label>Giờ kết thúc đề xuất<input aria-label="Giờ kết thúc đề xuất" className="form-control" type="time" step="1" required value={form.proposedEndTime.slice(0,8)} onChange={e => update('proposedEndTime',e.target.value)} /></label>
              <label>Phòng đề xuất<input aria-label="Phòng đề xuất" className="form-control" maxLength={50} value={form.proposedRoom} onChange={e => update('proposedRoom',e.target.value)} /></label>
            </>}
          </div>
          <label className="d-block mt-2">Lý do<textarea aria-label="Lý do đổi lịch" className="form-control" required maxLength={2000} value={form.reason} onChange={e => update('reason',e.target.value)} /></label>
          <button type="submit" className="btn btn-outline-primary mt-2">Preview yêu cầu</button>
        </fieldset>
        {(session.hasAttendance || session.status === 'completed') && <p>Không được đổi buổi completed hoặc đã có Attendance.</p>}
        {submission && <div className="border rounded p-2 mt-2" data-change-preview>
          <p>Actual: {booking(submission.preview.session.actual)}</p><p>Đề xuất: {booking(submission.preview.proposed)}</p>
          {submission.preview.reasons.map(r => <p key={r} className="text-danger">{r}</p>)}
          <button type="button" disabled={busy || !caps.canSubmit || !submission.preview.allowed} className="btn btn-primary" onClick={() => void run(submit)}>Xác nhận gửi yêu cầu</button>
        </div>}
      </form>}
      <div className="d-flex gap-2 flex-wrap mt-3"><label>Trạng thái yêu cầu<select aria-label="Trạng thái yêu cầu đổi lịch" className="form-select form-select-sm" value={filter} onChange={e => setFilter(e.target.value)}>{Object.entries(statusLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <button type="button" className="btn btn-sm btn-outline-secondary align-self-end" disabled={busy} onClick={() => {setError('');setReload(x => x+1);}}>Tải lại yêu cầu</button></div>
      {listLoading ? <p role="status" className="mt-3">Đang tải yêu cầu đổi lịch…</p> : listError ? <p role="alert" className="text-danger mt-3">{listError}</p> : visibleRows.length === 0 && <p role="status" className="mt-3">{rows.length ? 'Không có yêu cầu phù hợp bộ lọc.' : 'Chưa có yêu cầu đổi lịch.'}</p>}
      <div className="table-responsive"><table className="table table-sm mt-2"><thead><tr><th>Request</th><th>Session</th><th>Loại</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead>
        <tbody>{visibleRows.map(r => <tr key={r.requestId} data-change-request={r.requestId}><td>{r.requestCode}</td><td>#{r.session.sessionId}</td><td>{kinds[r.changeKind]}</td><td>{statusLabels[phase(r)]}{r.appliedAt ? ' · đã áp dụng' : ' · chưa áp dụng'}</td><td><button type="button" className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => void run(() => select(r))}>Xem yêu cầu #{r.requestId}</button></td></tr>)}</tbody></table></div>
      {selected && <div className="border rounded p-3" data-change-detail={selected.requestId}>
        <h4 className="h6">{selected.requestCode} · {statusLabels[phase(selected)]} ({selected.status}){selected.appliedAt ? ' · đã áp dụng' : ' · chưa áp dụng'}</h4>
        <p>Session #{selected.session.sessionId} · Planned {selected.session.plannedOccurrenceDate} · Source version #{selected.session.scheduleVersionId}</p>
        <p>Gửi lúc: {auditTime(selected.createdAt)}</p>
        {selected.reviewedBy !== null && <p>Người xem xét #{selected.reviewedBy}{selected.reviewedAt ? ` · ${auditTime(selected.reviewedAt)}` : ''}</p>}
        <p data-applied-at={selected.appliedAt ?? ''}>AppliedAt: {selected.appliedAt ? auditTime(selected.appliedAt) : 'Chưa áp dụng'}</p>
        <div className="schedule-change-bookings"><p>Gốc: {booking(selected.original)}</p><p>Đề xuất: {booking(selected.proposed)}</p><p>Hiện tại: {booking(selected.session.actual)}</p></div><p>Lý do: {selected.reason}</p>
        {selected.reviewNotes && <p>Review: {selected.reviewNotes}</p>}
        <button type="button" className="btn btn-sm btn-outline-secondary mb-2" disabled={busy} onClick={() => void run(() => select(selected))}>Tải lại chi tiết</button>
        {mode === 'reviewer' && selected.status === 'pending' && <>
          {selfReview && <p className="text-warning">Không được tự duyệt yêu cầu của mình.</p>}
          {claimedByOther && <p className="text-warning">Yêu cầu đang do người khác xem xét.</p>}
          <button type="button" className="btn btn-outline-secondary" disabled={busy || !caps.canReview || selfReview || selected.reviewedBy !== null} onClick={() => void run(async () => {const result = await api.claim(selected.requestId);if (mounted.current) {setSelected(result);setDecisionPreview(null);}requestsChanged();})}>{claimedByMe ? 'Đã nhận xem xét' : 'Nhận xem xét'}</button>
          <label className="d-block mt-2">Quyết định<select aria-label="Quyết định đổi lịch" className="form-select" value={decision.decision} onChange={e => {setDecision(x => ({...x,decision:e.target.value as ScheduleDecisionInput['decision']}));setDecisionPreview(null);}}><option value="approved">Approve và áp dụng</option><option value="rejected">Reject</option></select></label>
          <label className="d-block">Ghi chú review<textarea aria-label="Ghi chú review" className="form-control" maxLength={2000} value={decision.reviewNotes ?? ''} onChange={e => {setDecision(x => ({...x,reviewNotes:e.target.value}));setDecisionPreview(null);}} /></label>
          <button type="button" className="btn btn-outline-primary mt-2" disabled={busy || !caps.canReview || selfReview || !claimedByMe} onClick={() => void run(async () => {const result = await api.decisionPreview(selected.requestId,decision);if (mounted.current) setDecisionPreview(result);})}>Preview quyết định</button>
          {decisionPreview && <div className="mt-2" data-decision-preview>{decisionPreview.reasons.map(r => <p key={r} className="text-danger">{r}</p>)}<p>{decision.decision === 'approved' ? 'Approve sẽ áp dụng trên chính Session này.' : 'Reject giữ nguyên Session.'}</p>
            <button type="button" className="btn btn-primary" disabled={busy || !decisionPreview.allowed || decision.decision === 'approved' && !caps.canApply} onClick={() => void run(confirmDecision)}>Xác nhận quyết định</button></div>}
        </>}
      </div>}
    </>}
  </section>;
}
