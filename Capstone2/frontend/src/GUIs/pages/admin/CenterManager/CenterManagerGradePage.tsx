import ModalIcon from '../../../components/Common/ModalIcon';
import ModalSurface from '../../../components/Common/ModalSurface';
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import TableActionButton from "../../../components/Common/TableActionButton";
import GradeFormModal from "../../../components/management/grades/GradeFormModal";
import type { ManagedGradeDto } from "../../../../BLL/models/GradeDto";
import { gradeManagementApi } from "../../../../api/gradeManagementApi";
import { filterGrades } from "../../../../BLL/services/gradeManagementService";
import { classError } from "../../../../BLL/services/classManagementService";

export default function CenterManagerGradePage() {
  const [items, setItems] = useState<ManagedGradeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [editor, setEditor] = useState<number | "new" | null>(null);
  const [deleting, setDeleting] = useState<ManagedGradeDto | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const deleteLock = useRef(false);
  const refresh = () => {setLoading(true); setError(null); setRevision(value => value + 1);};
  useEffect(() => {
    let active = true;
    gradeManagementApi.getAll().then(data => {if (active) setItems(data);})
      .catch(cause => {if (active) {setItems([]); setError(classError(cause));}})
      .finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, [revision]);
  const filtered = useMemo(
    () =>
      filterGrades(items, search, sort).filter(
        item => statusFilter === "All" || (item.status || "active").toLowerCase() === statusFilter.toLowerCase()
      ),
    [items, search, sort, statusFilter]
  );
  const page = Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / entries)));
  const visible = filtered.slice((page - 1) * entries, page * entries);
  const toggleStatus = async () => {
    if (!deleting || deleteLock.current) return;
    const currentStatus = (deleting.status || "active").toLowerCase();
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    deleteLock.current = true; setDeletingBusy(true); setDeleteError(null);
    try {
      await gradeManagementApi.updateStatus(deleting.gradeId, nextStatus);
      setSuccess(`Updated grade “${deleting.gradeName}” status to ${nextStatus.toUpperCase()}.`);
      setDeleting(null); refresh();
    }
    catch (cause) {setDeleteError(classError(cause));}
    finally {deleteLock.current = false; setDeletingBusy(false);}
  };
  return <>
    <PageHeader title="Grade Management" breadcrumbItems={[{label: "Center Manager", path: "/center-manager"}, {label: "Grades"}]}
      action={<button type="button" className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => {setSuccess(null); setEditor("new");}}><i className="bi bi-plus-square me-2" />Add Grade</button>} />
    {success && <div className="alert alert-success alert-dismissible" role="status">{success}<button type="button" className="btn-close" aria-label="Close notification" onClick={() => setSuccess(null)} /></div>}
    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>Retry</button></div>}
    <div className="card user-list-card border-0 shadow-sm">
      <div className="card-header user-list-header bg-white py-3 border-bottom"><div className="row g-3 align-items-center">
        <div className="col-12 col-lg-6"><div className="user-search position-relative"><i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input className="form-control ps-5" aria-label="Search grades" placeholder="Search by grade name..." value={search} onChange={event => {setSearch(event.target.value); setCurrentPage(1);}} /></div></div>
        <div className="col-12 col-sm-6 col-lg-3"><select className="form-select" aria-label="Filter grades by status" value={statusFilter} onChange={event => {setStatusFilter(event.target.value); setCurrentPage(1);}}>
          <option value="All">All Statuses</option><option value="active">Active</option><option value="inactive">Inactive</option>
        </select></div>
        <div className="col-12 col-sm-6 col-lg-3"><select className="form-select" aria-label="Sort grades" value={sort} onChange={event => {setSort(event.target.value); setCurrentPage(1);}}>
          <option value="az">Sort by Name A-Z</option><option value="za">Sort by Name Z-A</option><option value="classes">Most Classes</option><option value="newest">Newest First</option><option value="oldest">Oldest First</option>
        </select></div>
      </div></div>
      <TableToolbar totalItems={filtered.length} totalLabel="Total grades" entriesPerPage={entries} onEntriesPerPageChange={value => {setEntries(value); setCurrentPage(1);}} />
      <div className="table-responsive"><table className="table user-table align-middle mb-0 table-hover" aria-label="Grade list">
        <thead className="table-light"><tr><th>No.</th><th>Grade Name</th><th className="text-center">Total Classes</th><th>Status</th><th className="text-center">Action</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={5} className="text-center py-5 text-muted" role="status">Loading grades...</td></tr>
          : error ? <tr><td colSpan={5} className="text-center py-5 text-danger">Failed to load grades.</td></tr>
            : !visible.length ? <tr><td colSpan={5} className="text-center py-5 text-muted">{items.length ? "No matching grades found." : "No grades available."}</td></tr>
              : visible.map((item, index) => <tr key={item.gradeId}>
                <td>{(page - 1) * entries + index + 1}</td>
                <td className="fw-bold text-dark text-break">{item.gradeName}</td>
                <td className="text-center"><Link to={`/center-manager/classes?gradeId=${item.gradeId}`} className="badge bg-secondary-subtle text-secondary text-decoration-none px-3 py-2" aria-label={`View classes for ${item.gradeName}`}>{item.totalClasses} classes</Link></td>
                <td><DotStatusBadge status={item.status || "active"} /></td>
                <td><div className="d-flex justify-content-center gap-1">
                  <Link to={`/center-manager/classes?gradeId=${item.gradeId}`} className="btn table-action-btn text-primary" title={`View ${item.gradeName}`} aria-label={`View ${item.gradeName}`}><i className="bi bi-eye" /></Link>
                  <TableActionButton action="Edit" title={`Edit ${item.gradeName}`} onClick={() => {setSuccess(null); setEditor(item.gradeId);}} />
                  <TableActionButton
                    action={(item.status || "active").toLowerCase() === "active" ? "Lock" : "Unlock"}
                    title={(item.status || "active").toLowerCase() === "active" ? `Set ${item.gradeName} to Inactive` : `Activate ${item.gradeName}`}
                    onClick={() => {setDeleteError(null); setDeleting(item);}}
                  />
                </div></td>
              </tr>)}</tbody>
      </table></div>
      {!loading && !error && filtered.length > 0 && <div className="p-3 border-top"><Pagination currentPage={page} totalItems={filtered.length} entriesPerPage={entries} itemLabel="grades" onPageChange={setCurrentPage} /></div>}
    </div>
    {editor !== null && <GradeFormModal key={editor} id={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} onSaved={item => {setSuccess(`Saved grade “${item.gradeName}”.`); setEditor(null); refresh();}} />}
    {deleting && <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="grade-delete-title" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-sm"><ModalSurface className="modal-content border-0 shadow-lg">
        <div className={`modal-header ${(deleting.status || "active").toLowerCase() === "active" ? "bg-warning text-dark" : "bg-success text-white"}`}>
          <h5 id="grade-delete-title" className="modal-title fw-bold">
            <ModalIcon name={(deleting.status || "active").toLowerCase() === "active" ? "lock" : "unlock"} />
            {(deleting.status || "active").toLowerCase() === "active" ? "Deactivate Grade" : "Activate Grade"}
          </h5>
          <button type="button" className={`btn-close ${(deleting.status || "active").toLowerCase() === "active" ? "" : "btn-close-white"}`} aria-label="Close" disabled={deletingBusy} onClick={() => setDeleting(null)} />
        </div>
        <div className="modal-body p-4">
          <p>
            {(deleting.status || "active").toLowerCase() === "active"
              ? <>Are you sure you want to set grade <strong>{deleting.gradeName}</strong> to <strong>INACTIVE</strong>?</>
              : <>Are you sure you want to reactivate grade <strong>{deleting.gradeName}</strong> to <strong>ACTIVE</strong>?</>}
          </p>
          <div className="alert alert-info mb-0">
            All {deleting.totalClasses} linked classes, enrolled students, and teacher assignments for this grade will be safely preserved.
          </div>
          {deleteError && <div className="alert alert-danger mt-3 mb-0" role="alert">{deleteError}</div>}
        </div>
        <div className="modal-footer bg-light"><button type="button" className="btn btn-outline-secondary" disabled={deletingBusy} onClick={() => setDeleting(null)}>Cancel</button>
          <button type="button" className={`btn ${(deleting.status || "active").toLowerCase() === "active" ? "btn-warning fw-bold" : "btn-success"}`} disabled={deletingBusy} onClick={toggleStatus}>
            {deletingBusy ? "Updating..." : (deleting.status || "active").toLowerCase() === "active" ? "Set Inactive" : "Activate Grade"}
          </button></div>
      </ModalSurface></div>
    </div>}
  </>;
}
