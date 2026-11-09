import { useEffect, useId, useState } from "react";
import { classApi } from "../../../api/classApi";
import { studentEnrollmentApi, type StudentCenterEnrollment } from "../../../api/studentEnrollmentApi";
import type { ClassDto } from "../../../BLL/models/ClassDto";
import { availableStudentClasses, enrollmentStatus } from "../../../BLL/services/studentCenterEnrollmentService";

type Props = { studentId: number; gradeId: number | null; savedGradeId: number | null; disabled: boolean; onBusyChange: (busy: boolean) => void };
const date = (value: string | null) => value ? new Date(value.includes("T") && !/(Z|[+-]\d{2}:\d{2})$/i.test(value) ? `${value}Z` : value).toLocaleString("vi-VN") : "Chưa ghi nhận";

export default function StudentCenterClassesSection({ studentId, gradeId, savedGradeId, disabled, onBusyChange }: Props) {
  const titleId = useId();
  const [revision, setRevision] = useState(0);
  const [rows, setRows] = useState<StudentCenterEnrollment[]>([]);
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [selectionGrade, setSelectionGrade] = useState(gradeId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDrop, setConfirmDrop] = useState<StudentCenterEnrollment | null>(null);
  const [reason, setReason] = useState("");
  // Clear only the pending NEW choices on Grade change, never the enrollment list.
  if (selectionGrade !== gradeId) { setSelectionGrade(gradeId); setSelected([]); }
  useEffect(() => {
    let current = true;
    async function load() {
      const [history, catalogue] = await Promise.allSettled([studentEnrollmentApi.getForStudent(studentId), classApi.getAll()]);
      if (!current) return;
      if (history.status === "fulfilled") { setRows(history.value); setError(null); }
      else setError(history.reason instanceof Error ? history.reason.message : "Không tải được lớp đã đăng ký.");
      if (catalogue.status === "fulfilled") { setClasses(catalogue.value); setCatalogueError(null); }
      else setCatalogueError(catalogue.reason instanceof Error ? catalogue.reason.message : "Không tải được danh mục lớp.");
      setLoading(false);
    }
    void load();
    return () => { current = false; };
  }, [studentId, revision]);
  const reload = () => { setLoading(true); setSelected([]); setConfirmDrop(null); setRevision(value => value + 1); };
  const choices = availableStudentClasses(classes, gradeId, rows);
  const gradeDirty = gradeId !== savedGradeId;
  const locked = disabled || busy;
  const canAdd = !locked && !loading && !error && !catalogueError && !gradeDirty && gradeId != null;
  async function mutate(action: () => Promise<StudentCenterEnrollment[]>, success: string) {
    if (locked) return;
    setBusy(true); onBusyChange(true); setError(null); setMessage(null);
    try { setRows(await action()); setSelected([]); setConfirmDrop(null); setReason(""); setMessage(success); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Chưa xác nhận được kết quả. Tải lại lớp để kiểm tra."); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <section className="col-12" style={{ paddingTop: 0, paddingBottom: 0 }} aria-labelledby={titleId} aria-busy={loading || busy} data-testid="student-center-classes">
    <div className="border rounded-3 p-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <h6 className="fw-bold mb-0" id={titleId}>Lớp học tại trung tâm</h6>
        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked || loading} onClick={reload}>Tải lại lớp</button>
      </div>
      <p className="small text-muted">Thêm lớp/ngừng học được lưu bằng các nút riêng bên dưới. Nút Cập nhật hồ sơ chỉ lưu thông tin học sinh. Đổi khối không chuyển lớp hoặc xóa lịch sử.</p>
      {loading && <div className="small text-muted mb-2" role="status">Đang tải lớp đã đăng ký...</div>}
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      {catalogueError && <div className="alert alert-warning py-2" role="alert">{catalogueError} Lịch sử đã tải vẫn được giữ bên dưới.</div>}
      {message && <div className="alert alert-success py-2" role="status">{message}</div>}
      {!loading && !error && rows.length === 0 && <p className="small text-muted">Học sinh chưa đăng ký lớp tại trung tâm.</p>}
      <ul className="list-group mb-3" style={{ maxHeight: 280, overflowY: "auto" }} aria-label="Lớp đã đăng ký và lịch sử">
        {rows.map(row => {
          const status = enrollmentStatus(row.status), item = classes.find(c => c.classId === row.classId);
          return <li className="list-group-item" key={row.scId} data-enrollment-id={row.scId}>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
              <div className="text-break"><strong>{row.className || `Lớp #${row.classId}`}</strong> <span className={`badge ${status.badge}`}>{status.label}</span>
                {item && <small className="d-block text-muted">{item.gradeName || (item.gradeId == null ? "Lớp chưa phân khối" : `Khối #${item.gradeId}`)} · {item.subjectName || "Chưa có tên môn"}{gradeId != null && item.gradeId != null && item.gradeId !== gradeId ? " · Khác khối hồ sơ đang chọn" : ""}</small>}
                {item?.status?.toLowerCase() === "completed" && <small className="d-block text-muted">Class đã kết thúc; trạng thái ghi danh ở trên được giữ theo hồ sơ.</small>}
                <small className="d-block text-muted">Ngày đăng ký: {date(row.enrolledDate)}</small>
                {row.droppedAt && <small className="d-block text-muted">Ngày nghỉ: {date(row.droppedAt)}</small>}
                {row.dropReason && <small className="d-block text-muted text-break">Lý do: {row.dropReason}</small>}
              </div>
              {status.canDrop && <button type="button" className="btn btn-sm btn-outline-danger" disabled={locked || loading || !!error}
                aria-label={`Ngừng học ${row.className}`} onClick={() => { setConfirmDrop(row); setReason(""); setMessage(null); }}>Ngừng học</button>}
            </div>
          </li>;
        })}
      </ul>
      {confirmDrop && <div className="border border-danger rounded p-3 mb-3" role="group" aria-label="Xác nhận ngừng học">
        <p className="fw-semibold mb-2">Ngừng học lớp “{confirmDrop.className}”?</p>
        <p className="small text-muted">Chỉ chuyển đăng ký này sang Đã nghỉ, lưu ngày/lý do nghỉ và giữ nguyên bản ghi lịch sử.</p>
        <label className="form-label small" htmlFor={`${titleId}-reason`}>Lý do nghỉ (không bắt buộc)</label>
        <textarea id={`${titleId}-reason`} className="form-control mb-2" maxLength={500} rows={2} value={reason} disabled={locked} onChange={e => setReason(e.target.value)} />
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked} onClick={() => setConfirmDrop(null)}>Giữ lớp đang học</button>
          <button type="button" className="btn btn-sm btn-danger" disabled={locked || !!error} onClick={() => void mutate(() => studentEnrollmentApi.drop(studentId, confirmDrop.scId, reason), "Đã ngừng học lớp và giữ nguyên lịch sử.")}>Xác nhận ngừng học</button>
        </div>
      </div>}
      <h6 className="small fw-bold">Đăng ký thêm lớp theo khối đã lưu</h6>
      {gradeDirty && <p className="small text-warning-emphasis" role="status">Khối đã thay đổi trên form. Lưu hồ sơ và mở lại để đăng ký lớp theo khối mới; các lớp hiện tại vẫn giữ nguyên.</p>}
      {gradeId == null && <p className="small text-muted">Chọn và lưu Khối lớp để có gợi ý lớp đăng ký thêm. Lịch sử ở trên không bị ẩn.</p>}
      {!loading && !catalogueError && gradeId != null && choices.length === 0 && <p className="small text-muted">Không có lớp mới đủ điều kiện theo khối này. Các lớp đã có lịch sử không được đăng ký trùng.</p>}
      <div className="list-group mb-2" style={{ maxHeight: 200, overflowY: "auto" }} aria-label="Lớp có thể đăng ký thêm">
        {choices.map(item => <label className="list-group-item d-flex gap-2 align-items-start" key={item.classId}>
          <input type="checkbox" className="form-check-input flex-shrink-0" disabled={!canAdd} checked={selected.includes(item.classId)}
            onChange={e => setSelected(previous => e.target.checked ? [...new Set([...previous, item.classId])] : previous.filter(id => id !== item.classId))} />
          <span className="text-break">{item.className}<small className="d-block text-muted">{item.subjectName} · {item.status.toLowerCase() === "upcoming" ? "Sắp khai giảng" : "Đang hoạt động"}</small></span>
        </label>)}
      </div>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className="small" role="status">Đã chọn {selected.length} lớp mới</span>
        <button type="button" className="btn btn-sm btn-primary" disabled={!canAdd || selected.length === 0 || !!confirmDrop}
          onClick={() => { if (gradeId != null) void mutate(() => studentEnrollmentApi.add(studentId, gradeId, selected), "Đã đăng ký các lớp đã chọn."); }}>Đăng ký các lớp đã chọn</button>
      </div>
    </div>
  </section>;
}
