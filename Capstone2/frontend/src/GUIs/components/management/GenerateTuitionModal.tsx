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

const modeNames = { grade: "Entire Grade", class: "Entire Class", individual: "Individual Student" };
const outcomeNames: Record<string, string> = { eligible: "Eligible to Create", created: "Created", already_exists: "Invoice Already Exists", ineligible: "Ineligible" };
const dateLabel = (date?: string | null) => date ? date.slice(0, 10).split("-").reverse().join("/") : "Not specified";

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
    void Promise.all([gradeApi.getAll(), classApi.getAll()]).then(([grades, classes]) => { if (current) { setCatalogue({ grades, classes }); setError(null); } }, cause => { if (current) setError(cause instanceof Error ? cause.message : "Failed to load category."); });
    return () => { current = false; };
  }, [revision]);
  useEffect(() => {
    let current = true;
    if (!form.classId || !form.gradeId || form.mode !== "individual") return;
    void tuitionGenerationApi.preview({ mode: "class", gradeId: form.gradeId, classId: form.classId, periodMonth: form.periodMonth, periodYear: form.periodYear }).then(data => {
      if (current) setCandidateState({ key: candidateKey, data, error: null });
    }, cause => { if (current) setCandidateState({ key: candidateKey, data: null, error: cause instanceof Error ? cause.message : "Failed to load enrollments." }); });
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
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Failed to process request."); setPreview(null); }
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
  return <div className="modal show d-block tuition-generation-modal" role="dialog" aria-modal="true" aria-label="Generate tuition invoices" aria-labelledby="generation-title">
    <div className="modal-dialog modal-dialog-centered"><div className="modal-content">
      <div className="modal-header"><h5 className="modal-title" id="generation-title">Generate Invoices</h5><button type="button" className="btn-close" disabled={busy} aria-label="Close invoice generation" onClick={close} /></div>
      <div className="modal-body" aria-busy={busy}>
        {error && <div role="alert" className="alert alert-danger" tabIndex={-1} ref={errorRef}>{error} <button type="button" className="btn btn-link btn-sm" disabled={busy} onClick={() => { setRevision(v => v + 1); setCandidateRevision(v => v + 1); }}>Reload data</button></div>}
        {!catalogue && !error && <p role="status">Loading grades and classes...</p>}
        <section className="tuition-generation-config" aria-labelledby="generation-config-title">
        <h6 id="generation-config-title" className="mb-3">Invoice Information</h6>
        <fieldset disabled={busy || !catalogue} className="row g-3">
          <div className="col-md-6"><label className="form-label" htmlFor="generation-mode">Mode</label><select id="generation-mode" className="form-select" value={form.mode} onChange={e => { change({ mode: e.target.value as GenerationRequest["mode"], classId: undefined, studentId: undefined }); setAmount(""); }}>
            <option value="grade">Entire Grade</option><option value="class">Entire Class</option><option value="individual">Individual Student</option></select></div>
          <div className="col-md-6"><label className="form-label" htmlFor="generation-grade">Grade</label><select id="generation-grade" className="form-select" value={form.gradeId} onChange={e => { change({ gradeId: Number(e.target.value), classId: undefined, studentId: undefined }); setAmount(""); }}><option value={0}>-- Select Grade --</option>{catalogue?.grades.map(g => <option key={g.gradeId} value={g.gradeId}>{g.gradeName}</option>)}</select></div>
          {form.mode !== "grade" && <div className="col-md-6"><label className="form-label" htmlFor="generation-class">Class</label><select id="generation-class" className="form-select" value={form.classId ?? 0} onChange={e => { const id = Number(e.target.value); change({ classId: id || undefined, studentId: undefined }); setAmount(String(catalogue?.classes.find(c => c.classId === id)?.tuitionFee || "")); }}><option value={0}>-- Select Class --</option>{catalogue?.classes.filter(c => c.gradeId === form.gradeId).map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}</select></div>}
          {form.mode === "individual" && <div className="col-md-6"><label className="form-label" htmlFor="generation-student">Student</label><select id="generation-student" className="form-select" disabled={candidateLoading || !!candidateError} value={form.studentId ?? 0} onChange={e => { change({ studentId: Number(e.target.value) || undefined }); resetAmount(); }}><option value={0}>-- Select Student --</option>{students.map(row => <option key={row.studentId} value={row.studentId!}>{row.studentName}{row.outcome === "already_exists" ? " (invoice already exists)" : ""}</option>)}</select>
            {candidateLoading && <small role="status">Loading students for period...</small>}{candidateError && <div role="alert" className="text-danger">{candidateError} <button type="button" className="btn btn-link btn-sm" onClick={() => setCandidateRevision(v => v + 1)}>Retry</button></div>}{form.classId && !candidateLoading && !candidateError && !students.length ? <small>No eligible students in this period.</small> : null}</div>}
          <div className="col-md-6"><span className="form-label d-block" id="generation-period-label">Billing Period</span><div className="row g-2" role="group" aria-labelledby="generation-period-label">
            <div className="col-6"><label className="visually-hidden" htmlFor="generation-month">Billing Month</label><select id="generation-month" className="form-select" value={form.periodMonth} onChange={e => { change({ periodMonth: Number(e.target.value), studentId: undefined }); resetAmount(); }}>{Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>Month {i + 1}</option>)}</select></div>
            <div className="col-6"><label className="visually-hidden" htmlFor="generation-year">Billing Year</label><input id="generation-year" className="form-control" type="text" inputMode="numeric" value={form.periodYear || ""} onChange={e => { change({ periodYear: Number(e.target.value), studentId: undefined }); resetAmount(); }} /></div>
          </div></div>
          {form.mode === "individual" && <div className="col-md-6"><label className="form-label" htmlFor="generation-amount">Agreed Amount</label><MoneyInput id="generation-amount" value={amount} onValueChange={value => { setAmount(value); setPreview(null); setResult(null); setError(null); }} required /><small className="text-muted">Class tuition: {monthlyFee == null ? "No class selected" : formatVND(monthlyFee)}</small></div>}
        </fieldset>
        <details className="small text-muted mt-3"><summary>Tuition calculation policy</summary><p className="mt-2 mb-1">Fixed monthly billing using each class's specific tuition; not reduced by attendance. Students joining mid-month require a separate agreement, without automatic waivers or rollover to the next period. Manually entered amounts are still subject to existing enrollment checks and approval.</p>{shown && <p className="mb-0">{shown.dueDatePolicy}</p>}</details>
        {excluded.length > 0 && <details className="small mt-2"><summary>{excluded.length} ineligible cases in this period</summary><ul className="mt-2 mb-0">{excluded.map((row, i) => <li key={i}>{row.studentName}: {row.reason}</li>)}</ul></details>}
        </section>
        {shown && <section className="tuition-generation-preview" data-testid="generation-preview" aria-labelledby="generation-summary-title">
          <h6 id="generation-summary-title" tabIndex={-1} ref={summaryRef}>{result ? "Invoice Generation Result" : "Invoice Preview"}</h6>
          <p className="small text-muted">{modeNames[form.mode]} · {shown.gradeName} · {shown.periodMonth}/{shown.periodYear} · {shown.classCount} {shown.classCount === 1 ? "class" : "classes"} · {shown.studentCount} {shown.studentCount === 1 ? "student" : "students"}</p>
          {result && <p role="status" className={`alert ${result.failed > 0 ? "alert-warning" : result.created > 0 ? "alert-success" : "alert-secondary"} py-2`}>{result.created > 0 ? `Created ${result.created} invoices.` : "No new invoices created."}{result.failed > 0 ? ` ${result.failed} failed cases; reconciliation needed.` : ""}</p>}
          <dl className="tuition-generation-stats">
            <div><dt>{result ? "Created" : "Eligible Invoices to Create"}</dt><dd data-testid={result ? "generation-created" : "generation-eligible"}>{result ? shown.created : shown.eligibleCount}</dd></div>
            <div><dt>Invoice Already Exists</dt><dd data-testid="generation-existing">{shown.alreadyExists}</dd></div>
            {shown.ineligible > 0 && <div><dt>Ineligible</dt><dd data-testid="generation-ineligible">{shown.ineligible}</dd></div>}
            <div className="tuition-generation-stat-total"><dt>{result ? "Total Amount Generated" : "Estimated Total Amount"}</dt><dd data-testid="generation-total">{formatVND(shown.totalAmount)}</dd></div>
            <div><dt>Payment Due Date</dt><dd className="tuition-generation-date" data-testid="generation-due-date">{dateLabel(shown.dueDate)}</dd></div>
            {result && <div><dt>Failed</dt><dd data-testid="generation-failed">{shown.failed}</dd></div>}
          </dl>
          {preview?.eligibleCount === 0 && <p className="alert alert-info py-2 small" role="status" data-testid="generation-zero">No new eligible invoices to create.{shown.alreadyExists > 0 ? ` ${shown.alreadyExists} invoices already exist.` : ""}{shown.ineligible > 0 ? ` ${shown.ineligible} ineligible cases.` : ""} View details or change selection and preview again.</p>}
          {shown.alreadyExists > 0 && <p className="small text-muted">Existing invoices are skipped, retaining original amount and due date.</p>}
          <details className="tuition-generation-details" key={result ? "result" : "preview"} data-testid="generation-details"><summary>Details by Class and Student</summary>
            {shown.classes.map(c => <section className="tuition-generation-class" key={c.classId} aria-label={c.className}>
              <h6>{c.className}</h6><p className="small text-muted mb-2">{c.invoiceCount} invoices {result ? "generated" : "eligible"} · {formatVND(c.amount)} · {c.alreadyExists} existing · {c.ineligible} ineligible</p>
              <ul className="list-unstyled mb-0">{shown.rows.filter(row => row.classId === c.classId).map((row, i) => <li className="tuition-generation-student" key={i}>
                <div className="d-flex flex-wrap justify-content-between gap-2"><strong>{row.studentName || "No matching student"}</strong><span className={`badge ${row.outcome === "created" ? "bg-success" : row.outcome === "ineligible" ? "bg-warning text-dark" : "bg-light text-dark"}`}>{outcomeNames[row.outcome] ?? row.outcome}</span></div>
                <div className="row g-2 small mt-1"><div className="col-sm-4">Monthly tuition: {row.monthlyFee == null ? "Not specified" : formatVND(row.monthlyFee)}</div><div className="col-sm-4">Amount: <strong>{formatVND(row.amountDue)}</strong></div><div className="col-sm-4">Due: {dateLabel(row.dueDate ?? shown.dueDate)}</div></div>
                {row.invoiceId && <div className="small text-muted">Invoice #{row.invoiceId}</div>}{row.reason && <p className="small mb-0 mt-1">{row.reason}</p>}
              </li>)}</ul>
            </section>)}
          </details>
        </section>}
      </div>
      <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={busy} onClick={close}>Close</button><button type="button" className={`btn ${preview ? "btn-outline-primary" : "btn-primary"}`} data-testid="generation-preview-button" disabled={busy || !catalogue} onClick={() => void submit(false)}>{busy ? "Processing..." : shown ? "Preview Again" : "Preview"}</button>
        {preview && <button type="button" className="btn btn-primary" data-testid="generation-confirm" disabled={busy || preview.eligibleCount === 0} onClick={() => void submit(true)}>Create {preview.eligibleCount} invoices</button>}</div>
    </div></div>
  </div>;
}
