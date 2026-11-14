import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";
import ClassFormModal from "../../../components/management/classes/ClassFormModal";
import GradeClassGroups from "../../../components/management/classes/GradeClassGroups";
import { useClassManagement } from "../../../hooks/useClassManagement";
import { CLASS_STATUSES, classDate, classError, classGradeLabel, filterClasses } from "../../../../BLL/services/classManagementService";
import type { ManagementRole } from "../../../../BLL/models/ClassManagement";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import managementDAL from "../../../../DAL/managementDAL";
import { formatVND } from "../../../utils/formatCurrency";

export default function ClassManagementPage({role}: {role: ManagementRole}) {
  const {classes, subjects, grades, refresh} = useClassManagement();
  const [view, setView] = useState<"grade" | "all">("grade");
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedGrade = searchParams.get("gradeId") ?? "All";
  const grade = requestedGrade === "unclassified" || (/^[1-9]\d*$/.test(requestedGrade) && Number.isSafeInteger(Number(requestedGrade)) && Number(requestedGrade) <= 2_147_483_647) ? requestedGrade : "All";
  const setGrade = (value: string) => setSearchParams(previous => {
    const next = new URLSearchParams(previous);
    if (value === "All") next.delete("gradeId"); else next.set("gradeId", value);
    return next;
  }, {replace: true});
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [editor, setEditor] = useState<number | "new" | null>(null);
  const [deleting, setDeleting] = useState<ClassDto | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const deleteInFlight = useRef(false);
  const filtered = useMemo(() => filterClasses(classes.data ?? [], search, subject, status, sort, grade), [classes.data, search, subject, status, sort, grade]);
  const gradeOptions = useMemo(() => {
    const options = new Map((grades.data ?? []).map(item => [item.gradeId, item.gradeName]));
    for (const item of classes.data ?? []) if (item.gradeId != null && !options.has(item.gradeId)) options.set(item.gradeId, classGradeLabel(item));
    return [...options.entries()].sort(([a], [b]) => a - b);
  }, [classes.data, grades.data]);
  const subjectOptions = useMemo(() => {
    const options = new Map((subjects.data ?? []).map(item => [item.subjectId, item.subjectName]));
    for (const item of classes.data ?? []) if (!options.has(item.subjectId)) options.set(item.subjectId, item.subjectName || `Subject #${item.subjectId}`);
    return [...options.entries()];
  }, [classes.data, subjects.data]);
  const statuses = [...new Set([...CLASS_STATUSES, ...(classes.data ?? []).map(item => item.status)])];
  const page = Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / entries)));
  const visible = filtered.slice((page - 1) * entries, page * entries);
  const roleName = role === "center-manager" ? "Center Manager" : "Admin Staff";
  const remove = async () => {
    if (!deleting || deleteInFlight.current) return;
    deleteInFlight.current = true; setDeletingBusy(true); setDeleteError(null);
    try {
      const result = await managementDAL.deleteClass(deleting.classId);
      if (!result.success) throw new Error(result.message || "Server did not confirm class deletion.");
      setSuccess(`Deleted class “${deleting.className}”.`);
      setDeleting(null); refresh();
    } catch (cause) {setDeleteError(classError(cause));}
    finally {deleteInFlight.current = false; setDeletingBusy(false);}
  };
  return (
    <>
      <PageHeader title="Class Management" breadcrumbItems={[{label: roleName, path: `/${role}`}, {label: "Classes"}]}
        action={<div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary" disabled={classes.loading} onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Refresh</button>
          <button type="button" className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => {setSuccess(null); setEditor("new");}}><i className="bi bi-plus-square me-2" />Add Class</button>
        </div>} />
      {success && <div className="alert alert-success alert-dismissible" role="status">{success}<button type="button" className="btn-close" aria-label="Close notification" onClick={() => setSuccess(null)} /></div>}
      {classes.error && <div className="alert alert-danger" role="alert">{classes.error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>Retry</button></div>}
      {subjects.error && <div className="alert alert-warning" role="alert">Subject list: {subjects.error} Loaded classes are still displayed.</div>}
      {grades.error && <div className="alert alert-warning" role="alert">Grade list: {grades.error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={refresh}>Reload grades</button></div>}
      <div className="d-flex flex-wrap mb-3">
        <div className="nav nav-pills bg-white p-1 rounded-3 shadow-sm border" role="tablist" aria-label="Class view mode">
          {([ ["grade", "By Grade", "bi-collection"], ["all", "All Classes", "bi-list-ul"] ] as const).map(([value, label, icon]) =>
            <button key={value} id={`class-view-${value}`} type="button" role="tab" aria-selected={view === value}
              aria-controls="class-list-panel" className={`nav-link px-3 fw-bold${view === value ? " active" : " text-muted"}`}
              onClick={() => setView(value)}><i className={`bi ${icon} me-2`} />{label}</button>)}
        </div>
      </div>
      <div className="card user-list-card border-0 shadow-sm">
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-xl-4"><div className="user-search position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
              <input className="form-control ps-5" aria-label="Search by class name" placeholder="Search by class name..." value={search} onChange={event => {setSearch(event.target.value); setCurrentPage(1);}} />
            </div></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Filter by grade" value={grade} onChange={event => {setGrade(event.target.value); setCurrentPage(1);}}>
              <option value="All">All Grades</option>{gradeOptions.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
              <option value="unclassified">Unclassified</option>
            </select></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Filter by subject" value={subject} onChange={event => {setSubject(event.target.value); setCurrentPage(1);}}>
              <option value="All">All Subjects</option>{subjectOptions.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
            </select></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Filter by status" value={status} onChange={event => {setStatus(event.target.value); setCurrentPage(1);}}>
              <option value="All">All Statuses</option>{statuses.map(item => <option key={item} value={item}>{item}</option>)}
            </select></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Sort classes" value={sort} onChange={event => {setSort(event.target.value); setCurrentPage(1);}}>
              <option value="az">Sort A-Z</option><option value="za">Sort Z-A</option><option value="newest">Newest First</option><option value="oldest">Oldest First</option>
            </select></div>
          </div>
        </div>
        <div id="class-list-panel" role="tabpanel" aria-labelledby={`class-view-${view}`}>
        {view === "grade" ? classes.loading ? <div className="p-5 text-center text-muted" role="status">Loading class list...</div>
          : classes.error ? <div className="p-5 text-center text-danger">Failed to load class list. Please try again.</div>
            : !filtered.length ? <div className="p-5 text-center text-muted">{classes.data?.length ? "No classes match the filter." : "No classes available."}</div>
              : <><div className="px-3 pt-3 small text-muted">Total: {filtered.length} classes</div><GradeClassGroups items={filtered} role={role}
                onEdit={item => {setSuccess(null); setEditor(item.classId);}}
                onDelete={item => {setSuccess(null); setDeleteError(null); setDeleting(item);}} /></>
          : <>
        <TableToolbar totalItems={filtered.length} totalLabel="Total classes" entriesPerPage={entries} onEntriesPerPageChange={value => {setEntries(value); setCurrentPage(1);}} />
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover" aria-label="Class list">
            <thead className="table-light"><tr><th>No.</th><th>Class Code</th><th>Class Name</th><th>Subject</th><th>Room</th><th>Monthly Tuition</th><th>Duration</th><th>Status</th><th>Grade</th><th className="text-center">Action</th></tr></thead>
            <tbody>
              {classes.loading ? <tr><td colSpan={10} className="text-center py-5 text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Loading class list...</td></tr>
                : classes.error ? <tr><td colSpan={10} className="text-center py-5 text-danger">Failed to load class list. Please try again.</td></tr>
                  : !visible.length ? <tr><td colSpan={10} className="text-center py-5 text-muted">{classes.data?.length ? "No classes match the filter." : "No classes available."}</td></tr>
                    : visible.map((item, index) => <tr key={item.classId}>
                      <td>{(page - 1) * entries + index + 1}</td><td><span className="badge bg-light text-primary border font-monospace">#CLS{item.classId}</span></td>
                      <td><Link className="fw-bold text-decoration-none" to={`/${role}/classes/${item.classId}`}>{item.className}</Link></td>
                      <td><div className="d-flex flex-wrap gap-1"><SubjectBadge subject={item.subjectName || `Subject #${item.subjectId}`} /></div></td>
                      <td>{item.room || "No room assigned"}</td><td>{formatVND(item.tuitionFee)}</td>
                      <td><div className="small">{classDate(item.startDate)}<br />{item.endDate ? `Until ${classDate(item.endDate)}` : "End date not set"}</div></td>
                      <td><DotStatusBadge status={item.status} /></td>
                      <td>{classGradeLabel(item)}</td>
                      <td><div className="d-flex justify-content-center gap-1">
                        <Link className="table-action-btn text-primary" to={`/${role}/classes/${item.classId}`} title="View class details" aria-label={`View ${item.className}`}><i className="bi bi-eye" /></Link>
                        <TableActionButton action="Edit" title={`Edit ${item.className}`} onClick={() => {setSuccess(null); setEditor(item.classId);}} />
                        <TableActionButton action="Delete" title={`Delete ${item.className}`} onClick={() => {setSuccess(null); setDeleteError(null); setDeleting(item);}} />
                      </div></td>
                    </tr>)}
            </tbody>
          </table>
        </div>
        {!classes.loading && !classes.error && filtered.length > 0 && <Pagination currentPage={page} totalItems={filtered.length} entriesPerPage={entries} itemLabel="classes" onPageChange={setCurrentPage} />}
        </>}
        </div>
      </div>
      {editor !== null && <ClassFormModal key={editor} classId={editor === "new" ? undefined : editor} subjects={subjects} grades={grades} onRetrySubjects={refresh}
        onClose={() => setEditor(null)} onSaved={item => {setSuccess(`Saved class “${item.className}” (#CLS${item.classId}).`); setEditor(null); refresh();}} />}
      {deleting && <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="class-delete-title" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content border-0 shadow-lg">
          <div className="modal-header"><h5 id="class-delete-title" className="modal-title">Delete Class</h5><button type="button" className="btn-close" aria-label="Close" disabled={deletingBusy} onClick={() => setDeleting(null)} /></div>
          <div className="modal-body p-4">
            <p>Are you sure you want to permanently delete class <strong>{deleting.className}</strong>?</p>
            <div className="alert alert-warning small mb-0">Only classes with no associated data can be permanently deleted. Backend will reject deletion if there are enrolled students, schedules, Teacher/TA assignments, sessions, attendance, assignments, invoices, payments, or other history. Please change status to Inactive or Completed to preserve history.</div>
            {deleteError && <div className="alert alert-danger mt-3 mb-0" role="alert">{deleteError}</div>}
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={deletingBusy} onClick={() => setDeleting(null)}>Cancel</button>
            <button type="button" className="btn btn-danger" disabled={deletingBusy} onClick={remove}>{deletingBusy ? "Deleting..." : "Confirm Delete"}</button></div>
        </div></div>
      </div>}
    </>
  );
}
