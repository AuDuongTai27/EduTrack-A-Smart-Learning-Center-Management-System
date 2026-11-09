import {useEffect, useRef, useState, type FormEvent} from 'react';
import type {ScheduleCapabilities, ScheduleGenerationInput, ScheduleGenerationPreview, ScheduleTemplate, ScheduleTemplateInput, ScheduleTemplatePreview} from '../../../../BLL/models/ScheduleManagement';
import {scheduleManagementDAL as api} from '../../../../DAL/scheduleManagementDAL';
import {addScheduleDays, vietnamClock} from '../../../../BLL/services/scheduleViewService';
import {useAuthContext} from '../../../../contexts/AuthContext';

const days = [['Monday','Thứ Hai'],['Tuesday','Thứ Ba'],['Wednesday','Thứ Tư'],['Thursday','Thứ Năm'],['Friday','Thứ Sáu'],['Saturday','Thứ Bảy'],['Sunday','Chủ Nhật']];
const outcomes = {eligible:'Hợp lệ',existing:'Đã tồn tại',conflict:'Xung đột',outside_class:'Ngoài thời gian Class',created:'Đã tạo'};
const errorText = (cause: unknown) => cause instanceof Error ? cause.message : 'Không thực hiện được yêu cầu. Vui lòng tải lại.';
const emptyForm = () => ({dayOfWeek:'Monday',startTime:'',endTime:'',room:'',effectiveFrom:''});
const dayLabel = (value: string) => days.find(([key]) => key === value)?.[1] || value;

