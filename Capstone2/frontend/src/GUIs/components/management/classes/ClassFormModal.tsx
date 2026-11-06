import { useEffect, useRef, useState } from "react";
import classDAL from "../../../../DAL/classDAL";
import managementDAL from "../../../../DAL/managementDAL";
import MoneyInput from "../../Common/MoneyInput";
import type { ClassFormValues, ClassQuery } from "../../../../BLL/models/ClassManagement";
import type { SubjectDto } from "../../../../BLL/models/SubjectDto";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import { CLASS_STATUSES, CREATE_CLASS_STATUSES, classError, classFormPayload, classToForm, emptyClassForm, suggestedClassEndDate, validateClassForm } from "../../../../BLL/services/classManagementService";

interface Props {
  classId?: number;
  subjects: ClassQuery<SubjectDto[]>;
  onRetrySubjects: () => void;
  onClose: () => void;
  onSaved: (item: ClassDto) => void;
}
const FIELD_PLACEHOLDERS: Partial<Record<keyof ClassFormValues, string>> = {
  className: "VD: Lớp 9 - Toán",
  tuitionFee: "VD: 1.700.000",
  room: "VD: Phòng A101",
};
export default function ClassFormModal({classId, subjects, onRetrySubjects, onClose, onSaved}: Props) {
  const statusOptions = classId ? CLASS_STATUSES : CREATE_CLASS_STATUSES;
  const [form, setForm] = useState<ClassFormValues | null>(() => classId ? null : emptyClassForm());
  const [loading, setLoading] = useState(!!classId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [retry, setRetry] = useState(0);
  const mounted = useRef(false);
  const savingRef = useRef(false);
  useEffect(() => {
    mounted.current = true;
    let active = true;
    if (classId) {
      setForm(null); setLoading(true); setError(null);
      classDAL.getClassById(classId).then(item => {
        if (!item) throw new Error("Không tìm thấy lớp học.");
        if (active) setForm(classToForm(item));
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
    if (!form || savingRef.current || subjects.loading || !subjects.data) return;
    const validation = validateClassForm(form, subjects.data, classId ? "edit" : "create");
    setErrors(validation); setError(null);
    if (Object.keys(validation).length) return;
    savingRef.current = true; setSaving(true);
    try {
      const payload = classFormPayload(form);
      const result = classId ? await managementDAL.updateClass(classId, payload) : await managementDAL.createClass(payload);
      if (!result.success || !result.data) throw new Error(result.message || "Máy chủ chưa xác nhận lưu lớp học.");
      if (mounted.current) onSaved(result.data);
    } catch (cause) {if (mounted.current) setError(classError(cause));}
    finally {savingRef.current = false; if (mounted.current) setSaving(false);}
  };
  return (
    <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="class-form-title" tabIndex={-1} style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 id="class-form-title" className="modal-title fw-bold">{classId ? "Chỉnh sửa lớp học" : "Mở lớp học mới"}</h5>
            <button type="button" className="btn-close btn-close-white" aria-label="Đóng" disabled={saving} onClick={onClose} />
          </div>
          <form onSubmit={submit} noValidate className="d-flex flex-column overflow-hidden">
            <div className="modal-body p-4">
              {loading && <div className="text-muted py-4" role="status"><span className="spinner-border spinner-border-sm me-2" />Đang tải dữ liệu lớp mới nhất...</div>}
              {error && <div className="alert alert-danger" role="alert">{error}
                {!form && <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => setRetry(value => value + 1)}>Thử lại</button>}
              </div>}
              {form && <fieldset disabled={saving}>
                <h6 className="fw-bold mb-3">A. Thông tin lớp học</h6>
                <div className="row g-3">
                  {input("className", "Tên lớp học", "text", true, 150)}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" htmlFor="class-status">Trạng thái lớp <span className="text-danger">*</span></label>
                    <select id="class-status" name="status" className="form-select" value={form.status} onChange={event => change("status", event.target.value)}>
                      {classId && !statusOptions.includes(form.status) && <option value={form.status}>{form.status}</option>}
                      {statusOptions.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
                    </select>
                    {errors.status && <div className="text-danger small">{errors.status}</div>}
                  </div>
                  {input("startDate", "Ngày khai giảng", "date", true)}
                  {input("endDate", "Ngày kết thúc dự kiến", "date")}
                </div>
                <h6 className="fw-bold mt-4 mb-3">B. Môn học và học phí</h6>
                {subjects.loading ? <div className="text-muted small" role="status">Đang tải danh sách môn học...</div>
                  : subjects.error ? <div className="alert alert-warning" role="alert">{subjects.error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onRetrySubjects}>Tải lại môn học</button></div>
                    : subjects.data?.length === 0 && <div className="alert alert-warning">Chưa có môn học. Vui lòng bổ sung môn học trước khi mở lớp.</div>}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" htmlFor="class-subjectId">Môn học <span className="text-danger">*</span></label>
                    <select id="class-subjectId" name="subjectId" className={`form-select${errors.subjectId ? " is-invalid" : ""}`} value={form.subjectId}
                      disabled={subjects.loading || !subjects.data?.length} onChange={event => change("subjectId", event.target.value)} required>
                      <option value="">Chọn môn học</option>
                      {form.subjectId && !subjects.data?.some(item => String(item.subjectId) === form.subjectId)
                        && <option value={form.subjectId} disabled>Môn hiện tại #{form.subjectId} chưa có trong danh sách</option>}
                      {subjects.data?.map(subject => <option key={subject.subjectId} value={String(subject.subjectId)}>{subject.subjectName} ({subject.subjectCode})</option>)}
                    </select>
                    {errors.subjectId && <div className="invalid-feedback">{errors.subjectId}</div>}
                  </div>
                  {input("tuitionFee", "Học phí/tháng", "text", true)}
                </div>
                <h6 className="fw-bold mt-4 mb-3">C. Phòng học và lịch học</h6>
                <div className="row g-3">{input("room", "Phòng học (tùy chọn)", "text", false, 50)}</div>
              </fieldset>}
            </div>
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={onClose}>Hủy bỏ</button>
              <button type="submit" className="btn btn-primary" disabled={saving || loading || !form || subjects.loading || !subjects.data?.length}>
                {saving ? "Đang lưu..." : classId ? "Lưu thay đổi" : "Tạo lớp học"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
