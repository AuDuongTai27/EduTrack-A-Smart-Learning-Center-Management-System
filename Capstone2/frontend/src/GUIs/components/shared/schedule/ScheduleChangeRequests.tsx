import {useEffect,useRef,useState} from 'react';
import {useSelectedUser} from '../../../hooks/useSelectedUser';
import type {ScheduleSession} from '../../../../BLL/models/ScheduleSession';
import type {ScheduleChangeCapabilities,ScheduleChangeInput,ScheduleChangePreview,ScheduleChangeRequest,ScheduleDecisionInput} from '../../../../BLL/models/ScheduleChangeRequest';
import {ScheduleChangeApiError,scheduleChangeRequestApi as api} from '../../../../api/scheduleChangeRequestApi';
import './schedule-change-requests.css';

const message = (x: unknown) => x instanceof Error ? x.message : 'Failed to process request.';
const kinds = {reschedule:'Reschedule',cancel:'Cancel',makeup:'Makeup session'};
const booking = (x: ScheduleChangeRequest['original'] | null) => x ? `${x.sessionDate} ${x.startTime}–${x.endTime}, ${x.room || 'Unassigned'} (${x.status})` : 'No destination';
const phase = (r: ScheduleChangeRequest) => r.status === 'pending' && r.reviewedBy !== null ? 'claimed' : r.status;
const statusLabels = {all:'All',pending:'Pending · Unclaimed',claimed:'Claimed',approved:'Approved',rejected:'Rejected'};
const auditTime = (value: string) => new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Bangkok',dateStyle:'short',timeStyle:'medium'}).format(new Date(value));
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
    if (mounted.current) {setSelected(result);setSubmission(null);setNotice(`Submitted ${result.requestCode}; official schedule remains unchanged.`);}
    requestsChanged();
  }
  async function select(row: ScheduleChangeRequest) {const fresh = await api.get(row.requestId);if (mounted.current) {setSelected(fresh);setDecisionPreview(null);setDecision({decision:'approved',reviewNotes:''});}}
  async function confirmDecision() {
    if (!selected || !decisionPreview) return;
    const result = await api.decide(selected.requestId,{...decision,previewToken:decisionPreview.previewToken});
    if (mounted.current) {setSelected(result);setDecisionPreview(null);setNotice(result.appliedAt ? 'Approved and applied schedule on the same Session.' : 'Rejected; official schedule remains unchanged.');}
    requestsChanged();
    if (result.appliedAt) window.dispatchEvent(new CustomEvent('edutrack:schedule-applied',{detail:{sessionId:result.session.sessionId}}));
  }
  if (!caps) {
    if (session && capState?.status && [401,403,404].includes(capState.status)) return null;
    return <section className="schedule-change-requests border rounded-3 p-3 mb-3 bg-white" aria-label="Session schedule change requests">
      {capState?.error ? <><p role="alert">{capState.error}</p><button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => {setCapState(null);setCapReload(x => x+1);}}>Retry schedule change permissions</button></> : <p role="status">Loading schedule change permissions…</p>}
    </section>;
  }
  if (mode === 'teacher' && !caps.canPreview || mode === 'reviewer' && !caps.canViewAll) return null;
  const selfReview = selected?.requestedBy === caps.currentUserId;
  const claimedByMe = selected?.reviewedBy === caps.currentUserId;
  const claimedByOther = selected?.reviewedBy !== null && selected?.reviewedBy !== undefined && !claimedByMe;
  return <section className="schedule-change-requests border rounded-3 p-3 mb-3 bg-white" aria-label="Session schedule change requests">
    <div className="d-flex gap-2 align-items-center flex-wrap"><h3 className="h6 mb-0">Session Schedule Change Requests</h3>
      {session && <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => setOpen(x => !x)}>{open ? 'Close schedule change requests' : 'Reschedule / Cancel / Makeup'}</button>}</div>
    {caps.blocker && <p className="text-warning small mt-2" role="status">{caps.blocker}</p>}
    {open && <>
      {error && <p role="alert" className="text-danger">{error}</p>}{notice && <p role="status" className="text-success">{notice}</p>}
      {busy && <p role="status" aria-live="polite">Processing request…</p>}
      {session && <form onSubmit={e => {e.preventDefault();void run(previewSubmit);}} className="mt-3">
        <p>Session #{session.sessionId} · {session.className} · Planned {session.plannedOccurrenceDate || 'not mapped'}</p>
        <fieldset disabled={busy || session.hasAttendance || session.status === 'completed'}>
          <div className="schedule-management-fields">
            <label>Request Type<select aria-label="Request type" className="form-select" value={form.changeKind} onChange={e => update('changeKind',e.target.value)}>{Object.entries(kinds).filter(([key]) => session.status === 'cancelled' ? key === 'makeup' : key !== 'makeup').map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            {form.changeKind !== 'cancel' && <>
              <label>Proposed Date<input aria-label="Proposed date" className="form-control" type="date" required value={form.proposedSessionDate} onChange={e => update('proposedSessionDate',e.target.value)} /></label>
              <label>Proposed Start Time<input aria-label="Proposed start time" className="form-control" type="time" step="1" required value={form.proposedStartTime.slice(0,8)} onChange={e => update('proposedStartTime',e.target.value)} /></label>
              <label>Proposed End Time<input aria-label="Proposed end time" className="form-control" type="time" step="1" required value={form.proposedEndTime.slice(0,8)} onChange={e => update('proposedEndTime',e.target.value)} /></label>
              <label>Proposed Room<input aria-label="Proposed room" className="form-control" maxLength={50} value={form.proposedRoom} onChange={e => update('proposedRoom',e.target.value)} /></label>
            </>}
          </div>
          <label className="d-block mt-2">Reason<textarea aria-label="Reason for schedule change" className="form-control" required maxLength={2000} value={form.reason} onChange={e => update('reason',e.target.value)} /></label>
          <button type="submit" className="btn btn-outline-primary mt-2">Preview Request</button>
        </fieldset>
        {(session.hasAttendance || session.status === 'completed') && <p>Cannot change completed sessions or sessions with attendance recorded.</p>}
        {submission && <div className="border rounded p-2 mt-2" data-change-preview>
          <p>Actual: {booking(submission.preview.session.actual)}</p><p>Proposed: {booking(submission.preview.proposed)}</p>
          {submission.preview.reasons.map(r => <p key={r} className="text-danger">{r}</p>)}
          <button type="button" disabled={busy || !caps.canSubmit || !submission.preview.allowed} className="btn btn-primary" onClick={() => void run(submit)}>Confirm Submit Request</button>
        </div>}
      </form>}
      <div className="d-flex gap-2 flex-wrap mt-3"><label>Request Status<select aria-label="Schedule change request status" className="form-select form-select-sm" value={filter} onChange={e => setFilter(e.target.value)}>{Object.entries(statusLabels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <button type="button" className="btn btn-sm btn-outline-secondary align-self-end" disabled={busy} onClick={() => {setError('');setReload(x => x+1);}}>Reload requests</button></div>
      {listLoading ? <p role="status" className="mt-3">Loading schedule change requests…</p> : listError ? <p role="alert" className="text-danger mt-3">{listError}</p> : visibleRows.length === 0 && <p role="status" className="mt-3">{rows.length ? 'No requests match the filter.' : 'No schedule change requests yet.'}</p>}
      <div className="table-responsive"><table className="table table-sm mt-2"><thead><tr><th>Request</th><th>Session</th><th>Type</th><th>Status</th><th>Details</th></tr></thead>
        <tbody>{visibleRows.map(r => <tr key={r.requestId} data-change-request={r.requestId}><td>{r.requestCode}</td><td>#{r.session.sessionId}</td><td>{kinds[r.changeKind]}</td><td>{statusLabels[phase(r)]}{r.appliedAt ? ' · applied' : ' · not applied'}</td><td><button type="button" className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => void run(() => select(r))}>View request #{r.requestId}</button></td></tr>)}</tbody></table></div>
      {selected && <div className="border rounded p-3" data-change-detail={selected.requestId}>
        <h4 className="h6">{selected.requestCode} · {statusLabels[phase(selected)]} ({selected.status}){selected.appliedAt ? ' · applied' : ' · not applied'}</h4>
        <p>Session #{selected.session.sessionId} · Planned {selected.session.plannedOccurrenceDate} · Source version #{selected.session.scheduleVersionId}</p>
        <p>Submitted at: {auditTime(selected.createdAt)}</p>
        {selected.reviewedBy !== null && <p>Reviewer #{selected.reviewedBy}{selected.reviewedAt ? ` · ${auditTime(selected.reviewedAt)}` : ''}</p>}
        <p data-applied-at={selected.appliedAt ?? ''}>AppliedAt: {selected.appliedAt ? auditTime(selected.appliedAt) : 'Not applied'}</p>
        <div className="schedule-change-bookings"><p>Original: {booking(selected.original)}</p><p>Proposed: {booking(selected.proposed)}</p><p>Current: {booking(selected.session.actual)}</p></div><p>Reason: {selected.reason}</p>
        {selected.reviewNotes && <p>Review: {selected.reviewNotes}</p>}
        <button type="button" className="btn btn-sm btn-outline-secondary mb-2" disabled={busy} onClick={() => void run(() => select(selected))}>Reload details</button>
        {mode === 'reviewer' && selected.status === 'pending' && <>
          {selfReview && <p className="text-warning">You cannot approve your own request.</p>}
          {claimedByOther && <p className="text-warning">Request is being reviewed by another person.</p>}
          <button type="button" className="btn btn-outline-secondary" disabled={busy || !caps.canReview || selfReview || selected.reviewedBy !== null} onClick={() => void run(async () => {const result = await api.claim(selected.requestId);if (mounted.current) {setSelected(result);setDecisionPreview(null);}requestsChanged();})}>{claimedByMe ? 'Review Claimed' : 'Claim for Review'}</button>
          <label className="d-block mt-2">Decision<select aria-label="Schedule change decision" className="form-select" value={decision.decision} onChange={e => {setDecision(x => ({...x,decision:e.target.value as ScheduleDecisionInput['decision']}));setDecisionPreview(null);}}><option value="approved">Approve and apply</option><option value="rejected">Reject</option></select></label>
          <label className="d-block">Review notes<textarea aria-label="Review notes" className="form-control" maxLength={2000} value={decision.reviewNotes ?? ''} onChange={e => {setDecision(x => ({...x,reviewNotes:e.target.value}));setDecisionPreview(null);}} /></label>
          <button type="button" className="btn btn-outline-primary mt-2" disabled={busy || !caps.canReview || selfReview || !claimedByMe} onClick={() => void run(async () => {const result = await api.decisionPreview(selected.requestId,decision);if (mounted.current) setDecisionPreview(result);})}>Preview Decision</button>
          {decisionPreview && <div className="mt-2" data-decision-preview>{decisionPreview.reasons.map(r => <p key={r} className="text-danger">{r}</p>)}<p>{decision.decision === 'approved' ? 'Approve will apply to this Session directly.' : 'Reject will keep Session unchanged.'}</p>
            <button type="button" className="btn btn-primary" disabled={busy || !decisionPreview.allowed || decision.decision === 'approved' && !caps.canApply} onClick={() => void run(confirmDecision)}>Confirm Decision</button></div>}
        </>}
      </div>}
    </>}
  </section>;
}
