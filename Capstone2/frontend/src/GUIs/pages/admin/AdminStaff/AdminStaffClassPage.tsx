import { useState, useEffect, useMemo } from "react";
import PageHeader from "../../../components/Common/PageHeader";
import DotStatusBadge from "../../../components/Common/DotStatusBadge";
import Pagination from "../../../components/Common/Pagination";
import TableToolbar from "../../../components/Common/TableToolbar";
import classDAL from "../../../../DAL/classDAL";
import type { ClassDto } from "../../../../BLL/models/ClassDto";

export default function AdminStaffClassPage() {
  const [classes, setClasses] = useState<ClassDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);

  // Modals
  const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New Class Form
  const [newClassName, setNewClassName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("Toán học");
  const [newRoom, setNewRoom] = useState("Phòng P.301");
  const [newTuitionFee, setNewTuitionFee] = useState("3500000");

  useEffect(() => {
    let isMounted = true;
    async function loadClasses() {
      try {
        setLoading(true);
        const res = await classDAL.getAllClasses();
        if (isMounted && res.data) {
          setClasses(res.data);
        }
      } catch (err) {
        console.warn("Lỗi tải danh sách lớp học:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadClasses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSearch =
        searchTerm === "" ||
        c.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.room && c.room.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(c.classId).includes(searchTerm);

      const matchSubject =
        selectedSubject === "All" ||
        (c.subjectName && c.subjectName.toLowerCase().includes(selectedSubject.toLowerCase()));

      return matchSearch && matchSubject;
    });
  }, [classes, searchTerm, selectedSubject]);

  // Pagination
  const totalItems = filteredClasses.length;
  const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredClasses.slice(start, start + entriesPerPage);
  }, [filteredClasses, currentPage, entriesPerPage]);

  // Handle View Class (GetById)
  const handleViewClass = async (classId: number) => {
    try {
      const detail = await classDAL.getClassById(classId);
      setSelectedClass(detail);
    } catch (err) {
      console.warn("Lỗi nạp chi tiết lớp học:", err);
    }
  };

  // Handle Add Class Submit
  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newId = classes.length > 0 ? Math.max(...classes.map((c) => c.classId)) + 1 : 10;
    const newClassObj: ClassDto = {
      classId: newId,
      className: newClassName.trim(),
      subjectId: 1,
      subjectCode: "MATH",
      subjectName: newSubjectName,
      room: newRoom,
      tuitionFee: Number(newTuitionFee) || 3000000,
      startDate: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setClasses((prev) => [newClassObj, ...prev]);
    setIsAddClassModalOpen(false);
    setNewClassName("");
    setActionSuccessMsg(`Đã mở thêm lớp học mới: "${newClassObj.className}" thành công!`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <>
      {/* Breadcrumb and Quick Access */}
      <PageHeader
        title="Quản Lý Lớp Học &amp; Khóa Đào Tạo (Class Management)"
        breadcrumbItems={[
          { label: "Admin Staff", path: "/admin-staff" },
          { label: "Classes" },
        ]}
        action={
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setIsAddClassModalOpen(true)}
          >
            <i className="bi bi-plus-square-fill" />
            Mở lớp học mới
          </button>
        }
      />

      {loading && (
        <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
          <div className="spinner-border spinner-border-sm" role="status" />
          <span>Đang nạp danh sách lớp học và giáo viên phụ trách...</span>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-3" role="alert">
          <i className="bi bi-check-circle-fill me-2" />
          {actionSuccessMsg}
          <button type="button" className="btn-close" onClick={() => setActionSuccessMsg(null)} />
        </div>
      )}

      {/* Class Filters */}
      <div className="card user-list-card mb-4 border-0">
        <div className="card-header user-list-header">
          <div className="row g-3 align-items-center">
            <div className="col-xl-5 col-lg-6">
              <div className="user-search">
                <i className="bi bi-search" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm theo tên lớp, phòng học hoặc mã lớp..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-xl-3 col-lg-3 col-md-6">
              <select
                className="form-select"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Tất cả môn học</option>
                <option value="Toán">Toán học (Math)</option>
                <option value="Vật lý">Vật lý (Physics)</option>
                <option value="Hóa học">Hóa học (Chemistry)</option>
                <option value="Tiếng Anh">Tiếng Anh (English)</option>
              </select>
            </div>
            <div className="col-xl-4 col-lg-3 col-md-6 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("All");
                  setCurrentPage(1);
                }}
              >
                <i className="bi bi-arrow-clockwise" /> Đặt lại bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Table Controls */}
        <TableToolbar
          totalItems={totalItems}
          totalLabel="Tổng số lớp học"
          entriesPerPage={entriesPerPage}
          onEntriesPerPageChange={(value) => {
            setEntriesPerPage(value);
            setCurrentPage(1);
          }}
        />

        {/* Class Table */}
        <div className="table-responsive">
          <table className="table user-table align-middle mb-0">
            <thead>
              <tr>
                <th className="fw-bold">Mã Lớp</th>
                <th className="fw-bold">Tên Lớp Học</th>
                <th className="fw-bold">Môn Học</th>
                <th className="fw-bold">Phòng Học</th>
                <th className="fw-bold">Mức Học Phí / Tháng</th>
                <th className="fw-bold">Giáo Viên Phụ Trách</th>
                <th className="fw-bold">Trạng Thái</th>
                <th className="text-center fw-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClasses.length > 0 ? (
                paginatedClasses.map((c, idx) => {
                  const isActive = c.status?.toLowerCase() === "active" || c.status === "Đang học";
                  const teacherName = idx % 2 === 0 ? "ThS. Hoàng Quốc Việt" : "ThS. Huỳnh Khánh Duy";
                  const feeStr = c.tuitionFee ? `${c.tuitionFee.toLocaleString("vi-VN")} đ` : "3.500.000 đ";

                  return (
                    <tr key={c.classId}>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">
                          #{c.classId}
                        </span>
                      </td>
                      <td>
                        <strong className="text-dark d-block">{c.className}</strong>
                        <small className="text-muted">Khai giảng: {c.startDate || "01/09/2026"}</small>
                      </td>
                      <td>
                        <span className="badge bg-info bg-opacity-10 text-info px-2.5 py-1">
                          {c.subjectName || "Toán học"}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary small">
                          <i className="bi bi-geo-alt me-1 text-muted" />
                          {c.room || "Phòng P.301"}
                        </span>
                      </td>
                      <td>
                        <strong className="text-dark">{feeStr}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <div
                            className="rounded-circle bg-light text-primary fw-bold d-flex align-items-center justify-content-center"
                            style={{ width: "26px", height: "26px", fontSize: "11px", border: "1px solid #dee2e6" }}
                          >
                            TC
                          </div>
                          <span className="small">{teacherName}</span>
                        </div>
                      </td>
                      <td>
                        <DotStatusBadge status={isActive ? "Active" : "Inactive"} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                          onClick={() => handleViewClass(c.classId)}
                        >
                          <i className="bi bi-eye" /> Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    Không tìm thấy lớp học nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white border-top py-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <small className="text-muted">
            Hiển thị {paginatedClasses.length} trên tổng {totalItems} lớp
          </small>
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            entriesPerPage={entriesPerPage}
            itemLabel="classes"
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* DETAIL MODAL (GetById) */}
      {selectedClass && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-collection-fill text-primary" />
                  Chi Tiết Lớp Học: {selectedClass.className}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedClass(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Mã lớp học</label>
                    <span className="fw-bold text-primary">#{selectedClass.classId}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Trạng thái lớp</label>
                    <DotStatusBadge status={selectedClass.status || "Active"} />
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Tên lớp đào tạo</label>
                    <span className="fw-bold text-dark">{selectedClass.className}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Môn học</label>
                    <span className="badge bg-info bg-opacity-10 text-info">{selectedClass.subjectName || "Toán học"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Phòng học</label>
                    <span className="fw-semibold text-dark">{selectedClass.room || "Phòng P.301"}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Mức học phí niêm yết</label>
                    <span className="fw-bold text-success">
                      {selectedClass.tuitionFee ? `${selectedClass.tuitionFee.toLocaleString("vi-VN")} đ / tháng` : "3.500.000 đ / tháng"}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Giáo viên phụ trách</label>
                    <span className="fw-semibold text-dark">ThS. Hoàng Quốc Việt</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Trợ giảng (TA)</label>
                    <span className="fw-semibold text-dark">Âu Dương Tài</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedClass(null)}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CLASS MODAL (POPUP) */}
      {isAddClassModalOpen && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-plus-square-fill" />
                  Mở Lớp Học Mới
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setIsAddClassModalOpen(false)}
                />
              </div>
              <form onSubmit={handleAddClassSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Tên lớp học *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="VD: Toán 12 Nâng Cao Cấp Tốc"
                      required
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Môn học</label>
                      <select
                        className="form-select"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                      >
                        <option value="Toán học">Toán học</option>
                        <option value="Vật lý">Vật lý</option>
                        <option value="Hóa học">Hóa học</option>
                        <option value="Tiếng Anh">Tiếng Anh</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Phòng học</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="VD: Phòng P.202"
                        value={newRoom}
                        onChange={(e) => setNewRoom(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Học phí (VND/tháng) *</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="3500000"
                      required
                      value={newTuitionFee}
                      onChange={(e) => setNewTuitionFee(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsAddClassModalOpen(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1">
                    <i className="bi bi-check-lg" /> Lưu lớp học
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
