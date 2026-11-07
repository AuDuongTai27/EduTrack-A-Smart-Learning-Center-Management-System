import { useEffect, useId, useRef } from "react";
import type { useStudentEnrollment } from "../../hooks/useStudentEnrollment";

type Props = { enrollment: ReturnType<typeof useStudentEnrollment>; disabled: boolean };

export default function StudentEnrollmentSection({ enrollment, disabled }: Props) {
  const id = useId();
  const all = useRef<HTMLInputElement>(null);
  const count = enrollment.selected.length;
  useEffect(() => {
    if (all.current) all.current.indeterminate = count > 0 && count < enrollment.classes.length;
  }, [count, enrollment.classes.length, enrollment.loading]);
  return (
    <section className="col-12" style={{ paddingTop: 0, paddingBottom: 0 }} aria-labelledby={`${id}-title`} aria-busy={enrollment.loading}>
      <div className="border rounded-3 p-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
          <h6 className="fw-bold mb-0" id={`${id}-title`}>Đăng ký lớp học</h6>
          <span className="badge bg-primary-subtle text-primary" role="status">Đã chọn {count} lớp</span>
        </div>
        <p className="small text-muted mb-3">Không bắt buộc. Có thể lưu hồ sơ trước và ghi danh sau.</p>
        {enrollment.loading ? (
          <div className="small text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Đang tải lớp học...</div>
        ) : enrollment.error ? (
          <div className="alert alert-danger py-2 mb-0" role="alert">
            <div>{enrollment.error}</div>
            <button type="button" className="btn btn-sm btn-outline-danger mt-2" disabled={disabled} onClick={enrollment.retry}>Tải lại danh sách lớp</button>
          </div>
        ) : enrollment.classes.length === 0 ? (
          <div className="small text-muted" role="status">{enrollment.gradeId == null ? "Chọn khối lớp để xem danh sách lớp có thể đăng ký." : "Khối đã chọn chưa có lớp đủ điều kiện ghi danh."}</div>
        ) : (
          <>
            <div className="form-check mb-2">
              <input ref={all} id={`${id}-all`} className="form-check-input" type="checkbox" disabled={disabled}
                checked={count === enrollment.classes.length} onChange={e => enrollment.selectAll(e.target.checked)} />
              <label className="form-check-label fw-bold" htmlFor={`${id}-all`}>Chọn tất cả</label>
            </div>
            <div className="list-group" style={{ maxHeight: 240, overflowY: "auto" }}>
              {enrollment.classes.map(item => (
                <label className="list-group-item d-flex align-items-start gap-2" key={item.classId} htmlFor={`${id}-${item.classId}`}>
                  <input id={`${id}-${item.classId}`} className="form-check-input flex-shrink-0 mt-1" type="checkbox" disabled={disabled}
                    checked={enrollment.selected.includes(item.classId)} onChange={e => enrollment.toggle(item.classId, e.target.checked)} />
                  <span className="text-break"><span className="fw-semibold">{item.className}</span>
                    <small className="d-block text-muted">{item.subjectName || "Chưa có tên môn học"} · {item.status.trim().toLowerCase() === "upcoming" ? "Sắp khai giảng" : "Đang hoạt động"}</small>
                  </span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
