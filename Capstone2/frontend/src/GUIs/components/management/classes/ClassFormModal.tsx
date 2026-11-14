import { useEffect, useRef, useState } from "react";
import classDAL from "../../../../DAL/classDAL";
import managementDAL from "../../../../DAL/managementDAL";
import MoneyInput from "../../Common/MoneyInput";
import type { ClassFormValues, ClassQuery } from "../../../../BLL/models/ClassManagement";
import type { SubjectDto } from "../../../../BLL/models/SubjectDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { GradeDto } from "../../../../BLL/models/GradeDto";
import { CLASS_STATUSES, CREATE_CLASS_STATUSES, classError, classFormPayload, classToForm, emptyClassForm, suggestedClassEndDate, validateClassForm } from "../../../../BLL/services/classManagementService";

interface Props {
  classId?: number;
  subjects: ClassQuery<SubjectDto[]>;
  grades: ClassQuery<GradeDto[]>;
  onRetrySubjects: () => void;
  onClose: () => void;
  onSaved: (item: ClassDto) => void;
}
const FIELD_PLACEHOLDERS: Partial<Record<keyof ClassFormValues, string>> = {
  className: "e.g., Grade 9 - Math",
  tuitionFee: "e.g., 1,700,000",
  room: "e.g., Room A101",
};
export default function ClassFormModal({classId, subjects, grades, onRetrySubjects, onClose, onSaved}: Props) {
  const statusOptions = classId ? CLASS_STATUSES : CREATE_CLASS_STATUSES;
  const [form, setForm] = useState<ClassFormValues | null>(() => classId ? null : emptyClassForm());
  const [loading, setLoading] = useState(!!classId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [retry, setRetry] = useState(0);
  const [allowUnclassified, setAllowUnclassified] = useState(false);
  const mounted = useRef(false);
  const savingRef = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    if (classId) {
      setForm(null); setLoading(true); setError(null);
      classDAL.getClassById(classId).then(item => {
        if (!item) throw new Error("Class not found.");
        if (active) {setForm(classToForm(item)); setAllowUnclassified(item.gradeId == null);}
      }).catch(cause => {if (active) setError(classError(cause));})
        .finally(() => {if (active) setLoading(false);});
    }
    return () => {active = false; mounted.current = false;};
  }, [classId, retry]);

  const change = (key: keyof ClassFormValues, value: string) => {
    const suggestEnd = !classId && key === "startDate";
    setForm(previous => previous ? {...previous, [key]: value,
      ...(suggestEnd ? {endDate: suggestedClassEndDate(value)} : {})} : previous);
    setErrors(previous => {const next = {...previous}; delete next[key]; if (suggestEnd) delete next.endDate; return next;});
  };
  const input = (key: keyof ClassFormValues, label: string, type = "text", required = false, maxLength?: number) => (
    <div className="col-md-6">
      <label className="form-label fw-semibold" htmlFor={`class-${key}`}>{label}{required && <span className="text-danger"> *</span>}</label>
      {key === "tuitionFee" ? <MoneyInput id={`class-${key}`} name={key} value={form?.[key] ?? ""}
        placeholder={FIELD_PLACEHOLDERS[key]}
        onValueChange={value => change(key, value)} maxFractionDigits={2} required={required}
        className={errors[key] ? "is-invalid" : ""} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />
        : <input id={`class-${key}`} name={key} type={type} className={`form-control${errors[key] ? " is-invalid" : ""}`}
        placeholder={FIELD_PLACEHOLDERS[key]}
        value={form?.[key] ?? ""} onChange={event => change(key, event.target.value)} required={required}
        maxLength={maxLength} min={type === "number" ? "0" : type === "date" ? (key === "endDate" ? form?.startDate || "1000-01-01" : "1000-01-01") : undefined}
        max={type === "number" ? "9999999999.99" : type === "date" ? "9999-12-31" : undefined}
        step={type === "number" ? "0.01" : undefined} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `error-${key}` : undefined} />}
      {errors[key] && <div id={`error-${key}`} className="invalid-feedback d-block">{errors[key]}</div>}
    </div>
  );
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form || savingRef.current || subjects.loading || !subjects.data || grades.loading || !grades.data) return;
    const validation = validateClassForm(form, subjects.data, classId ? "edit" : "create", grades.data, allowUnclassified);
    setErrors(validation); setError(null);
    if (Object.keys(validation).length) return;
    savingRef.current = true; setSaving(true);
    try {
      const payload = classFormPayload(form);
      const result = classId ? await managementDAL.updateClass(classId, payload) : await managementDAL.createClass(payload);
      if (!result.success || !result.data) throw new Error(result.message || "Server did not confirm saving class.");
      if (mounted.current) onSaved(result.data);
    } catch (cause) {if (mounted.current) setError(classError(cause));}
    finally {savingRef.current = false; if (mounted.current) setSaving(false);}
  };
  return (
    <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="class-form-title" tabIndex={-1} style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 id="class-form-title" className="modal-title fw-bold">{classId ? "Edit Class" : "Open New Class"}</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Close" disabled={saving} onClick={onClose} />
          </div>
          <form onSubmit={submit} noValidate className="d-flex flex-column overflow-hidden">
            <div className="modal-body p-4">
              {loading && <div className="text-muted py-4" role="status"><span className="spinner-border spinner-border-sm me-2" />Loading latest class data...</div>}
              {error && <div className="alert alert-danger" role="alert">{error}
                {!form && <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => setRetry(value => value + 1)}>Retry</button>}
              </div>}
              {form && <fieldset disabled={saving}>
                <h6 className="fw-bold mb-3">A. Class Information</h6>
                <div className="row g-3">
                  {input("className", "Class Name", "text", true, 150)}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" htmlFor="class-gradeId">Grade{!allowUnclassified && <span className="text-danger"> *</span>}</label>
                    <select id="class-gradeId" name="gradeId" className={`form-select${errors.gradeId ? " is-invalid" : ""}`}
                      value={form.gradeId} disabled={grades.loading || !grades.data?.length} required={!allowUnclassified}
                      aria-invalid={!!errors.gradeId} aria-describedby={errors.gradeId ? "error-gradeId" : undefined}
                      onChange={event => change("gradeId", event.target.value)}>
                      <option value="" disabled={!allowUnclassified}>{allowUnclassified ? "Unclassified" : "Select Grade"}</option>
                      {form.gradeId && !grades.data?.some(grade => String(grade.gradeId) === form.gradeId)
                        && <option value={form.gradeId} disabled>Current grade #{form.gradeId} is not in the list</option>}
                      {grades.data?.map(grade => <option key={grade.gradeId} value={String(grade.gradeId)}>{grade.gradeName}</option>)}
                    </select>
                    {errors.gradeId && <div id="error-gradeId" className="invalid-feedback">{errors.gradeId}</div>}
                    {grades.loading ? <div className="small text-muted" role="status">Loading grades...</div>
                      : grades.error ? <div className="alert alert-warning mt-2" role="alert">{grades.error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRetrySubjects}>Reload grades</button></div>
                        : grades.data?.length === 0 && <div className="alert alert-warning mt-2">No grade list available. Please reload later.</div>}
                  </div>
                </div>
                <h6 className="fw-bold mt-4 mb-3">B. Subject and Tuition</h6>
                {subjects.loading ? <div className="text-muted small" role="status">Loading subjects...</div>
                  : subjects.error ? <div className="alert alert-warning" role="alert">{subjects.error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRetrySubjects}>Reload subjects</button></div>
                    : subjects.data?.length === 0 && <div className="alert alert-warning">No subjects available. Please add subjects before opening a class.</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" htmlFor="class-subjectId">Subject <span className="text-danger">*</span></label>
                    <select id="class-subjectId" name="subjectId" className={`form-select${errors.subjectId ? " is-invalid" : ""}`} value={form.subjectId}
                      disabled={subjects.loading || !subjects.data?.length} onChange={event => change("subjectId", event.target.value)} required>
                      <option value="">Select Subject</option>
                      {form.subjectId && !subjects.data?.some(item => String(item.subjectId) === form.subjectId)
                        && <option value={form.subjectId} disabled>Current subject #{form.subjectId} is not in the list</option>}
                      {subjects.data?.map(subject => <option key={subject.subjectId} value={String(subject.subjectId)}>{subject.subjectName} ({subject.subjectCode})</option>)}
                    </select>
                    {errors.subjectId && <div className="invalid-feedback">{errors.subjectId}</div>}
                  </div>
                  {input("tuitionFee", "Monthly Tuition", "text", true)}
                </div>
                <h6 className="fw-bold mt-4 mb-3">C. Room and Schedule</h6>
                <div className="row g-3">
                  {input("startDate", "Start Date", "date", true)}
                  {input("endDate", "Expected End Date", "date")}
                  {input("room", "Room (optional)", "text", false, 50)}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" htmlFor="class-status">Class Status <span className="text-danger">*</span></label>
                    <select id="class-status" name="status" className="form-select" value={form.status} onChange={event => change("status", event.target.value)}>
                      {classId && !statusOptions.includes(form.status) && <option value={form.status}>{form.status}</option>}
                      {statusOptions.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                    </select>
                    {errors.status && <div className="text-danger small">{errors.status}</div>}
                  </div>
                </div>
              </fieldset>}
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || loading || !form || subjects.loading || !subjects.data?.length || grades.loading || !grades.data?.length}>
                {saving ? "Saving..." : classId ? "Save Changes" : "Create Class"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
