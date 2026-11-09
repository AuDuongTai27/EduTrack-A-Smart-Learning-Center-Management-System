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
    for (const item of classes.data ?? []) if (!options.has(item.subjectId)) options.set(item.subjectId, item.subjectName || `Môn #${item.subjectId}`);
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
      if (!result.success) throw new Error(result.message || "Máy chủ chưa xác nhận xóa lớp.");
      setSuccess(`Đã xóa lớp học “${deleting.className}”.`);
      setDeleting(null); refresh();
    } catch (cause) {setDeleteError(classError(cause));}
    finally {deleteInFlight.current = false; setDeletingBusy(false);}
  };
  return (
    <>
      <PageHeader title="Class Management" breadcrumbItems={[{label: roleName, path: `/${role}`}, {label: "Classes"}]}
        action={<div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary" disabled={classes.loading} onClick={refresh}><i className="bi bi-arrow-clockwise me-1" />Tải lại</button>
          <button type="button" className="btn btn-primary d-flex align-items-center shadow-sm" onClick={() => {setSuccess(null); setEditor("new");}}><i className="bi bi-plus-square me-2" />Add Class</button>
        </div>} />
      {success && <div className="alert alert-success alert-dismissible" role="status">{success}<button type="button" className="btn-close" aria-label="Đóng thông báo" onClick={() => setSuccess(null)} /></div>}
      {classes.error && <div className="alert alert-danger" role="alert">{classes.error} <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>Thử lại</button></div>}
      {subjects.error && <div className="alert alert-warning" role="alert">Danh sách môn học: {subjects.error} Các lớp đã tải vẫn hiển thị.</div>}
      {grades.error && <div className="alert alert-warning" role="alert">Danh mục khối lớp: {grades.error} <button type="button" className="btn btn-sm btn-outline-secondary" onClick={refresh}>Tải lại khối lớp</button></div>}
      <div className="d-flex flex-wrap mb-3">
        <div className="nav nav-pills bg-white p-1 rounded-3 shadow-sm border" role="tablist" aria-label="Chế độ xem lớp">
          {([ ["grade", "Theo khối lớp", "bi-collection"], ["all", "Tất cả lớp", "bi-list-ul"] ] as const).map(([value, label, icon]) =>
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
              <input className="form-control ps-5" aria-label="Tìm tên lớp" placeholder="Search by class name..." value={search} onChange={event => {setSearch(event.target.value); setCurrentPage(1);}} />
            </div></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Lọc khối lớp" value={grade} onChange={event => {setGrade(event.target.value); setCurrentPage(1);}}>
              <option value="All">Tất cả khối lớp</option>{gradeOptions.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
              <option value="unclassified">Chưa phân loại</option>
            </select></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Lọc môn học" value={subject} onChange={event => {setSubject(event.target.value); setCurrentPage(1);}}>
              <option value="All">All Subjects (Tất cả môn)</option>{subjectOptions.map(([id, name]) => <option key={id} value={String(id)}>{name}</option>)}
            </select></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Lọc trạng thái" value={status} onChange={event => {setStatus(event.target.value); setCurrentPage(1);}}>
              <option value="All">All Statuses</option>{statuses.map(item => <option key={item} value={item}>{item}</option>)}
            </select></div>
            <div className="col-12 col-sm-6 col-xl-2"><select className="form-select" aria-label="Sắp xếp lớp" value={sort} onChange={event => {setSort(event.target.value); setCurrentPage(1);}}>
              <option value="az">Sort A-Z</option><option value="za">Sort Z-A</option><option value="newest">Newest First</option><option value="oldest">Oldest First</option>
            </select></div>
          </div>
        </div>
        <div id="class-list-panel" role="tabpanel" aria-labelledby={`class-view-${view}`}>
        {view === "grade" ? classes.loading ? <div className="p-5 text-center text-muted" role="status">Đang nạp danh sách lớp học...</div>
          : classes.error ? <div className="p-5 text-center text-danger">Chưa tải được danh sách lớp. Vui lòng thử lại.</div>
            : !filtered.length ? <div className="p-5 text-center text-muted">{classes.data?.length ? "Không tìm thấy lớp học phù hợp với bộ lọc." : "Chưa có lớp học nào."}</div>
              : <><div className="px-3 pt-3 small text-muted">Tổng: {filtered.length} lớp</div><GradeClassGroups items={filtered} role={role}
                onEdit={item => {setSuccess(null); setEditor(item.classId);}}
                onDelete={item => {setSuccess(null); setDeleteError(null); setDeleting(item);}} /></>
          : <>
        <TableToolbar totalItems={filtered.length} totalLabel="Total classes" entriesPerPage={entries} onEntriesPerPageChange={value => {setEntries(value); setCurrentPage(1);}} />
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover" aria-label="Danh sách lớp học">
            <thead className="table-light"><tr><th>No.</th><th>Mã lớp</th><th>Tên lớp học</th><th>Môn học</th><th>Phòng học</th><th>Học phí/tháng</th><th>Thời gian</th><th>Trạng thái</th><th>Khối lớp</th><th className="text-center">Thao tác</th></tr></thead>
            <tbody>
              {classes.loading ? <tr><td colSpan={10} className="text-center py-5 text-muted" role="status"><span className="spinner-border spinner-border-sm me-2" />Đang nạp danh sách lớp học...</td></tr>
                : classes.error ? <tr><td colSpan={10} className="text-center py-5 text-danger">Chưa tải được danh sách lớp. Vui lòng thử lại.</td></tr>
                  : !visible.length ? <tr><td colSpan={10} className="text-center py-5 text-muted">{classes.data?.length ? "Không tìm thấy lớp học phù hợp với bộ lọc." : "Chưa có lớp học nào."}</td></tr>
                    : visible.map((item, index) => <tr key={item.classId}>
                      <td>{(page - 1) * entries + index + 1}</td><td><span className="badge bg-light text-primary border font-monospace">#CLS{item.classId}</span></td>
                      <td><Link className="fw-bold text-decoration-none" to={`/${role}/classes/${item.classId}`}>{item.className}</Link></td>
                      <td><div className="d-flex flex-wrap gap-1"><SubjectBadge subject={item.subjectName || `Môn #${item.subjectId}`} /></div></td>
                      <td>{item.room || "Chưa xếp phòng"}</td><td>{formatVND(item.tuitionFee)}</td>
                      <td><div className="small">{classDate(item.startDate)}<br />{item.endDate ? `Đến ${classDate(item.endDate)}` : "Chưa xác định kết thúc"}</div></td>
                      <td><DotStatusBadge status={item.status} /></td>
                      <td>{classGradeLabel(item)}</td>
                      <td><div className="d-flex justify-content-center gap-1">
                        <Link className="table-action-btn text-primary" to={`/${role}/classes/${item.classId}`} title="Xem chi tiết lớp" aria-label={`Xem ${item.className}`}><i className="bi bi-eye" /></Link>
                        <TableActionButton action="Edit" title={`Sửa ${item.className}`} onClick={() => {setSuccess(null); setEditor(item.classId);}} />
                        <TableActionButton action="Delete" title={`Xóa ${item.className}`} onClick={() => {setSuccess(null); setDeleteError(null); setDeleting(item);}} />
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
        onClose={() => setEditor(null)} onSaved={item => {setSuccess(`Đã lưu lớp học “${item.className}” (#CLS${item.classId}).`); setEditor(null); refresh();}} />}
      {deleting && <div className="modal show d-block" role="dialog" aria-modal="true" aria-labelledby="class-delete-title" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
        <div className="modal-dialog modal-dialog-centered"><div className="modal-content border-0 shadow-lg">
          <div className="modal-header"><h5 id="class-delete-title" className="modal-title">Xóa lớp học</h5><button type="button" className="btn-close" aria-label="Đóng" disabled={deletingBusy} onClick={() => setDeleting(null)} /></div>
          <div className="modal-body p-4">
            <p>Bạn muốn xóa vĩnh viễn lớp <strong>{deleting.className}</strong>?</p>
            <div className="alert alert-warning small mb-0">Chỉ xóa vĩnh viễn lớp chưa có dữ liệu liên quan. Backend sẽ từ chối nếu có đăng ký học sinh, lịch học, phân công Teacher/TA, buổi học, điểm danh, bài tập, hóa đơn, thanh toán hoặc lịch sử khác. Hãy sửa trạng thái thành Inactive hoặc Completed để giữ lịch sử.</div>
            {deleteError && <div className="alert alert-danger mt-3 mb-0" role="alert">{deleteError}</div>}
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline-secondary" disabled={deletingBusy} onClick={() => setDeleting(null)}>Hủy bỏ</button>
            <button type="button" className="btn btn-danger" disabled={deletingBusy} onClick={remove}>{deletingBusy ? "Đang xóa..." : "Xác nhận xóa"}</button></div>
        </div></div>
      </div>}
    </>
  );
}
