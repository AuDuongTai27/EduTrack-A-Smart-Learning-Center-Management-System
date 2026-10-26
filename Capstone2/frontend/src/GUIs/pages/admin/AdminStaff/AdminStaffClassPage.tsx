import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import SubjectBadge from "../../../components/Common/SubjectBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import classDAL from "../../../../DAL/classDAL";
import subjectDAL from "../../../../DAL/subjectDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";
import type { SubjectDto } from "../../../../BLL/models/SubjectDto";

export default function AdminStaffClassPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("All");
  const [selectedSort, setSelectedSort] = useState<string>("az");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Detail Modal state (GetById)
  const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  // Add Class Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    className: "",
    subjectId: 0,
    room: "Phòng 201",
    tuitionFee: 3000000,
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: "active",
  });

  // Edit Class Modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    classId: 0,
    className: "",
    subjectId: 0,
    room: "",
    tuitionFee: 0,
    startDate: "",
    endDate: "",
    status: "active",
  });

  // Delete Confirmation Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [classToDelete, setClassToDelete] = useState<ClassDto | null>(null);

  // Form submission and alert states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [classesRes, subjectsRes] = await Promise.all([
          classDAL.getAllClasses(),
          subjectDAL.getAllSubjects(),
        ]);

        if (isMounted) {
          if (classesRes.data) setClasses(classesRes.data);
          if (subjectsRes.data) {
            setSubjects(subjectsRes.data);
            if (subjectsRes.data.length > 0) {
              setAddForm((prev) => ({
                ...prev,
                subjectId: prev.subjectId || subjectsRes.data[0].subjectId,
              }));
            }
          }
        }
      } catch (err) {
        console.warn("Lỗi nạp danh sách lớp học & môn học:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Search logic
  const filteredClasses = useMemo(() => {
    return classes
      .filter((c) => {
        const matchSearch =
          searchTerm === "" ||
          c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.subjectName && c.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (c.subjectCode && c.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (c.room && c.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
          String(c.classId).includes(searchTerm);

        const matchSubject =
          selectedSubjectFilter === "All" ||
          String(c.subjectId) === selectedSubjectFilter ||
          c.subjectName === selectedSubjectFilter;

        const matchStatus =
          selectedStatusFilter === "All" ||
          c.status.toLowerCase() === selectedStatusFilter.toLowerCase();

        return matchSearch && matchSubject && matchStatus;
      })
      .sort((a, b) => {
        if (selectedSort === "az") return a.className.localeCompare(b.className);
        if (selectedSort === "za") return b.className.localeCompare(a.className);
        if (selectedSort === "newest") return b.classId - a.classId;
        if (selectedSort === "oldest") return a.classId - b.classId;
        return 0;
      });
  }, [classes, searchTerm, selectedSubjectFilter, selectedStatusFilter, selectedSort]);

  // Paginated list
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredClasses.slice(start, start + entriesPerPage);
  }, [filteredClasses, currentPage, entriesPerPage]);

  // Handle View Details (GetById)
  const handleViewDetails = async (cls: ClassDto) => {
    setLoadingDetail(true);
    try {
      const detail = await classDAL.getClassById(cls.classId);
      setSelectedClass(detail || cls);
    } catch {
      setSelectedClass(cls);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Handle Add Class Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.className.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await classDAL.createClass({
        className: addForm.className.trim(),
        subjectId: Number(addForm.subjectId) || (subjects[0]?.subjectId ?? 1),
        room: addForm.room.trim() || undefined,
        tuitionFee: Number(addForm.tuitionFee) || 0,
        startDate: addForm.startDate,
        endDate: addForm.endDate ? addForm.endDate : undefined,
        status: addForm.status,
      });

      if (res.success && res.data) {
        setClasses([res.data, ...classes]);
        setShowAddModal(false);
        setAddForm({
          className: "",
          subjectId: subjects[0]?.subjectId || 1,
          room: "Phòng 201",
          tuitionFee: 3000000,
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          status: "active",
        });
        setActionSuccessMsg(`Đã tạo lớp học mới "${res.data.className}" (#CLS${res.data.classId}) thành công!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        setActionErrorMsg(res.message || "Không thể tạo lớp học.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Lỗi khi tạo lớp học.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (cls: ClassDto) => {
    setEditForm({
      classId: cls.classId,
      className: cls.className,
      subjectId: cls.subjectId,
      room: cls.room || "",
      tuitionFee: cls.tuitionFee,
      startDate: cls.startDate ? cls.startDate.split("T")[0] : "",
      endDate: cls.endDate ? cls.endDate.split("T")[0] : "",
      status: cls.status || "active",
    });
    setShowEditModal(true);
    setActionErrorMsg(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.className.trim()) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await classDAL.updateClass(editForm.classId, {
        className: editForm.className.trim(),
        subjectId: Number(editForm.subjectId),
        room: editForm.room.trim() || undefined,
        tuitionFee: Number(editForm.tuitionFee) || 0,
        startDate: editForm.startDate,
        endDate: editForm.endDate ? editForm.endDate : undefined,
        status: editForm.status,
      });

      if (res.success && res.data) {
        setClasses(classes.map((c) => (c.classId === editForm.classId ? res.data! : c)));
        setShowEditModal(false);
        setActionSuccessMsg(`Đã cập nhật thông tin lớp học "${res.data.className}" thành công!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        setActionErrorMsg(res.message || "Không thể cập nhật lớp học.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Lỗi khi cập nhật lớp học.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (cls: ClassDto) => {
    setClassToDelete(cls);
    setShowDeleteModal(true);
    setActionErrorMsg(null);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!classToDelete) return;

    setSubmitting(true);
    setActionErrorMsg(null);
    try {
      const res = await classDAL.deleteClass(classToDelete.classId);
      if (res.success) {
        setClasses(classes.filter((c) => c.classId !== classToDelete.classId));
        setShowDeleteModal(false);
        setActionSuccessMsg(`Đã xóa lớp học "${classToDelete.className}" thành công!`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      } else {
        setActionErrorMsg(res.message || "Không thể xóa lớp học.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Lỗi khi xóa lớp học.");
    } finally {
      setSubmitting(false);
      setClassToDelete(null);
    }
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Class Management"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Classes" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center shadow-sm"
            onClick={() => {
              setShowAddModal(true);
              setActionErrorMsg(null);
            }}
          >
            <i className="bi bi-plus-square me-2" />
            Add Class
          </button>
        }
      />

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill fs-5 me-2" />
          <div>{actionSuccessMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Error Notification Alert */}
      {actionErrorMsg && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center mb-4 shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-5 me-2" />
          <div>{actionErrorMsg}</div>
          <button type="button" className="btn-close" onClick={() => setActionErrorMsg(null)} aria-label="Close" />
        </div>
      )}

      {/* Class List Card */}
      <div className="card user-list-card border-0 shadow-sm">
        {/* Filters Header */}
        <div className="card-header user-list-header bg-white py-3 border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-xl-5 col-lg-5">
              <div className="user-search position-relative">
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder="Search by class name, subject, room..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="col-xl-3 col-lg-3 col-md-4">
              <select
                className="form-select"
                value={selectedSubjectFilter}
                onChange={(e) => {
                  setSelectedSubjectFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Subjects (Tất cả môn)</option>
                {subjects.map((s) => (
                  <option key={s.subjectId} value={String(s.subjectId)}>
                    {s.subjectName} ({s.subjectCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-xl-2 col-lg-2 col-md-4">
              <select
                className="form-select"
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="col-xl-2 col-lg-2 col-md-4">
              <select
                className="form-select"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
              >
                <option value="az">Sort A-Z</option>
                <option value="za">Sort Z-A</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={filteredClasses.length}
          totalLabel="Total classes"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Class Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0 table-hover">
            <thead className="table-light">
              <tr>
                <th className="fw-bold">No.</th>
                <th className="fw-bold">Mã lớp</th>
                <th className="fw-bold">Tên lớp học</th>
                <th className="fw-bold">Môn học</th>
                <th className="fw-bold">Phòng học</th>
                <th className="fw-bold">Học phí</th>
                <th className="fw-bold">Thời gian</th>
                <th className="fw-bold">Trạng thái</th>
                <th className="text-center fw-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp danh sách lớp học...
                  </td>
                </tr>
              ) : paginatedClasses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <i className="bi bi-collection fs-2 d-block mb-2 text-secondary" />
                    Không tìm thấy lớp học nào phù hợp.
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((cls, idx) => {
                  const itemIndex = (currentPage - 1) * entriesPerPage + idx + 1;

                  return (
                    <tr key={cls.classId}>
                      <td>{itemIndex}</td>
                      <td>
                        <span className="badge bg-light text-primary border font-monospace">
                          #CLS{cls.classId}
                        </span>
                      </td>
                      <td>
                        <h6 className="mb-0 fw-bold text-dark">{cls.className}</h6>
                      </td>
                      <td>
                        <SubjectBadge subject={cls.subjectName || "Subject"} />
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-geo-alt me-1 text-danger" />
                          {cls.room || "Chưa xếp phòng"}
                        </span>
                      </td>
                      <td>
                        <strong className="text-dark">
                          {(cls.tuitionFee || 0).toLocaleString("vi-VN")} VND
                        </strong>
                      </td>
                      <td>
                        <small className="text-muted d-block">
                          {cls.startDate ? new Date(cls.startDate).toLocaleDateString("vi-VN") : "—"}
                          {cls.endDate ? ` → ${new Date(cls.endDate).toLocaleDateString("vi-VN")}` : ""}
                        </small>
                      </td>
                      <td>
                        <DotStatusBadge status={cls.status || "active"} />
                      </td>
                      <td className="text-center">
                        <div className="btn-group" role="group">
                          {/* View */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewDetails(cls)}
                            title="Xem chi tiết lớp học"
                          >
                            <i className="bi bi-eye" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => handleOpenEditModal(cls)}
                            title="Chỉnh sửa thông tin lớp"
                          >
                            <i className="bi bi-pencil" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleOpenDeleteModal(cls)}
                            title="Xóa lớp học"
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 border-top bg-white">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredClasses.length}
            entriesPerPage={entriesPerPage}
            itemLabel="classes"
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* ADD CLASS MODAL */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-collection-fill me-2" />
                  Mở lớp học mới (Admin Staff)
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                />
              </div>
              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Tên lớp học <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Toán 12 - Luyện thi Đại học..."
                        value={addForm.className}
                        onChange={(e) => setAddForm({ ...addForm, className: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Môn học <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={addForm.subjectId}
                        onChange={(e) => setAddForm({ ...addForm, subjectId: Number(e.target.value) })}
                        required
                      >
                        {subjects.map((s) => (
                          <option key={s.subjectId} value={s.subjectId}>
                            {s.subjectName} ({s.subjectCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Phòng học phân bổ</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ví dụ: Phòng 301 - Tầng 3..."
                        value={addForm.room}
                        onChange={(e) => setAddForm({ ...addForm, room: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Học phí trọn khóa (VND)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="50000"
                        value={addForm.tuitionFee}
                        onChange={(e) => setAddForm({ ...addForm, tuitionFee: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày khai giảng <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={addForm.startDate}
                        onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày kết thúc dự kiến</label>
                      <input
                        type="date"
                        className="form-control"
                        value={addForm.endDate}
                        onChange={(e) => setAddForm({ ...addForm, endDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Trạng thái lớp</label>
                      <select
                        className="form-select"
                        value={addForm.status}
                        onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                      >
                        <option value="active">Active (Đang diễn ra)</option>
                        <option value="upcoming">Upcoming (Sắp khai giảng)</option>
                        <option value="inactive">Inactive (Tạm ngừng)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Mở lớp học"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CLASS MODAL */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-warning-subtle border-bottom">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-pencil-square me-2 text-warning" />
                  Chỉnh sửa lớp học: #CLS{editForm.classId}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Tên lớp học <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.className}
                        onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Môn học <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={editForm.subjectId}
                        onChange={(e) => setEditForm({ ...editForm, subjectId: Number(e.target.value) })}
                        required
                      >
                        {subjects.map((s) => (
                          <option key={s.subjectId} value={s.subjectId}>
                            {s.subjectName} ({s.subjectCode})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Phòng học phân bổ</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.room}
                        onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Học phí trọn khóa (VND)</label>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        step="50000"
                        value={editForm.tuitionFee}
                        onChange={(e) => setEditForm({ ...editForm, tuitionFee: Number(e.target.value) })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày khai giảng <span className="text-danger">*</span></label>
                      <input
                        type="date"
                        className="form-control"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Ngày kết thúc</label>
                      <input
                        type="date"
                        className="form-control"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Trạng thái lớp</label>
                      <select
                        className="form-select"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="active">Active (Đang diễn ra)</option>
                        <option value="upcoming">Upcoming (Sắp khai giảng)</option>
                        <option value="completed">Completed (Đã kết thúc)</option>
                        <option value="inactive">Inactive (Tạm ngừng)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn btn-warning px-4 fw-bold" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Cập nhật lớp học"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && classToDelete && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  Xác nhận xóa lớp học
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Bạn có chắc chắn muốn xóa lớp học sau khỏi hệ thống không?
                </p>
                <div className="p-3 bg-light rounded border mb-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="badge bg-primary font-monospace">#CLS{classToDelete.classId}</span>
                    <h6 className="fw-bold mb-0 text-dark">{classToDelete.className}</h6>
                  </div>
                  <div className="small text-muted mb-1">
                    Môn học: <strong className="text-dark">{classToDelete.subjectName} ({classToDelete.subjectCode})</strong>
                  </div>
                  <div className="small text-muted">
                    Phòng học: <strong className="text-dark">{classToDelete.room || "Chưa xếp phòng"}</strong>
                  </div>
                </div>
                <div className="alert alert-warning py-2 mb-0 small">
                  <i className="bi bi-info-circle me-1" />
                  Lưu ý: Không thể xóa lớp học nếu đã có học viên đăng ký tham gia hoặc lịch học đã phát sinh.
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                >
                  {submitting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL (GetById) */}
      {selectedClass && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-light border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6 font-monospace">
                    #CLS{selectedClass.classId}
                  </span>
                  <h5 className="modal-title fw-bold mb-0 text-dark">
                    Thông tin chi tiết lớp học
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedClass(null)}
                />
              </div>

              <div className="modal-body p-4">
                {loadingDetail ? (
                  <div className="text-center py-4 text-muted">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    Đang nạp chi tiết...
                  </div>
                ) : (
                  <>
                    <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom">
                      <div>
                        <h4 className="fw-bold mb-1 text-dark">{selectedClass.className}</h4>
                        <div className="d-flex align-items-center gap-2">
                          <SubjectBadge subject={selectedClass.subjectName || "Subject"} />
                          <DotStatusBadge status={selectedClass.status || "active"} />
                        </div>
                      </div>
                      <span className="fs-5 fw-bold text-primary">
                        {(selectedClass.tuitionFee || 0).toLocaleString("vi-VN")} VND
                      </span>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Mã môn học</small>
                          <strong className="text-dark font-monospace">{selectedClass.subjectCode || "—"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Phòng học phân bổ</small>
                          <strong className="text-dark">{selectedClass.room || "Chưa xếp phòng"}</strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Ngày khai giảng</small>
                          <strong className="text-dark">
                            {selectedClass.startDate ? new Date(selectedClass.startDate).toLocaleDateString("vi-VN") : "—"}
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <small className="text-muted d-block mb-1">Ngày kết thúc dự kiến</small>
                          <strong className="text-dark">
                            {selectedClass.endDate ? new Date(selectedClass.endDate).toLocaleDateString("vi-VN") : "Chưa xác định"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedClass(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
