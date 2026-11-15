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
    <select className="form-select" aria-label="Grade" value={value} disabled={disabled || loading} onChange={e => onChange(e.target.value)}>
      <option value="">-- Select Grade --</option>
      {unknown && <option value={value} disabled>{loading ? "Loading grade" : loaded ? "Grade no longer valid" : "Could not verify grade"} (#{value})</option>}
      {grades.map(grade => <option key={grade.gradeId} value={grade.gradeId}>{grade.gradeName}</option>)}
    </select>
    {legacyNote && <small className="text-muted d-block mt-1">{legacyNote}. Select actual grade to link; old data will be preserved.</small>}
    {loading && <small className="text-muted" role="status">Loading grades...</small>}
    {error && <div className="text-danger small mt-1" role="alert">{error} <button type="button" className="btn btn-link btn-sm p-0" onClick={refresh}>Reload grades</button></div>}
  </>;
}
