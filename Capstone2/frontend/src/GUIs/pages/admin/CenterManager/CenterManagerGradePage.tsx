import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../components/Common/PageHeader";
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
  const filtered = useMemo(() => filterGrades(items, search, sort), [items, search, sort]);
  const page = Math.min(currentPage, Math.max(1, Math.ceil(filtered.length / entries)));
  const visible = filtered.slice((page - 1) * entries, page * entries);
  const remove = async () => {
    if (!deleting || deleteLock.current) return;
    deleteLock.current = true; setDeletingBusy(true); setDeleteError(null);
    try {await gradeManagementApi.delete(deleting.gradeId); setSuccess(`Đã xóa khối “${deleting.gradeName}”.`); setDeleting(null); refresh();}
    catch (cause) {setDeleteError(classError(cause));}
    finally {deleteLock.current = false; setDeletingBusy(false);}
  };
  return <>
    <PageHeader title="Grade Management" breadcrumbItems={[{label: "Center Manager", path: "/center-manager"}, {label: "Grades"}]}
      action={<div className="d-flex flex-wrap gap-2"><button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Tải lại</button>
        <button type="button" className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => {setSuccess(null); setEditor("new");}}><i className="bi bi-plus-square me-2" />Add Grade</button></div>} />
    {success && <div className="alert alert-success alert-dismissible" role="status">{success}<button type="button" className="btn-close" aria-label="Đóng thông báo" onClick={() => setSuccess(null)} /></div>}
    {error && <div className="alert alert-danger" role="alert">{error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>Thử lại</button></div>}
    <div className="card user-list-card border-0 shadow-sm">
      <div className="card-header user-list-header bg-white py-3 border-bottom"><div className="row g-3 align-items-center">
        <div className="col-12 col-lg-8"><div className="user-search position-relative"><i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input className="form-control ps-5" aria-label="Tìm khối lớp" placeholder="Search by grade name..." value={search} onChange={event => {setSearch(event.target.value); setCurrentPage(1);}} /></div></div>
        <div className="col-12 col-lg-4"><select className="form-select" aria-label="Sắp xếp khối lớp" value={sort} onChange={event => {setSort(event.target.value); setCurrentPage(1);}}>
          <option value="az">Sort by Name A-Z</option><option value="za">Sort by Name Z-A</option><option value="classes">Nhiều lớp nhất</option><option value="newest">Newest First</option><option value="oldest">Oldest First</option>
        </select></div>
      </div></div>
      <TableToolbar totalItems={filtered.length} totalLabel="Total grades" entriesPerPage={entries} onEntriesPerPageChange={value => {setEntries(value); setCurrentPage(1);}} />
      <div className="table-responsive"><table className="table user-table align-middle mb-0 table-hover" aria-label="Danh sách khối lớp">
        <thead className="table-light"><tr><th>No.</th><th>Mã khối</th><th>Tên khối lớp</th><th className="text-center">Số lớp</th><th className="text-center">Thao tác</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={5} className="text-center py-5 text-muted" role="status">Đang tải danh sách khối lớp...</td></tr>
          : error ? <tr><td colSpan={5} className="text-center py-5 text-danger">Chưa tải được danh sách khối lớp.</td></tr>
            : !visible.length ? <tr><td colSpan={5} className="text-center py-5 text-muted">{items.length ? "Không tìm thấy khối lớp phù hợp." : "Chưa có khối lớp nào."}</td></tr>
              : visible.map((item, index) => <tr key={item.gradeId}>
                <td>{(page - 1) * entries + index + 1}</td><td><span className="badge bg-light text-primary border font-monospace">#GR{item.gradeId}</span></td>
                <td className="fw-bold text-dark text-break">{item.gradeName}</td>
                <td className="text-center"><Link to={`/center-manager/classes?gradeId=${item.gradeId}`} className="badge bg-secondary-subtle text-secondary text-decoration-none px-3 py-2" aria-label={`Xem lớp của ${item.gradeName}`}>{item.totalClasses} lớp</Link></td>
                <td><div className="d-flex justify-content-center gap-1">
                  <Link to={`/center-manager/classes?gradeId=${item.gradeId}`} className="btn table-action-btn text-primary" title={`Xem ${item.gradeName}`} aria-label={`Xem ${item.gradeName}`}><i className="bi bi-eye" /></Link>
                  <TableActionButton action="Edit" title={`Sửa ${item.gradeName}`} onClick={() => {setSuccess(null); setEditor(item.gradeId);}} />
                  <TableActionButton action="Delete" title={`Xóa ${item.gradeName}`} onClick={() => {setDeleteError(null); setDeleting(item);}} />
                </div></td>
              </tr>)}</tbody>
      </table></div>
      {!loading && !error && filtered.length > 0 && <div className="p-3 border-top"><Pagination currentPage={page} totalItems={filtered.length} entriesPerPage={entries} itemLabel="grades" onPageChange={setCurrentPage} /></div>}
    </div>
    {editor !== null && <GradeFormModal key={editor} id={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} onSaved={item => {setSuccess(`Đã lưu khối “${item.gradeName}”.`); setEditor(null); refresh();}} />}
    {deleting && <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="grade-delete-title" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"><div className="modal-content border-0 shadow-lg">
        <div className="modal-header"><h5 id="grade-delete-title" className="modal-title">Xóa khối lớp</h5><button type="button" className="btn-close" aria-label="Đóng" disabled={deletingBusy} onClick={() => setDeleting(null)} /></div>
        <div className="modal-body p-4"><p>Xóa vĩnh viễn khối <strong>{deleting.gradeName}</strong>?</p>
          <div className="alert alert-warning mb-0">{deleting.totalClasses > 0 ? `Khối đang có ${deleting.totalClasses} lớp liên kết nên không được xóa.` : "Chỉ khối chưa có Class liên kết mới được xóa. Backend sẽ kiểm tra lại trước khi xóa."}</div>
          {deleteError && <div className="alert alert-danger mt-3 mb-0" role="alert">{deleteError}</div>}
        </div>
        <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={deletingBusy} onClick={() => setDeleting(null)}>Hủy bỏ</button>
          <button type="button" className="btn btn-danger" disabled={deletingBusy || deleting.totalClasses > 0} onClick={remove}>{deletingBusy ? "Đang xóa..." : "Xác nhận xóa"}</button></div>
      </div></div>
    </div>}
  </>;
}
