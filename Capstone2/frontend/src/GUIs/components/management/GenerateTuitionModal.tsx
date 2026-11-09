import { useEffect, useRef, useState } from "react";
import { classApi } from "../../../api/classApi";
import { gradeApi } from "../../../api/gradeApi";
import { tuitionGenerationApi, type GenerationPreview, type GenerationRequest } from "../../../api/tuitionGenerationApi";
import type { GradeDto } from "../../../BLL/models/GradeDto";
import type { ClassDto } from "../../../BLL/models/ClassDto";
import { tuitionMonthKey } from "../../../BLL/services/tuitionPolicyService";
import { formatVND } from "../../utils/formatCurrency";
import MoneyInput from "../Common/MoneyInput";
import "./GenerateTuitionModal.css";

const modeNames = { grade: "Toàn khối", class: "Toàn lớp", individual: "Từng học sinh" };
const outcomeNames: Record<string, string> = { eligible: "Có thể tạo", created: "Đã tạo", already_exists: "Đã có hóa đơn", ineligible: "Không đủ điều kiện" };
const dateLabel = (date?: string | null) => date ? date.slice(0, 10).split("-").reverse().join("/") : "Chưa xác định";

export default function GenerateTuitionModal({ close, saved }: { close: () => void; saved: () => void }) {
  const [year, month] = tuitionMonthKey(new Date()).split("-").map(Number);
  const [form, setForm] = useState<GenerationRequest>({ mode: "individual", gradeId: 0, periodMonth: month, periodYear: year });
  const [amount, setAmount] = useState("");
  const [catalogue, setCatalogue] = useState<{ grades: GradeDto[]; classes: ClassDto[] } | null>(null);
  const [revision, setRevision] = useState(0);
  const [candidateRevision, setCandidateRevision] = useState(0);
  const [candidateState, setCandidateState] = useState<{ key: string; data: GenerationPreview | null; error: string | null }>({ key: "", data: null, error: null });
  const [preview, setPreview] = useState<GenerationPreview | null>(null);
  const [result, setResult] = useState<GenerationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const guard = useRef(false);
  const summaryRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);
  const candidateKey = `${form.mode}:${form.gradeId}:${form.classId}:${form.periodMonth}:${form.periodYear}:${candidateRevision}`;
  const needsCandidates = form.mode === "individual" && !!form.gradeId && !!form.classId;
  const candidateLoading = needsCandidates && candidateState.key !== candidateKey;
  const candidates = candidateState.key === candidateKey ? candidateState.data : null;
  const candidateError = candidateState.key === candidateKey ? candidateState.error : null;
  useEffect(() => {
    let current = true;
    void Promise.all([gradeApi.getAll(), classApi.getAll()]).then(([grades, classes]) => { if (current) { setCatalogue({ grades, classes }); setError(null); } }, cause => { if (current) setError(cause instanceof Error ? cause.message : "Không tải được danh mục."); });
    return () => { current = false; };
  }, [revision]);
  useEffect(() => {
    let current = true;
    if (!form.classId || !form.gradeId || form.mode !== "individual") return;
    void tuitionGenerationApi.preview({ mode: "class", gradeId: form.gradeId, classId: form.classId, periodMonth: form.periodMonth, periodYear: form.periodYear }).then(data => {
      if (current) setCandidateState({ key: candidateKey, data, error: null });
    }, cause => { if (current) setCandidateState({ key: candidateKey, data: null, error: cause instanceof Error ? cause.message : "Không tải được enrollment." }); });
    return () => { current = false; };
  }, [form.mode, form.classId, form.gradeId, form.periodMonth, form.periodYear, candidateKey]);
  const request = { ...form, ...(form.mode === "individual" ? { amountDue: Number(amount) } : {}) };
  const change = (patch: Partial<GenerationRequest>) => { setForm(previous => ({ ...previous, ...patch })); setPreview(null); setResult(null); setError(null); };
  async function submit(confirm: boolean) {
    if (guard.current) return;
    guard.current = true; setBusy(true); setError(null);
    try {
      if (confirm && preview) { const data = await tuitionGenerationApi.confirm({ ...request, previewToken: preview.previewToken }); setResult(data); setPreview(null); saved(); }
      else { setResult(null); setPreview(await tuitionGenerationApi.preview(request)); }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Không xử lý được yêu cầu."); setPreview(null); }
    finally { guard.current = false; setBusy(false); }
  }
  const students = candidates?.rows.filter(row => row.enrollmentEligible && row.studentId != null) ?? [];
  const shown = result ?? preview;
  useEffect(() => {
    if (!shown) return;
    summaryRef.current?.scrollIntoView({ block: "start" });
    summaryRef.current?.focus({ preventScroll: true });
  }, [shown]);
  useEffect(() => {
    if (!error) return;
    errorRef.current?.scrollIntoView({ block: "start" });
    errorRef.current?.focus({ preventScroll: true });
  }, [error]);
  const monthlyFee = catalogue?.classes.find(c => c.classId === form.classId)?.tuitionFee;
  const resetAmount = () => setAmount(monthlyFee ? String(monthlyFee) : "");
  const excluded = candidates?.rows.filter(row => !row.enrollmentEligible) ?? [];
  return <div className="modal show d-block tuition-generation-modal" role="dialog" aria-modal="true" aria-label="Lập hóa đơn học phí" aria-labelledby="generation-title">
    <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
      <div className="modal-header"><h5 className="modal-title" id="generation-title">Lập hóa đơn</h5><button type="button" className="btn-close" disabled={busy} aria-label="Đóng lập hóa đơn" onClick={close} /></div>
      <div className="modal-body" aria-busy={busy}>
        {error && <div role="alert" className="alert alert-danger" tabIndex={-1} ref={errorRef}>{error} <button type="button" className="btn btn-link btn-sm" disabled={busy} onClick={() => { setRevision(v => v + 1); setCandidateRevision(v => v + 1); }}>Tải lại dữ liệu</button></div>}
        {!catalogue && !error && <p role="status">Đang tải danh sách khối và lớp...</p>}
        <section className="tuition-generation-config" aria-labelledby="generation-config-title">
        <h6 id="generation-config-title" className="mb-3">Thông tin hóa đơn</h6>
        <fieldset disabled={busy || !catalogue} className="row g-3">
          <div className="col-md-6"><label className="form-label" htmlFor="generation-mode">Chế độ</label><select id="generation-mode" className="form-select" value={form.mode} onChange={e => { change({ mode: e.target.value as GenerationRequest["mode"], classId: undefined, studentId: undefined }); setAmount(""); }}>
            <option value="grade">Toàn khối</option><option value="class">Toàn lớp</option><option value="individual">Từng học sinh</option></select></div>
          <div className="col-md-6"><label className="form-label" htmlFor="generation-grade">Khối lớp</label><select id="generation-grade" className="form-select" value={form.gradeId} onChange={e => { change({ gradeId: Number(e.target.value), classId: undefined, studentId: undefined }); setAmount(""); }}><option value={0}>-- Chọn khối --</option>{catalogue?.grades.map(g => <option key={g.gradeId} value={g.gradeId}>{g.gradeName}</option>)}</select></div>
          {form.mode !== "grade" && <div className="col-md-6"><label className="form-label" htmlFor="generation-class">Lớp học</label><select id="generation-class" className="form-select" value={form.classId ?? 0} onChange={e => { const id = Number(e.target.value); change({ classId: id || undefined, studentId: undefined }); setAmount(String(catalogue?.classes.find(c => c.classId === id)?.tuitionFee || "")); }}><option value={0}>-- Chọn lớp --</option>{catalogue?.classes.filter(c => c.gradeId === form.gradeId).map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}</select></div>}
          {form.mode === "individual" && <div className="col-md-6"><label className="form-label" htmlFor="generation-student">Học sinh</label><select id="generation-student" className="form-select" disabled={candidateLoading || !!candidateError} value={form.studentId ?? 0} onChange={e => { change({ studentId: Number(e.target.value) || undefined }); resetAmount(); }}><option value={0}>-- Chọn học sinh --</option>{students.map(row => <option key={row.studentId} value={row.studentId!}>{row.studentName}{row.outcome === "already_exists" ? " (đã có hóa đơn)" : ""}</option>)}</select>
            {candidateLoading && <small role="status">Đang tải học sinh theo kỳ...</small>}{candidateError && <div role="alert" className="text-danger">{candidateError} <button type="button" className="btn btn-link btn-sm" onClick={() => setCandidateRevision(v => v + 1)}>Thử lại</button></div>}{form.classId && !candidateLoading && !candidateError && !students.length ? <small>Không có học sinh đủ điều kiện trong kỳ này.</small> : null}</div>}
          <div className="col-md-6"><span className="form-label d-block" id="generation-period-label">Kỳ thu</span><div className="row g-2" role="group" aria-labelledby="generation-period-label">
            <div className="col-6"><label className="visually-hidden" htmlFor="generation-month">Tháng thu</label><select id="generation-month" className="form-select" value={form.periodMonth} onChange={e => { change({ periodMonth: Number(e.target.value), studentId: undefined }); resetAmount(); }}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>)}</select></div>
            <div className="col-6"><label className="visually-hidden" htmlFor="generation-year">Năm thu</label><input id="generation-year" className="form-control" type="text" inputMode="numeric" value={form.periodYear || ""} onChange={e => { change({ periodYear: Number(e.target.value), studentId: undefined }); resetAmount(); }} /></div>
          </div></div>
          {form.mode === "individual" && <div className="col-md-6"><label className="form-label" htmlFor="generation-amount">Số tiền thỏa thuận</label><MoneyInput id="generation-amount" value={amount} onValueChange={value => { setAmount(value); setPreview(null); setResult(null); setError(null); }} required /><small className="text-muted">Học phí lớp: {monthlyFee == null ? "Chưa chọn lớp" : formatVND(monthlyFee)}</small></div>}
        </fieldset>
        <details className="small text-muted mt-3"><summary>Cách tính học phí</summary><p className="mt-2 mb-1">Thu cố định theo tháng, dùng học phí riêng của từng lớp; không giảm theo điểm danh. Học sinh vào giữa tháng cần thỏa thuận riêng, không tự miễn phí hoặc gộp vào kỳ sau. Số tiền nhập thủ công vẫn phải qua kiểm tra ghi danh và phê duyệt hiện có.</p>{shown && <p className="mb-0">{shown.dueDatePolicy}</p>}</details>
        {excluded.length > 0 && <details className="small mt-2"><summary>{excluded.length} trường hợp chưa đủ điều kiện trong kỳ</summary><ul className="mt-2 mb-0">{excluded.map((row, i) => <li key={i}>{row.studentName}: {row.reason}</li>)}</ul></details>}
        </section>
        {shown && <section className="tuition-generation-preview" data-testid="generation-preview" aria-labelledby="generation-summary-title">
          <h6 id="generation-summary-title" tabIndex={-1} ref={summaryRef}>{result ? "Kết quả lập hóa đơn" : "Xem trước hóa đơn"}</h6>
          <p className="small text-muted">{modeNames[form.mode]} · {shown.gradeName} · {shown.periodMonth}/{shown.periodYear} · {shown.classCount} lớp · {shown.studentCount} học sinh</p>
          {result && <p role="status" className={`alert ${result.failed > 0 ? "alert-warning" : result.created > 0 ? "alert-success" : "alert-secondary"} py-2`}>{result.created > 0 ? `Đã tạo ${result.created} hóa đơn.` : "Không tạo hóa đơn mới."}{result.failed > 0 ? ` ${result.failed} trường hợp thất bại; cần đối soát.` : ""}</p>}
          <dl className="tuition-generation-stats">
            <div><dt>{result ? "Đã tạo" : "Hóa đơn có thể tạo mới"}</dt><dd data-testid={result ? "generation-created" : "generation-eligible"}>{result ? shown.created : shown.eligibleCount}</dd></div>
            <div><dt>Đã có hóa đơn</dt><dd data-testid="generation-existing">{shown.alreadyExists}</dd></div>
            {shown.ineligible > 0 && <div><dt>Không đủ điều kiện</dt><dd data-testid="generation-ineligible">{shown.ineligible}</dd></div>}
            <div className="tuition-generation-stat-total"><dt>{result ? "Tổng tiền đã lập" : "Tổng tiền dự kiến"}</dt><dd data-testid="generation-total">{formatVND(shown.totalAmount)}</dd></div>
            <div><dt>Hạn thanh toán</dt><dd className="tuition-generation-date" data-testid="generation-due-date">{dateLabel(shown.dueDate)}</dd></div>
            {result && <div><dt>Thất bại</dt><dd data-testid="generation-failed">{shown.failed}</dd></div>}
          </dl>
          {preview?.eligibleCount === 0 && <p className="alert alert-info py-2 small" role="status" data-testid="generation-zero">Không có hóa đơn mới đủ điều kiện để tạo.{shown.alreadyExists > 0 ? ` Có ${shown.alreadyExists} hóa đơn đã tồn tại.` : ""}{shown.ineligible > 0 ? ` Có ${shown.ineligible} trường hợp không đủ điều kiện.` : ""} Xem chi tiết hoặc thay đổi lựa chọn rồi xem trước lại.</p>}
          {shown.alreadyExists > 0 && <p className="small text-muted">Hóa đơn đã có được bỏ qua, giữ nguyên tiền và hạn thanh toán.</p>}
          <details className="tuition-generation-details" key={result ? "result" : "preview"} data-testid="generation-details"><summary>Chi tiết theo lớp và học sinh</summary>
            {shown.classes.map(c => <section className="tuition-generation-class" key={c.classId} aria-label={c.className}>
              <h6>{c.className}</h6><p className="small text-muted mb-2">{c.invoiceCount} hóa đơn {result ? "đã lập" : "có thể tạo"} · {formatVND(c.amount)} · {c.alreadyExists} đã có · {c.ineligible} không đủ điều kiện</p>
              <ul className="list-unstyled mb-0">{shown.rows.filter(row => row.classId === c.classId).map((row, i) => <li className="tuition-generation-student" key={i}>
                <div className="d-flex flex-wrap justify-content-between gap-2"><strong>{row.studentName || "Không có học sinh phù hợp"}</strong><span className={`badge ${row.outcome === "created" ? "bg-success" : row.outcome === "ineligible" ? "bg-warning text-dark" : "bg-light text-dark"}`}>{outcomeNames[row.outcome] ?? row.outcome}</span></div>
                <div className="row g-2 small mt-1"><div className="col-sm-4">Học phí tháng: {row.monthlyFee == null ? "Chưa xác định" : formatVND(row.monthlyFee)}</div><div className="col-sm-4">Số tiền: <strong>{formatVND(row.amountDue)}</strong></div><div className="col-sm-4">Hạn: {dateLabel(row.dueDate ?? shown.dueDate)}</div></div>
                {row.invoiceId && <div className="small text-muted">Hóa đơn #{row.invoiceId}</div>}{row.reason && <p className="small mb-0 mt-1">{row.reason}</p>}
              </li>)}</ul>
            </section>)}
          </details>
        </section>}
      </div>
      <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={close}>Đóng</button><button type="button" className={`btn ${preview ? "btn-outline-primary" : "btn-primary"}`} data-testid="generation-preview-button" disabled={busy || !catalogue} onClick={() => void submit(false)}>{busy ? "Đang xử lý..." : shown ? "Xem trước lại" : "Xem trước"}</button>
        {preview && <button type="button" className="btn btn-primary" data-testid="generation-confirm" disabled={busy || preview.eligibleCount === 0} onClick={() => void submit(true)}>Tạo {preview.eligibleCount} hóa đơn</button>}</div>
    </div></div>
  </div>;
}
