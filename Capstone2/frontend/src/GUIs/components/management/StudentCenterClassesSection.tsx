import { useEffect, useId, useState } from "react";
import { classApi } from "../../../api/classApi";
import { studentEnrollmentApi, type StudentCenterEnrollment } from "../../../api/studentEnrollmentApi";
import type { ClassDto } from "../../../BLL/models/ClassDto";
import { availableStudentClasses, enrollmentStatus } from "../../../BLL/services/studentCenterEnrollmentService";

type Props = { studentId: number; gradeId: number | null; savedGradeId: number | null; disabled: boolean; onBusyChange: (busy: boolean) => void };
const date = (value: string | null) => value ? new Date(value.includes("T") && !/(Z|[+-]\d{2}:\d{2})$/i.test(value) ? `${value}Z` : value).toLocaleString("en-US") : "Not recorded";

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
      else setError(history.reason instanceof Error ? history.reason.message : "Failed to load enrolled classes.");
      if (catalogue.status === "fulfilled") { setClasses(catalogue.value); setCatalogueError(null); }
      else setCatalogueError(catalogue.reason instanceof Error ? catalogue.reason.message : "Failed to load class list.");
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
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not confirm result. Reload classes to check."); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <section className="col-12" style={{ paddingTop: 0, paddingBottom: 0 }} aria-labelledby={titleId} aria-busy={loading || busy} data-testid="student-center-classes">
    <div className="border rounded-3 p-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <h6 className="fw-bold mb-0" id={titleId}>Center Classes</h6>
        <button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked || loading} onClick={reload}>Reload Classes</button>
      </div>
      <p className="small text-muted">Adding/dropping classes is saved using separate buttons below. The Update Profile button only saves student info. Changing grade does not transfer classes or delete history.</p>
      {loading && <div className="small text-muted mb-2" role="status">Loading enrolled classes...</div>}
      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
      {catalogueError && <div className="alert alert-warning py-2" role="alert">{catalogueError} Loaded history is still retained below.</div>}
      {message && <div className="alert alert-success py-2" role="status">{message}</div>}
      {!loading && !error && rows.length === 0 && <p className="small text-muted">Student has not enrolled in any center classes.</p>}
      <ul className="list-group mb-3" style={{ maxHeight: 280, overflowY: "auto" }} aria-label="Enrolled classes and history">
        {rows.map(row => {
          const status = enrollmentStatus(row.status), item = classes.find(c => c.classId === row.classId);
          return <li className="list-group-item" key={row.scId} data-enrollment-id={row.scId}>
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
              <div className="text-break"><strong>{row.className || `Class #${row.classId}`}</strong> <span className={`badge ${status.badge}`}>{status.label}</span>
                {item && <small className="d-block text-muted">{item.gradeName || (item.gradeId == null ? "Unassigned Grade" : `Grade #${item.gradeId}`)} · {item.subjectName || "No subject name"}{gradeId != null && item.gradeId != null && item.gradeId !== gradeId ? " · Different from selected profile grade" : ""}</small>}
                {item?.status?.toLowerCase() === "completed" && <small className="d-block text-muted">Class has ended; enrollment status above is retained in records.</small>}
                <small className="d-block text-muted">Enrollment date: {date(row.enrolledDate)}</small>
                {row.droppedAt && <small className="d-block text-muted">Drop date: {date(row.droppedAt)}</small>}
                {row.dropReason && <small className="d-block text-muted text-break">Reason: {row.dropReason}</small>}
              </div>
              {status.canDrop && <button type="button" className="btn btn-sm btn-outline-danger" disabled={locked || loading || !!error}
                aria-label={`Drop ${row.className}`} onClick={() => { setConfirmDrop(row); setReason(""); setMessage(null); }}>Drop Class</button>}
            </div>
          </li>;
        })}
      </ul>
      {confirmDrop && <div className="border border-danger rounded p-3 mb-3" role="group" aria-label="Confirm drop class">
        <p className="fw-semibold mb-2">Drop class “{confirmDrop.className}”?</p>
        <p className="small text-muted">This will change this enrollment to Dropped, save the drop date/reason, and preserve history records.</p>
        <label className="form-label small" htmlFor={`${titleId}-reason`}>Drop reason (optional)</label>
        <textarea id={`${titleId}-reason`} className="form-control mb-2" maxLength={500} rows={2} value={reason} disabled={locked} onChange={e => setReason(e.target.value)} />
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" disabled={locked} onClick={() => setConfirmDrop(null)}>Keep Class</button>
          <button type="button" className="btn btn-sm btn-danger" disabled={locked || !!error} onClick={() => void mutate(() => studentEnrollmentApi.drop(studentId, confirmDrop.scId, reason), "Class dropped successfully; history preserved.")}>Confirm Drop</button>
        </div>
      </div>}
      <h6 className="small fw-bold">Enroll in Additional Classes for Saved Grade</h6>
      {gradeDirty && <p className="small text-warning-emphasis" role="status">Grade has changed on the form. Save profile and reopen to enroll in classes for the new grade; current classes remain unchanged.</p>}
      {gradeId == null && <p className="small text-muted">Select and save Grade to view class recommendations to enroll. History above will not be hidden.</p>}
      {!loading && !catalogueError && gradeId != null && choices.length === 0 && <p className="small text-muted">No new eligible classes for this grade. Classes with existing history cannot be re-enrolled.</p>}
      <div className="list-group mb-2" style={{ maxHeight: 200, overflowY: "auto" }} aria-label="Available classes to enroll">
        {choices.map(item => <label className="list-group-item d-flex gap-2 align-items-start" key={item.classId}>
          <input type="checkbox" className="form-check-input flex-shrink-0" disabled={!canAdd} checked={selected.includes(item.classId)}
            onChange={e => setSelected(previous => e.target.checked ? [...new Set([...previous, item.classId])] : previous.filter(id => id !== item.classId))} />
          <span className="text-break">{item.className}<small className="d-block text-muted">{item.subjectName} · {item.status.toLowerCase() === "upcoming" ? "Upcoming" : "Active"}</small></span>
        </label>)}
      </div>
      <div className="d-flex flex-wrap align-items-center gap-2">
        <span className="small" role="status">Selected {selected.length} new {selected.length === 1 ? "class" : "classes"}</span>
        <button type="button" className="btn btn-sm btn-primary" disabled={!canAdd || selected.length === 0 || !!confirmDrop}
          onClick={() => { if (gradeId != null) void mutate(() => studentEnrollmentApi.add(studentId, gradeId, selected), "Successfully enrolled in selected classes."); }}>Enroll in Selected Classes</button>
      </div>
    </div>
  </section>;
}