export function ScheduleManagement({onCreated}: {onCreated: () => void}) {
  const {user} = useAuthContext();
  return <ManagementPanel key={user?.userId ?? 'anonymous'} onCreated={onCreated} />;
}
function ManagementPanel({onCreated}: {onCreated: () => void}) {
  const [capabilities,setCapabilities] = useState<ScheduleCapabilities | null>(null);
  const [classId,setClassId] = useState('');
  const [templates,setTemplates] = useState<ScheduleTemplate[] | null>(null);
  const [error,setError] = useState(''); const [notice,setNotice] = useState(''); const [reload,setReload] = useState(0);
  const [busy,setBusy] = useState(false); const pending = useRef(false); const mounted = useRef(true);
  const [editing,setEditing] = useState<ScheduleTemplate | null>(null);
  const [operation,setOperation] = useState<ScheduleTemplateInput['operation']>('create');
  const [form,setForm] = useState(emptyForm);
  const [templatePreview,setTemplatePreview] = useState<{input: ScheduleTemplateInput; result: ScheduleTemplatePreview} | null>(null);
  const [mode,setMode] = useState<'single' | 'month'>('single'); const [scheduleId,setScheduleId] = useState('');
  const [date,setDate] = useState(''); const [month,setMonth] = useState(() => vietnamClock().date.slice(0,7));
  const [preview,setPreview] = useState<{input: ScheduleGenerationInput; result: ScheduleGenerationPreview; keys: string[]} | null>(null);
  const [confirmed,setConfirmed] = useState(false);
  useEffect(() => {mounted.current = true; return () => {mounted.current = false;};}, []);
  useEffect(() => {
    const abort = new AbortController();
    api.capabilities(abort.signal).then(data => {if (!abort.signal.aborted) setCapabilities(data);})
      .catch(cause => {if (!abort.signal.aborted) setError(errorText(cause));});
    return () => abort.abort();
  }, [reload]);
  useEffect(() => {
    if (!classId) return;
    const abort = new AbortController();
    api.templates(Number(classId),abort.signal).then(data => {if (!abort.signal.aborted) setTemplates(data);})
      .catch(cause => {if (!abort.signal.aborted) setError(errorText(cause));});
    return () => abort.abort();
  }, [classId,reload]);
  function invalidate() {setPreview(null);setTemplatePreview(null);setConfirmed(false);setNotice('');setError('');}
  function selectClass(value: string) {setClassId(value);setTemplates(null);setScheduleId('');setEditing(null);setOperation('create');setForm(emptyForm());invalidate();}
  function changeForm(key: keyof typeof form, value: string) {setForm(previous => ({...previous,[key]:value}));invalidate();}
  async function run(action: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;setBusy(true);setError('');setNotice('');
    try {await action();} catch (cause) {if (mounted.current) setError(errorText(cause));}
    finally {pending.current = false;if (mounted.current) setBusy(false);}
  }
  function refreshTemplates() {setTemplates(null);setEditing(null);setOperation('create');setForm(emptyForm());setTemplatePreview(null);setPreview(null);setReload(value => value+1);}
  function beginChange(root: ScheduleTemplate, action: 'replace' | 'retire') {
    const last = root.versions.at(-1)!;
    const from = [capabilities!.earliestEffectiveFrom,last.effectiveTo || addScheduleDays(last.effectiveFrom,7)].sort().at(-1)!;
    setEditing(root);setOperation(action);setForm({dayOfWeek:last.dayOfWeek,startTime:last.startTime,endTime:last.endTime,room:last.room || '',effectiveFrom:from});invalidate();
  }
  async function previewTemplate(event: FormEvent) {
    event.preventDefault();setTemplatePreview(null);
    if (operation !== 'retire' && (!form.startTime || !form.endTime || form.startTime >= form.endTime)) {setError('Giờ bắt đầu phải trước giờ kết thúc.');return;}
    const input: ScheduleTemplateInput = {classId:Number(classId),operation,...form,effectiveFrom:form.effectiveFrom || capabilities!.earliestEffectiveFrom,
      room:form.room.trim() || null,...(editing ? {scheduleId:editing.scheduleId,version:editing.version} : {})};
    await run(async () => {const result = await api.previewTemplate(input);if (mounted.current) setTemplatePreview({input,result});});
  }
  async function buildPreview(event: FormEvent) {
    event.preventDefault();setPreview(null);setConfirmed(false);
    const input: ScheduleGenerationInput = mode === 'single' ? {classId:Number(classId),mode,scheduleId:Number(scheduleId),sessionDate:date} :
      {classId:Number(classId),mode,year:Number(month.slice(0,4)),month:Number(month.slice(5,7))};
    await run(async () => {const result = await api.preview(input);if (mounted.current) setPreview({input,result,keys:result.rows.filter(r => r.outcome === 'eligible').map(r => r.key)});});
  }
  const selectedClass = capabilities?.classes.find(c => String(c.classId) === classId);
  const canManage = capabilities?.canManageTemplates === true;const canCreate = capabilities?.canCreateSessions === true;
  return <div className="schedule-management border rounded-4 bg-white p-3 mb-3" aria-label="Quản lý Schedule">
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2"><h2 className="h5 mb-0">Lịch cố định & phiên học</h2>
      <button type="button" className="btn btn-sm btn-outline-secondary" disabled={busy} onClick={() => {invalidate();refreshTemplates();}}>Tải lại quản lý</button></div>
    {error && <p className="alert alert-danger" role="alert">{error}</p>}{notice && <p className="alert alert-success" role="status">{notice}</p>}
    {!capabilities ? <p role="status">Đang tải quyền và danh sách Class…</p> : <>
      <p className="text-muted small">Mỗi ca có một phiên dự kiến mỗi tuần. Đổi lịch cố định giữ nguyên các phiên đã tạo; Teacher xem trước và xác nhận các phiên còn thiếu.</p>
      <label className="d-block mb-3">Class<select aria-label="Class quản lý lịch" className="form-select" value={classId} disabled={busy} onChange={e => selectClass(e.target.value)}>
        <option value="">Chọn Class</option>{capabilities.classes.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}</select></label>
      {capabilities.classes.length === 0 && <p>Chưa có Class hợp lệ trong phạm vi được phân quyền.</p>}
      {selectedClass && <><p className="small text-muted">Thời gian Class: {selectedClass.startDate} – {selectedClass.endDate || 'chưa có ngày kết thúc'} · Giờ Việt Nam (GMT+7)</p>
        {!templates ? <p role="status">Đang tải lịch cố định…</p> : <>
          <div className="table-responsive mb-3"><table className="table table-sm schedule-template-table"><caption>Các ca lịch cố định và lịch sử version</caption>
            <thead><tr><th>Ca / lịch</th><th>Giờ / phòng</th><th>Timeline</th>{canManage && <th>Thao tác</th>}</tr></thead>
            <tbody>{templates.map(s => <tr key={s.scheduleId} data-template-id={s.scheduleId}>
              <td>#{s.scheduleId} · {dayLabel(s.dayOfWeek)}<div className="small">{s.hasSessions ? 'Đã có phiên tham chiếu' : 'Chưa có phiên'}</div></td>
              <td>{s.startTime.slice(0,8)}–{s.endTime.slice(0,8)}<div>{s.room || 'Chưa xếp phòng'}</div></td>
              <td><details><summary>{s.versions.length} version</summary>{s.versions.map(v => <div key={v.scheduleVersionId} className="small mb-2" data-version-id={v.scheduleVersionId}>
                <strong>#{v.scheduleVersionId}</strong> · {v.effectiveFrom} → {v.effectiveTo || 'chưa định ngày kết thúc'} (không gồm ngày cuối)<br />
                {dayLabel(v.dayOfWeek)} · {v.startTime}–{v.endTime} · {v.room || 'Chưa xếp phòng'}</div>)}</details></td>
              {canManage && <td><div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-sm btn-outline-primary" disabled={busy} onClick={() => beginChange(s,'replace')}>Đổi lịch tương lai</button>
                <button type="button" className="btn btn-sm btn-outline-danger" disabled={busy || s.versions.at(-1)?.effectiveTo !== null} onClick={() => beginChange(s,'retire')}>Ngừng áp dụng</button></div></td>}
            </tr>)}</tbody></table></div>
          {templates.length === 0 && <p>Class chưa có lịch cố định.</p>}
          {canManage && <><p className="small text-muted">Version có hiệu lực từ Thứ Hai của tuần tương lai. Phiên đã generate, đã dời/hủy hoặc có Attendance được giữ nguyên; muốn thay các phiên đó cần yêu cầu riêng ở Phase 3.</p>
            <form onSubmit={previewTemplate} aria-label="Cấp lịch cố định" className="mb-3"><fieldset disabled={busy}>
              <legend className="h6">{operation === 'retire' ? `Ngừng ca #${editing?.scheduleId}` : editing ? `Version mới cho ca #${editing.scheduleId}` : 'Thêm ca lịch cố định'}</legend>
              <div className="schedule-management-fields"><label>Hiệu lực từ Thứ Hai<input aria-label="Tuần hiệu lực" type="date" className="form-control" required min={capabilities.earliestEffectiveFrom} step={7}
                value={form.effectiveFrom || capabilities.earliestEffectiveFrom} onChange={e => changeForm('effectiveFrom',e.target.value)} /></label>
                {operation !== 'retire' && <>
                  <label>Thứ<select aria-label="Thứ template" className="form-select" value={form.dayOfWeek} onChange={e => changeForm('dayOfWeek',e.target.value)}>{days.map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
                  <label>Bắt đầu<input aria-label="Giờ bắt đầu template" className="form-control" type="time" step={1} required value={form.startTime} onChange={e => changeForm('startTime',e.target.value)} /></label>
                  <label>Kết thúc<input aria-label="Giờ kết thúc template" className="form-control" type="time" step={1} required value={form.endTime} onChange={e => changeForm('endTime',e.target.value)} /></label>
                  <label>Phòng<input aria-label="Phòng template" className="form-control" maxLength={50} value={form.room} onChange={e => changeForm('room',e.target.value)} placeholder="Nhập phòng được cấp" /></label>
                </>}
              </div><button className="btn btn-outline-primary mt-2" type="submit">{busy ? 'Đang kiểm tra…' : 'Xem trước thay đổi lịch'}</button>
              {editing && <button type="button" className="btn btn-outline-secondary mt-2 ms-2" onClick={() => {setEditing(null);setOperation('create');setForm(emptyForm());invalidate();}}>Thêm ca mới</button>}
            </fieldset></form>
            {templatePreview && <div className="schedule-template-preview border rounded p-3 mb-4" aria-label="Preview thay đổi lịch">
              <h3 className="h6">Preview {templatePreview.result.operation === 'retire' ? 'ngừng áp dụng' : 'version lịch cố định'} từ {templatePreview.result.effectiveFrom}</h3>
              <p>{templatePreview.result.message}</p>
              {templatePreview.result.retainedSessions.length > 0 && <div className="table-responsive schedule-preview-scroll"><table className="table table-sm">
                <thead><tr><th>Phiên / version gốc</th><th>Dự kiến gốc</th><th>Lịch thực tế giữ nguyên</th><th>Trạng thái</th></tr></thead>
                <tbody>{templatePreview.result.retainedSessions.map(s => <tr key={s.sessionId} data-retained-session={s.sessionId}><td>#{s.sessionId} / v{s.scheduleVersionId}</td>
                  <td>{s.plannedOccurrenceDate}</td><td>{s.sessionDate} {s.startTime}–{s.endTime} · {s.room || 'Chưa xếp phòng'}</td><td>{s.status}{s.hasAttendance && ' · Đã điểm danh'}</td></tr>)}</tbody>
              </table></div>}
              <button type="button" className="btn btn-primary mt-2" disabled={busy} onClick={() => run(async () => {
                const result = await api.confirmTemplate({...templatePreview.input,previewToken:templatePreview.result.previewToken});if (!mounted.current) return;
                refreshTemplates();setNotice(`Đã lưu ${result.operation === 'retire' ? 'mốc ngừng áp dụng' : 'version lịch cố định'}. Giữ nguyên ${result.retainedSessions.length} phiên đã tạo.`);
              })}>{busy ? 'Đang xác nhận…' : 'Xác nhận thay đổi lịch'}</button>
              <button type="button" className="btn btn-outline-secondary mt-2 ms-2" disabled={busy} onClick={() => setTemplatePreview(null)}>Đóng Preview lịch</button>
            </div>}
          </>}
          {canCreate && <><form aria-label="Tạo phiên học" onSubmit={buildPreview}><fieldset disabled={busy || templates.length === 0}><legend className="h6">Teacher tạo phiên học</legend>
            <div className="schedule-management-fields"><label>Chế độ<select aria-label="Chế độ tạo phiên" className="form-select" value={mode} onChange={e => {setMode(e.target.value as typeof mode);invalidate();}}><option value="single">Một phiên</option><option value="month">Theo tháng</option></select></label>
              {mode === 'single' ? <><label>Ca được cấp<select aria-label="Khung giờ được cấp" className="form-select" required value={scheduleId} onChange={e => {setScheduleId(e.target.value);invalidate();}}><option value="">Chọn ca</option>
                {templates.map(s => <option key={s.scheduleId} value={s.scheduleId}>#{s.scheduleId} · {dayLabel(s.dayOfWeek)} · {s.startTime.slice(0,5)}–{s.endTime.slice(0,5)}</option>)}
              </select></label><label>Ngày dự kiến<input aria-label="Ngày học" className="form-control" type="date" required value={date} onChange={e => {setDate(e.target.value);invalidate();}} /></label></> :
                <label>Tháng dự kiến<input aria-label="Tháng tạo phiên" className="form-control" type="month" min="2000-01" max="2100-12" required value={month} onChange={e => {setMonth(e.target.value);invalidate();}} /></label>}
            </div><p className="small mt-2">Preview chọn version theo tuần dự kiến. Phiên đã dời/hủy hoặc đã tạo theo version cũ vẫn được nhận diện và giữ nguyên.</p>
            <button type="submit" className="btn btn-outline-primary my-2">{busy ? 'Đang kiểm tra…' : 'Xem trước phiên học'}</button>
          </fieldset></form>
            {preview && <div className="schedule-generation-preview" aria-label="Preview phiên học"><h3 className="h6">{confirmed ? 'Kết quả xác nhận' : 'Preview — kiểm tra trước khi xác nhận'}</h3>
              <p className="small">{Object.entries(outcomes).map(([key,label]) => `${label}: ${preview.result.rows.filter(r => r.outcome === key).length}`).join(' · ')}</p>
              <div className="table-responsive schedule-preview-scroll"><table className="table table-sm"><thead><tr><th>Tuần / dự kiến gốc</th><th>Lịch thực tế</th><th>Phòng</th><th>Kết quả / version</th></tr></thead>
                <tbody>{preview.result.rows.map(r => <tr key={r.key} data-outcome={r.outcome} data-occurrence-key={r.key}><td>{r.occurrenceWeekStart}<div className="small">Gốc: {r.plannedOccurrenceDate}</div>
                  {r.proposedPlannedDate && r.proposedPlannedDate !== r.plannedOccurrenceDate && <div className="small">Template mới: {r.proposedPlannedDate}</div>}</td><td>{r.sessionDate}<div>{r.startTime}–{r.endTime}</div></td>
                  <td>{r.room || 'Chưa xếp phòng'}</td><td>{outcomes[r.outcome]} · v{r.scheduleVersionId}<div className="small">{r.reason}{r.sessionId && ` (#${r.sessionId})`} · {r.status}</div></td></tr>)}</tbody>
              </table></div>
              {!confirmed && <><p className="small">Chỉ tạo {preview.keys.length} occurrence hợp lệ đã xem trước. Giữ nguyên các phiên đã có; bỏ qua conflict/ngoài Class.</p>
                <button type="button" className="btn btn-primary mt-2" disabled={busy || preview.keys.length === 0} onClick={() => run(async () => {
                  const result = await api.confirm({...preview.input,previewToken:preview.result.previewToken,selectedKeys:preview.keys});if (!mounted.current) return;
                  setPreview({...preview,result});setConfirmed(true);setNotice(`Đã tạo ${result.created} phiên học chính thức.`);onCreated();
                })}>{busy ? 'Đang xác nhận…' : `Xác nhận tạo ${preview.keys.length} phiên`}</button>
                <button type="button" className="btn btn-outline-secondary mt-2 ms-2" disabled={busy} onClick={() => setPreview(null)}>Đóng Preview</button></>}
            </div>}
          </>}
        </>}
      </>}
    </>}
  </div>;
}
