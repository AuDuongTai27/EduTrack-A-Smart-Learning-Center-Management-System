import { useEffect, useRef, useState } from "react";
import DotStatusBadge from "../../Common/DotStatusBadge";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { UserDto } from "../../../../BLL/models/UserDto";
import type { ClassQuery, ClassTeacherDto, ClassTaDto } from "../../../../BLL/models/ClassManagement";
import { classError } from "../../../../BLL/services/classManagementService";
import type { ClassStaffAssignment, ClassStaffKind } from "../../../../BLL/services/classStaffService";
import { classStaffDAL } from "../../../../DAL/classStaffDAL";

interface Props {
  item: ClassDto;
  teachers: ClassQuery<ClassTeacherDto[]>;
  assistants: ClassQuery<ClassTaDto[]>;
  onSaved: (message: string) => void;
}
export default function ClassStaffAssignments({item, teachers, assistants, onSaved}: Props) {
  const [kind, setKind] = useState<ClassStaffKind | null>(null);
  const [stopping, setStopping] = useState<{kind: ClassStaffKind; assignment: ClassStaffAssignment} | null>(null);
  const [candidates, setCandidates] = useState<ClassQuery<UserDto[]>>({data: null, loading: false, error: null});
  const [retry, setRetry] = useState(0);
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const mounted = useRef(false);
  const selectedAssignments = kind === "teachers" ? teachers.data : assistants.data;
  useEffect(() => {mounted.current = true; return () => {mounted.current = false;};}, []);
  useEffect(() => {
    if (!kind) return;
    let active = true;
    setCandidates({data: null, loading: true, error: null}); setUserId(""); setError(null);
    if (!selectedAssignments) {
      setCandidates({data: null, loading: false, error: "Chưa tải được phân công hiện có. Vui lòng tải lại chi tiết lớp."});
      return;
    }
    void classStaffDAL.getCandidates(kind, selectedAssignments).then(data => {
      if (active) setCandidates({data, loading: false, error: null});
    }).catch(cause => {if (active) setCandidates({data: null, loading: false, error: classError(cause)});});
    return () => {active = false;};
  }, [kind, retry, selectedAssignments]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!kind || savingRef.current || candidates.loading || !candidates.data?.some(user => String(user.userId) === userId)) return;
    savingRef.current = true; setSaving(true); setError(null);
    try {
      await classStaffDAL.assign(kind, item.classId, Number(userId));
      if (mounted.current) setKind(null);
      onSaved(kind === "teachers" ? "Đã phân công giáo viên vào lớp." : "Đã phân công trợ giảng vào lớp.");
    } catch (cause) {if (mounted.current) setError(classError(cause));}
    finally {savingRef.current = false; if (mounted.current) setSaving(false);}
  };
  const stop = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stopping || savingRef.current) return;
    savingRef.current = true; setSaving(true); setError(null);
    const assignment = stopping.assignment;
    const id = "teacherId" in assignment ? assignment.teacherClassId : assignment.taClassId;
    const staffId = "teacherId" in assignment ? assignment.teacherId : assignment.taId;
    try {
      await classStaffDAL.deactivate(stopping.kind, item.classId, id, staffId);
      if (mounted.current) setStopping(null);
      onSaved(stopping.kind === "teachers" ? "Đã ngừng phân công giáo viên trong lớp." : "Đã ngừng phân công trợ giảng trong lớp.");
    } catch (cause) {if (mounted.current) setError(classError(cause));}
    finally {savingRef.current = false; if (mounted.current) setSaving(false);}
  };
  const section = (type: ClassStaffKind, query: ClassQuery<ClassStaffAssignment[]>) => {
    const teacher = type === "teachers";
    const label = teacher ? "giáo viên" : "trợ giảng";
    return <div className="col-lg-6">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h6 className="fw-bold mb-0">{teacher ? "Giáo viên được phân công" : "Trợ giảng được phân công"}</h6>
        <button type="button" className="btn btn-sm btn-outline-primary" disabled={saving || query.loading || !!query.error || !query.data}
          onClick={() => {setUserId(""); setError(null); setKind(type);}}>Phân công {label}</button>
      </div>
      {query.loading ? <div className="text-muted py-3" role="status">Đang tải phân công...</div>
        : query.error ? <div className="alert alert-danger mb-0" role="alert">{query.error}</div>
          : !query.data?.length ? <p className="text-muted py-3 mb-0">Chưa có phân công {label}.</p>
            : <div className="table-responsive"><table className="table align-middle"><thead><tr><th>{teacher ? "Giáo viên" : "Trợ giảng"}</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
              {query.data.map(assignment => {
                const identity = "teacherId" in assignment
                  ? {id: assignment.teacherClassId, userId: assignment.teacherId, name: assignment.teacherName, code: assignment.teacherCode}
                  : {id: assignment.taClassId, userId: assignment.taId, name: assignment.taName, code: assignment.taCode};
                return <tr key={identity.id}><td>{identity.name || `#${identity.userId}`}<small className="d-block text-muted">{identity.code}</small></td><td><DotStatusBadge status={assignment.status} /></td>
                  <td>{assignment.status.toLowerCase() === "active" ? <button type="button" className="btn btn-sm btn-outline-danger" disabled={saving}
                    aria-label={`Ngừng phân công ${identity.name || `#${identity.userId}`}`}
                    onClick={() => {setError(null); setStopping({kind: type, assignment});}}>Ngừng phân công</button> : <span className="text-muted">—</span>}</td></tr>;
              })}
            </tbody></table></div>}
    </div>;
  };
  return <>
    <div className="row g-4">{section("teachers", teachers)}{section("assistants", assistants)}</div>
    {stopping && <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="class-staff-stop-title" tabIndex={-1} style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div className="modal-content border-0 shadow-lg">
        <div className="modal-header">
          <h5 id="class-staff-stop-title" className="modal-title fw-bold">Ngừng phân công {stopping.kind === "teachers" ? "giáo viên" : "trợ giảng"}</h5>
          <button type="button" className="btn-close" aria-label="Đóng" disabled={saving} onClick={() => setStopping(null)} />
        </div>
        <form onSubmit={stop} className="d-flex flex-column overflow-hidden">
          <div className="modal-body">
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <p className="text-break">Ngừng phân công <strong>{"teacherId" in stopping.assignment
              ? stopping.assignment.teacherName || `#${stopping.assignment.teacherId}`
              : stopping.assignment.taName || `#${stopping.assignment.taId}`}</strong> tại lớp <strong>{item.className}</strong>?</p>
            <p className="text-muted mb-0">Lịch học, tài liệu và bài tập của lớp được giữ nguyên.</p>
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setStopping(null)}>Hủy bỏ</button>
            <button type="submit" className="btn btn-danger" disabled={saving}>{saving ? "Đang lưu..." : "Xác nhận ngừng phân công"}</button>
          </div>
        </form>
      </div></div>
    </div>}
    {kind && <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="class-staff-title" tabIndex={-1} style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div className="modal-content border-0 shadow-lg">
        <div className="modal-header bg-primary text-white">
          <h5 id="class-staff-title" className="modal-title fw-bold">Phân công {kind === "teachers" ? "giáo viên" : "trợ giảng"}</h5>
          <button type="button" className="btn-close btn-close-white" aria-label="Đóng" disabled={saving} onClick={() => setKind(null)} />
        </div>
        <form onSubmit={save} className="d-flex flex-column overflow-hidden">
          <div className="modal-body">
            <div className="mb-3 text-break"><strong>{item.className}</strong><div className="small text-muted">{item.subjectName || `Môn #${item.subjectId}`}</div></div>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {candidates.loading ? <div className="text-muted" role="status">Đang tải danh sách tài khoản...</div>
              : candidates.error ? <div className="alert alert-danger" role="alert">{candidates.error} <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => setRetry(value => value + 1)}>Thử lại</button></div>
                : candidates.data?.length ? <>
                  <label htmlFor="class-staff-user" className="form-label fw-semibold">{kind === "teachers" ? "Giáo viên" : "Trợ giảng"} <span className="text-danger">*</span></label>
                  <select id="class-staff-user" name="staffUserId" className="form-select" value={userId} disabled={saving} required onChange={event => {setUserId(event.target.value); setError(null);}}>
                    <option value="">Chọn {kind === "teachers" ? "giáo viên" : "trợ giảng"}</option>
                    {candidates.data.map(user => <option key={user.userId} value={user.userId}>{user.fullName} ({user.userCode}){user.specialty ? ` — ${user.specialty}` : ""}</option>)}
                  </select>
                </> : <p className="text-muted mb-0">Không còn {kind === "teachers" ? "giáo viên" : "trợ giảng"} đang hoạt động để phân công vào lớp.</p>}
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-outline-secondary" disabled={saving} onClick={() => setKind(null)}>Hủy bỏ</button>
            <button type="submit" className="btn btn-primary" disabled={saving || candidates.loading || !!candidates.error || !userId}>{saving ? "Đang lưu..." : "Lưu phân công"}</button>
          </div>
        </form>
      </div></div>
    </div>}
  </>;
}
