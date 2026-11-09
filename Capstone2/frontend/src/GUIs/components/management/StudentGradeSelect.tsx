import type { GradeDto } from "../../../BLL/models/GradeDto";

type Props = {
  value: string;
  onChange: (value: string) => void;
  grades: GradeDto[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  refresh: () => void;
  disabled?: boolean;
  legacyNote?: string | null;
};

export default function StudentGradeSelect({ value, onChange, grades, loading, loaded, error, refresh, disabled, legacyNote }: Props) {
  const unknown = value !== "" && !grades.some(g => String(g.gradeId) === value);
  return <>
    <select className="form-select" aria-label="Khối lớp" value={value} disabled={disabled || loading} onChange={e => onChange(e.target.value)}>
      <option value="">-- Chọn khối lớp --</option>
      {unknown && <option value={value} disabled>{loading ? "Đang tải khối" : loaded ? "Khối không còn hợp lệ" : "Chưa xác minh được khối"} (#{value})</option>}
      {grades.map(grade => <option key={grade.gradeId} value={grade.gradeId}>{grade.gradeName}</option>)}
    </select>
    {legacyNote && <small className="text-muted d-block mt-1">{legacyNote}. Chọn khối thực tế để liên kết; dữ liệu cũ được giữ nguyên.</small>}
    {loading && <small className="text-muted" role="status">Đang tải khối lớp...</small>}
    {error && <div className="text-danger small mt-1" role="alert">{error} <button type="button" className="btn btn-link btn-sm p-0" onClick={refresh}>Tải lại khối lớp</button></div>}
  </>;
}
